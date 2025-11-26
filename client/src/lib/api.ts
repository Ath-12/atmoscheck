// client/src/lib/api.ts
export async function fetchWeather(params: { q?: string; lat?: number; lon?: number }) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.lat && params.lon) { qs.set("lat", String(params.lat)); qs.set("lon", String(params.lon)); }

  // 🌍 LOGIC: 
  // If running on laptop (npm run dev) -> use localhost
  // If running on Vercel (Production) -> use your new Render URL
  const BASE_URL = import.meta.env.DEV 
    ? "http://localhost:5050/api/weather" 
    : "https://atmoscheck.onrender.com/api/weather"; 

  const res = await fetch(`${BASE_URL}?` + qs.toString());
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}