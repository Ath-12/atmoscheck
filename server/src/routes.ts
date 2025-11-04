import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/weather", async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    if ((!lat || !lon) && !q) return res.status(400).json({ error: "Provide lat/lon or q" });

    const API_KEY = process.env.OPENWEATHER_KEY;
    if (!API_KEY) return res.status(500).json({ error: "Missing OPENWEATHER_KEY on server" });

    const url = lat && lon
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      : `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${API_KEY}&units=metric`;

    const { data } = await axios.get(url);
    const code: number = data.weather?.[0]?.id ?? 800;

    res.json({
      city: data.name,
      tempC: data.main?.temp,
      feelsLikeC: data.main?.feels_like,
      humidity: data.main?.humidity,
      windKph: (data.wind?.speed ?? 0) * 3.6,
      conditionText: data.weather?.[0]?.description,
      conditionCode: code,
      bucket: mapOpenWeatherToBucket(code),
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      isDay: isDaytime(data.dt, data.sys?.sunrise, data.sys?.sunset)
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

function isDaytime(dt?: number, sr?: number, ss?: number) {
  if (!dt || !sr || !ss) return true;
  return dt >= sr && dt <= ss;
}

function mapOpenWeatherToBucket(code: number):
  "clear"|"sunny"|"partly_cloudy"|"cloudy"|"rain"|"thunderstorm"|"snow"|"fog" {

  if (code >= 200 && code < 300) return "thunderstorm";
  if (code >= 300 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "fog";
  if (code === 800) return "clear";
  if (code >= 801 && code <= 802) return "partly_cloudy";
  if (code >= 803) return "cloudy";
  return "cloudy";
}

export default router;
