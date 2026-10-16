// server/src/aqi.ts
// Air quality (US AQI, 0-500) from two sources:
//   1. WAQI: ground monitoring stations, closest to what you "see" locally.
//      Needs WAQI_KEY. Some stations report "-" when they have no reading.
//   2. Open-Meteo: model-based, free, no key. Used when WAQI has nothing.
// If both fail, the weather is still returned and the card says "unavailable".
import type { AxiosInstance } from "axios";

export type Aqi = { aqi: number | null; pm25: number | null; source: "station" | "model" | null };

const isReading = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

/** Read a WAQI /feed response. Returns null when there is no usable reading. */
export function readWaqi(json: any): Aqi | null {
  if (json?.status !== "ok" || !isReading(json?.data?.aqi)) return null;
  const pm25 = json.data.iaqi?.pm25?.v;
  return { aqi: json.data.aqi, pm25: isReading(pm25) ? pm25 : null, source: "station" };
}

/** Read an Open-Meteo air-quality response. */
export function readOpenMeteo(json: any): Aqi | null {
  const aqi = json?.current?.us_aqi;
  if (!isReading(aqi)) return null;
  const pm25 = json.current.pm2_5;
  return { aqi: Math.round(aqi), pm25: isReading(pm25) ? pm25 : null, source: "model" };
}

export async function getAqi(http: AxiosInstance, lat: number, lon: number, waqiKey?: string): Promise<Aqi> {
  if (waqiKey) {
    try {
      const res = await http.get(`https://api.waqi.info/feed/geo:${lat};${lon}/`, { params: { token: waqiKey } });
      const reading = readWaqi(res.data);
      if (reading) return reading;
    } catch {
      console.error("WAQI unavailable, trying Open-Meteo");
    }
  }
  try {
    const res = await http.get("https://air-quality-api.open-meteo.com/v1/air-quality", {
      params: { latitude: lat, longitude: lon, current: "us_aqi,pm2_5" },
    });
    const reading = readOpenMeteo(res.data);
    if (reading) return reading;
  } catch {
    console.error("Open-Meteo air quality unavailable");
  }
  return { aqi: null, pm25: null, source: null };
}
