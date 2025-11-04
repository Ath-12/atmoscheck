export async function fetchWeather(params: { q?: string; lat?: number; lon?: number }) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.lat && params.lon) { qs.set("lat", String(params.lat)); qs.set("lon", String(params.lon)); }

  const res = await fetch(`http://localhost:5050/api/weather?` + qs.toString());
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}
