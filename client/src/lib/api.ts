// client/src/lib/api.ts
// Talks to the AtmosCheck backend.
//
// The backend runs on Render's free plan, which puts the server to sleep
// after ~15 minutes without traffic. The first request after that waits
// while it wakes up (often 30-60 s) or fails. So this file:
//   - lets the landing page start waking the server early (warmUpServer),
//   - retries when the server can't be reached or is still starting,
//   - turns each failure into a clear message instead of "Location not found".

// Backend address. Set VITE_API_URL (e.g. in Vercel's environment variables)
// to point at a different server; otherwise dev uses the local server and
// production uses the Render deployment.
export const API_BASE: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? (import.meta.env.DEV ? "http://localhost:5050" : "https://atmoscheck.onrender.com");

export type WeatherErrorKind = "not-found" | "bad-request" | "rate-limited" | "unavailable";

export class WeatherError extends Error {
  kind: WeatherErrorKind;
  constructor(message: string, kind: WeatherErrorKind) {
    super(message);
    this.kind = kind;
  }
}

/** Fire-and-forget ping so a sleeping server starts waking up early. */
export function warmUpServer() {
  fetch(`${API_BASE}/api/health`).catch(() => {
    /* ignore: this is only a wake-up call */
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const RETRY_DELAYS_MS = [0, 4000, 8000]; // 3 attempts
const ATTEMPT_TIMEOUT_MS = 35000;        // Render can hold a request while waking up

export async function fetchWeather(params: { q?: string; lat?: number; lon?: number }) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  // "!= null" rather than a truthy check: 0 is a valid latitude/longitude
  // (equator / prime meridian) and must not be dropped.
  if (params.lat != null && params.lon != null) { qs.set("lat", String(params.lat)); qs.set("lon", String(params.lon)); }
  const url = `${API_BASE}/api/weather?${qs.toString()}`;

  let lastError = new WeatherError(
    "The weather server didn't respond. It may still be waking up. Please try again in a minute.",
    "unavailable"
  );

  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await sleep(delay);

    let res: Response;
    try {
      res = await fetchWithTimeout(url, ATTEMPT_TIMEOUT_MS);
    } catch {
      continue; // network error or timeout: server probably asleep, try again
    }

    if (res.ok) return res.json();

    const body = await res.json().catch(() => ({} as { error?: string }));
    if (res.status === 404) {
      throw new WeatherError(`Couldn't find "${params.q ?? "that place"}". Try "City, Country", e.g. "Ratnagiri, IN".`, "not-found");
    }
    if (res.status === 400) throw new WeatherError(body.error ?? "Please check your search.", "bad-request");
    if (res.status === 429) {
      throw new WeatherError(body.error ?? "Too many searches. Please wait a few minutes.", "rate-limited");
    }
    // 5xx: starting up or a temporary upstream problem -> retry
    lastError = new WeatherError(
      body.error ?? "The weather service is having trouble right now. Please try again shortly.",
      "unavailable"
    );
  }
  throw lastError;
}
