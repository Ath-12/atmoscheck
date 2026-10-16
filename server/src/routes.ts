// server/src/routes.ts
import { Router } from "express";
import axios from "axios";
import { TtlCache } from "./cache";

const router = Router();

// Every outside call gets a time limit, so a slow service can't hang a request.
const http = axios.create({ timeout: 8000 });

type Place = { q: string } | { lat: number; lon: number };

/** Check the query string before anything is sent to OpenWeather. */
export function parsePlace(query: Record<string, unknown>): Place | { error: string } {
  const { q, lat, lon } = query;
  if (q !== undefined) {
    if (typeof q !== "string" || !q.trim()) return { error: "Please enter a city name." };
    if (q.length > 100) return { error: "City name is too long." };
    return { q: q.trim() };
  }
  if (lat !== undefined && lon !== undefined) {
    const la = Number(lat), lo = Number(lon);
    if (typeof lat !== "string" || typeof lon !== "string" || !Number.isFinite(la) || !Number.isFinite(lo)
        || Math.abs(la) > 90 || Math.abs(lo) > 180) {
      return { error: "Invalid coordinates." };
    }
    return { lat: la, lon: lo };
  }
  return { error: "Provide a city (q) or coordinates (lat and lon)." };
}

// Same city within 10 minutes -> answered from memory, no OpenWeather call.
const weatherCache = new TtlCache<object>(10 * 60 * 1000);

router.get("/weather", async (req, res) => {
  try {
    const place = parsePlace(req.query);
    if ("error" in place) return res.status(400).json({ error: place.error });
    // Round coordinates (~1 km) so nearby GPS readings share a cache entry.
    const cacheKey = "q" in place
      ? `q:${place.q.toLowerCase()}`
      : `ll:${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;
    const cached = weatherCache.get(cacheKey);
    if (cached) {
      res.set("X-Cache", "HIT");
      return res.json(cached);
    }
    const API_KEY = process.env.OPENWEATHER_KEY;
    const WAQI_KEY = process.env.WAQI_KEY; // optional
    if (!API_KEY) {
      console.error("OPENWEATHER_KEY is not set");
      return res.status(500).json({ error: "Server is not configured." });
    }

    let latitude = "q" in place ? 0 : place.lat;
    let longitude = "q" in place ? 0 : place.lon;
    let correctCityName = null;
    let stateName = null;

    // 1. Geocoding (https, and values passed as params so axios encodes
    //    them: a name like "St. John's" or "A&B" can't break the URL)
    if ("q" in place) {
      const geoRes = await http.get("https://api.openweathermap.org/geo/1.0/direct", {
        params: { q: place.q, limit: 1, appid: API_KEY },
      });
      if (!geoRes.data[0]) return res.status(404).json({ error: "City not found" });
      
      latitude = geoRes.data[0].lat;
      longitude = geoRes.data[0].lon;
      correctCityName = geoRes.data[0].name;
      stateName = geoRes.data[0].state;
    }

    // 2. Fetch Weather & Forecast (OpenWeather)
    const [weatherRes, forecastRes] = await Promise.all([
      http.get("https://api.openweathermap.org/data/2.5/weather", {
        params: { lat: latitude, lon: longitude, appid: API_KEY, units: "metric" },
      }),
      http.get("https://api.openweathermap.org/data/2.5/forecast", {
        params: { lat: latitude, lon: longitude, appid: API_KEY, units: "metric" },
      }),
    ]);

    // 3. Fetch Accurate AQI (WAQI - Ground Station)
    // Fallback to Open-Meteo if no key provided
    let aqiVal = 0;
    let pm25Val = 0;

    if (WAQI_KEY) {
      try {
        const waqiRes = await http.get(`https://api.waqi.info/feed/geo:${latitude};${longitude}/`, { params: { token: WAQI_KEY } });
        if (waqiRes.data.status === 'ok') {
          aqiVal = waqiRes.data.data.aqi;
          // Try to find PM2.5 in specific pollutants, else default to AQI
          pm25Val = waqiRes.data.data.iaqi?.pm25?.v || aqiVal; 
        }
      } catch (err) {
        console.error("WAQI Error, falling back");
      }
    } 
    
    // Fallback: If WAQI failed or no key, use Open-Meteo (Satellite)
    if (aqiVal === 0) {
       const omRes = await http.get("https://air-quality-api.open-meteo.com/v1/air-quality", { params: { latitude, longitude, current: "us_aqi,pm2_5" } });
       aqiVal = omRes.data.current.us_aqi;
       pm25Val = omRes.data.current.pm2_5;
    }

    const data = weatherRes.data;
    const forecastList = forecastRes.data.list;

    // 4. Process Forecasts
    const hourlyForecast = forecastList.slice(0, 8).map((item: any) => ({
      dt: item.dt,
      temp: item.main.temp,
      icon: item.weather[0].icon,
      pop: item.pop
    }));

    const dailyForecast = [];
    const seenDates = new Set();
    for (const item of forecastList) {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!seenDates.has(date) && dailyForecast.length < 5) {
        seenDates.add(date);
        dailyForecast.push({
          date: item.dt,
          temp: item.main.temp,
          icon: item.weather[0].icon,
          condition: item.weather[0].main,
          pop: item.pop
        });
      }
    }

    const body = {
      city: correctCityName || data.name,
      state: stateName,
      country: data.sys.country,
      timezone: data.timezone,
      dt: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      tempC: data.main.temp,
      feelsLikeC: data.main.feels_like,
      conditionText: data.weather[0].description,
      id: data.weather[0].id,
      humidity: data.main.humidity,
      windKph: data.wind.speed * 3.6,
      pressure: data.main.pressure,
      visibility: data.visibility,
      aqi: aqiVal, // This will now match Google
      pm25: pm25Val,
      forecast: dailyForecast,
      hourly: hourlyForecast
    };
    weatherCache.set(cacheKey, body);
    res.set("X-Cache", "MISS");
    res.json(body);

  } catch (e: unknown) {
    // Log the real reason for the server logs, send a short message to the browser.
    if (axios.isAxiosError(e)) {
      console.error(`Upstream error: ${e.config?.url} -> ${e.response?.status ?? e.code}`);
      if (e.response?.status === 401) console.error("OpenWeather rejected the API key (expired or wrong?)");
      return res.status(502).json({ error: "Weather service is unavailable right now." });
    }
    console.error(e);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;