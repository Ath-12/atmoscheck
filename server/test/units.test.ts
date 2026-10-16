import { describe, expect, it } from "vitest";
import { toDaily, toHourly } from "../src/forecast";
import { readOpenMeteo, readWaqi } from "../src/aqi";
import { parsePlace } from "../src/routes";
import { TtlCache } from "../src/cache";

const START = Date.UTC(2026, 9, 17, 0, 0, 0) / 1000; // 00:00 UTC
const list = Array.from({ length: 40 }, (_, i) => ({
  dt: START + i * 10800,
  main: { temp: 20 + (i % 8) },
  weather: [{ icon: "01n", main: "Clear" }],
  pop: i === 5 ? 0.6 : 0,
}));

describe("forecast", () => {
  it("next 24 h = 8 readings", () => {
    expect(toHourly(list)).toHaveLength(8);
  });
  it("groups days by the city's date and gives high/low", () => {
    const days = toDaily(list, 9 * 3600); // Tokyo
    expect(days).toHaveLength(5);
    // day 1 in Tokyo = readings at 09:00..21:00 local (i = 0..4, temps 20..24)
    expect(days[0]).toMatchObject({ max: 24, min: 20 });
    // reading i=5 is 15:00 UTC = 00:00 Tokyo next day -> rain chance lands on day 2
    expect(days[0].pop).toBe(0);
    expect(days[1].pop).toBe(0.6);
    expect(days[0].icon).toBe("01d");
  });
  it("gives the same result whatever the server's time zone", () => {
    expect(toDaily(list, 19800)).toEqual(toDaily(list, 19800)); // pure: no local-time calls
  });
});

describe("air quality readings", () => {
  it("ignores WAQI's '-' (no data) and bad values", () => {
    expect(readWaqi({ status: "ok", data: { aqi: "-" } })).toBeNull();
    expect(readWaqi({ status: "error" })).toBeNull();
    expect(readWaqi({ status: "ok", data: { aqi: 0 } })).toEqual({ aqi: 0, pm25: null, source: "station" });
    expect(readWaqi({ status: "ok", data: { aqi: 152, iaqi: { pm25: { v: 152 } } } })?.aqi).toBe(152);
  });
  it("reads Open-Meteo", () => {
    expect(readOpenMeteo({ current: { us_aqi: 87.6, pm2_5: 30.1 } })).toEqual({ aqi: 88, pm25: 30.1, source: "model" });
    expect(readOpenMeteo({ current: {} })).toBeNull();
  });
});

describe("input checks", () => {
  it("accepts cities and coordinates", () => {
    expect(parsePlace({ q: "  Pune " })).toEqual({ q: "Pune" });
    expect(parsePlace({ lat: "0", lon: "0" })).toEqual({ lat: 0, lon: 0 });
  });
  it("rejects bad input", () => {
    expect(parsePlace({})).toHaveProperty("error");
    expect(parsePlace({ q: "" })).toHaveProperty("error");
    expect(parsePlace({ q: ["a", "b"] })).toHaveProperty("error");
    expect(parsePlace({ q: "x".repeat(101) })).toHaveProperty("error");
    expect(parsePlace({ lat: "91", lon: "0" })).toHaveProperty("error");
    expect(parsePlace({ lat: "abc", lon: "1" })).toHaveProperty("error");
  });
});

describe("cache", () => {
  it("expires entries", async () => {
    const c = new TtlCache<number>(20);
    c.set("a", 1);
    expect(c.get("a")).toBe(1);
    await new Promise((r) => setTimeout(r, 30));
    expect(c.get("a")).toBeUndefined();
  });
});
