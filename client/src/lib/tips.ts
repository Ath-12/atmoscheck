// client/src/lib/tips.ts
// One or two practical tips worked out from the numbers on screen.
// No AI: simple, explainable rules, most important first.
import { hourLabel } from "./time";

export type TipInput = {
  tempC: number;
  feelsLikeC: number;
  windKph: number;
  aqi: number | null;
  id: number;              // OpenWeather condition code
  dt: number;
  sunrise: number;
  sunset: number;
  timezone: number;
  hourly: { dt: number; pop: number }[];
};

export function weatherTips(w: TipInput, max = 2): string[] {
  const tips: string[] = [];
  const isDay = w.dt >= w.sunrise && w.dt < w.sunset;
  const rainSoon = w.hourly.slice(0, 4).find((h) => h.pop >= 0.4); // next ~12 h

  if (w.id >= 200 && w.id < 300) tips.push("⛈️ Thunderstorms around: stay indoors if you can.");
  else if (w.id >= 300 && w.id < 600) tips.push("☂️ It's raining: take an umbrella.");
  else if (rainSoon) {
    tips.push(`☂️ Carry an umbrella: ${Math.round(rainSoon.pop * 100)}% chance of rain around ${hourLabel(rainSoon.dt, w.timezone)}.`);
  }

  if (w.aqi !== null && w.aqi > 200) tips.push("😷 Air is very unhealthy: avoid outdoor exercise, wear a mask outside.");
  else if (w.aqi !== null && w.aqi > 150) tips.push("😷 Air is unhealthy: limit time outdoors.");

  if (w.feelsLikeC >= 38) tips.push("🥵 Feels extremely hot: drink plenty of water and avoid the midday sun.");
  else if (w.feelsLikeC >= 32 && isDay) tips.push("🧴 Hot and sunny: sunscreen and water bottle.");
  else if (w.tempC <= 5) tips.push("🧣 Freezing: wear warm layers.");
  else if (w.tempC <= 14) tips.push("🧥 Chilly: bring a jacket.");

  if (w.windKph >= 40) tips.push("💨 Very windy: secure loose items, careful on two-wheelers.");

  if (tips.length === 0) tips.push(isDay ? "😎 Pleasant weather: enjoy your day!" : "🌙 Calm night: nothing to worry about.");
  return tips.slice(0, max);
}
