// server/src/routes.ts
import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/weather", async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    const API_KEY = process.env.OPENWEATHER_KEY;

    // 1. Get Coordinates first (if searching by City)
    let latitude = lat;
    let longitude = lon;

    if (q) {
      const geoRes = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${API_KEY}`);
      if (!geoRes.data[0]) return res.status(404).json({ error: "City not found" });
      latitude = geoRes.data[0].lat;
      longitude = geoRes.data[0].lon;
    }

    // 2. Fetch Weather & Air Quality in parallel
    const [weatherRes, aqiRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`),
      axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
    ]);

    const data = weatherRes.data;
    const aqiData = aqiRes.data.list[0];

    // 3. Calculate Real AQI (US EPA Standard) using PM2.5
    // Formula approximation for PM2.5 (ug/m3) to AQI
    const pm25 = aqiData.components.pm2_5;
    let realAqi = 0;
    
    if (pm25 <= 12.0) realAqi = ((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0;
    else if (pm25 <= 35.4) realAqi = ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51;
    else if (pm25 <= 55.4) realAqi = ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101;
    else if (pm25 <= 150.4) realAqi = ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151;
    else if (pm25 <= 250.4) realAqi = ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201;
    else realAqi = ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301;

    res.json({
      city: data.name,
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
      // Pass the calculated Real AQI
      aqi: Math.round(realAqi), 
      // Pass raw PM2.5 just in case
      pm25: pm25 
    });

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;