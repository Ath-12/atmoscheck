// Runs the real Express app with every outside service faked.
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const calls: string[] = [];
let geo: unknown[] = [{ lat: 18.52, lon: 73.85, name: "Pune", state: "Maharashtra" }];
let waqi: unknown = { status: "ok", data: { aqi: "-" } };
let failWeather = 0; // HTTP status to fail OpenWeather with, 0 = OK

const NOW = Date.UTC(2026, 9, 17, 6, 0, 0) / 1000;
vi.mock("axios", () => {
  const get = vi.fn(async (url: string, cfg: { params?: Record<string, unknown> }) => {
    calls.push(url + (cfg?.params ? "?" + new URLSearchParams(cfg.params as Record<string, string>) : ""));
    if (url.includes("/geo/")) return { data: geo };
    if (url.includes("/data/2.5/") && failWeather) {
      throw Object.assign(new Error("upstream"), { isAxiosError: true, response: { status: failWeather }, config: { url } });
    }
    if (url.endsWith("/weather")) {
      return { data: { name: "Pune", sys: { country: "IN", sunrise: NOW - 3600, sunset: NOW + 36000 }, timezone: 19800, dt: NOW,
        main: { temp: 30, feels_like: 33, humidity: 40, pressure: 1008 }, weather: [{ description: "clear sky", id: 800 }],
        wind: { speed: 5 }, visibility: 10000 } };
    }
    if (url.endsWith("/forecast")) {
      return { data: { list: Array.from({ length: 40 }, (_, i) => ({ dt: NOW + i * 10800, main: { temp: 25 + (i % 4) },
        weather: [{ icon: "01d", main: "Clear" }], pop: 0 })) } };
    }
    if (url.includes("waqi")) return { data: waqi };
    if (url.includes("open-meteo")) return { data: { current: { us_aqi: 64, pm2_5: 18 } } };
    throw new Error("unexpected url " + url);
  });
  const axios = { create: () => ({ get }), isAxiosError: (e: { isAxiosError?: boolean }) => !!e?.isAxiosError };
  return { default: axios, ...axios };
});

process.env.OPENWEATHER_KEY = "test-key";
process.env.WAQI_KEY = "test-waqi";
const { createApp } = await import("../src/index");

beforeEach(() => {
  calls.length = 0;
  geo = [{ lat: 18.52, lon: 73.85, name: "Pune", state: "Maharashtra" }];
  waqi = { status: "ok", data: { aqi: "-" } };
  failWeather = 0;
});

describe("GET /api/weather", () => {
  it("returns weather, 24 h, daily high/low and air quality", async () => {
    const app = createApp();
    const res = await request(app).get("/api/weather").query({ q: "Pune" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ city: "Pune", state: "Maharashtra", country: "IN", tempC: 30, windKph: 18 });
    expect(res.body.hourly).toHaveLength(8);
    expect(res.body.forecast[0]).toHaveProperty("max");
    // WAQI had no reading ('-') -> Open-Meteo used
    expect(res.body).toMatchObject({ aqi: 64, aqiSource: "model" });
  });

  it("encodes city names and uses https", async () => {
    await request(createApp()).get("/api/weather").query({ q: "Kitchener & Waterloo #1" });
    const geoCall = calls.find((c) => c.includes("/geo/"))!;
    expect(geoCall.startsWith("https://")).toBe(true);
    expect(geoCall).toContain("q=Kitchener+%26+Waterloo+%231");
  });

  it("answers repeat searches from the cache", async () => {
    const app = createApp();
    await request(app).get("/api/weather").query({ q: "Goa" });
    const before = calls.length;
    const res = await request(app).get("/api/weather").query({ q: "goa " });
    expect(res.headers["x-cache"]).toBe("HIT");
    expect(calls.length).toBe(before);
  });

  it("404 for an unknown city, 400 for bad input", async () => {
    geo = [];
    expect((await request(createApp()).get("/api/weather").query({ q: "Atlantiss" })).status).toBe(404);
    expect((await request(createApp()).get("/api/weather").query({ lat: "999", lon: "1" })).status).toBe(400);
  });

  it("502 with a short message when OpenWeather fails", async () => {
    failWeather = 401;
    const res = await request(createApp()).get("/api/weather").query({ q: "Delhi" });
    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/unavailable/);
  });
});

describe("security", () => {
  it("allows the real site and blocks other sites (CORS)", async () => {
    const app = createApp();
    const ok = await request(app).get("/api/health").set("Origin", "https://atmoscheck.vercel.app");
    expect(ok.headers["access-control-allow-origin"]).toBe("https://atmoscheck.vercel.app");
    const evil = await request(app).get("/api/health").set("Origin", "https://evil.example");
    expect(evil.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("rate-limits one visitor after 60 requests in 10 minutes", async () => {
    const app = createApp();
    let last = 0;
    for (let i = 0; i < 61; i++) last = (await request(app).get("/api/weather").query({ q: "Pune" })).status;
    expect(last).toBe(429);
  });

  it("health check needs no outside calls", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.body).toEqual({ ok: true });
    expect(calls).toHaveLength(0);
  });
});
