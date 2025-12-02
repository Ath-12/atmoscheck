// server/src/routes.ts
import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/weather", async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    const API_KEY = process.env.OPENWEATHER_KEY;
    const WAQI_KEY = process.env.WAQI_KEY; // <--- New Key

    let latitude = lat;
    let longitude = lon;
    let correctCityName = null;
    let stateName = null;

    // 1. Geocoding
    if (q) {
      const geoRes = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${API_KEY}`);
      if (!geoRes.data[0]) return res.status(404).json({ error: "City not found" });
      
      latitude = geoRes.data[0].lat;
      longitude = geoRes.data[0].lon;
      correctCityName = geoRes.data[0].name;
      stateName = geoRes.data[0].state;
    }

    // 2. Fetch Weather & Forecast (OpenWeather)
    const [weatherRes, forecastRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`),
    ]);

    // 3. Fetch Accurate AQI (WAQI - Ground Station)
    // Fallback to Open-Meteo if no key provided
    let aqiVal = 0;
    let pm25Val = 0;

    if (WAQI_KEY) {
      try {
        const waqiRes = await axios.get(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${WAQI_KEY}`);
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
       const omRes = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5`);
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

    res.json({
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
    });

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;