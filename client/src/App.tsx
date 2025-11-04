import { useEffect, useState } from "react";
import { fetchWeather } from "./lib/api";

type Bucket =
  | "clear" | "sunny" | "partly_cloudy" | "cloudy"
  | "rain" | "thunderstorm" | "snow" | "fog";

type Weather = {
  city: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  conditionText: string;
  bucket: Bucket;
};

export default function App() {
  const [w, setW] = useState<Weather | null>(null);
  const [q, setQ] = useState("Ratnagiri");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(city: string) {
    try {
      setErr(null);
      setLoading(true);
      const data = await fetchWeather({ q: city });
      setW(data);
    } catch (e: any) {
      console.error("Weather fetch failed:", e);
      setErr(e?.message ?? "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => { load(q); }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        <div className="max-w-md space-y-4">

          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search city"
              className="px-3 py-2 rounded bg-white/85 text-slate-900 w-full"
            />
            <button
              type="button"
              onClick={() => load(q)}
              className="px-4 rounded bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "…" : "Go"}
            </button>
          </div>

          {err && <div className="text-red-300">{err}</div>}

          {w && (
            <div className="rounded-xl bg-black/40 p-4 backdrop-blur space-y-2">
              <h2 className="text-xl font-semibold">{w.city}</h2>
              <div className="text-5xl font-bold">{Math.round(w.tempC)}°C</div>
              <div className="opacity-80 capitalize">{w.conditionText} • {w.bucket}</div>
              <div className="opacity-70 text-sm">
                Feels {Math.round(w.feelsLikeC)}°C • Humidity {w.humidity}% • Wind {Math.round(w.windKph)} km/h
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
