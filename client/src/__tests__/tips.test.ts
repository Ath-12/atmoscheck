import { describe, expect, it } from "vitest";
import { weatherTips, type TipInput } from "../lib/tips";

const base: TipInput = { tempC: 24, feelsLikeC: 24, windKph: 10, aqi: 40, id: 800, dt: 1000, sunrise: 0, sunset: 5000,
  timezone: 0, hourly: [] };

describe("weather tips", () => {
  it("suggests an umbrella with the time when rain is likely", () => {
    const tips = weatherTips({ ...base, hourly: [{ dt: 0, pop: 0 }, { dt: 7200, pop: 0.6 }] });
    expect(tips[0]).toMatch(/umbrella: 60% chance of rain around 2 AM/);
  });
  it("warns about bad air", () => {
    expect(weatherTips({ ...base, aqi: 180 })).toContain("😷 Air is unhealthy: limit time outdoors.");
    expect(weatherTips({ ...base, aqi: null })).not.toEqual(expect.arrayContaining([expect.stringMatching(/Air/)]));
  });
  it("puts storms first and shows at most two tips", () => {
    const tips = weatherTips({ ...base, id: 211, aqi: 250, feelsLikeC: 40, windKph: 60 });
    expect(tips).toHaveLength(2);
    expect(tips[0]).toMatch(/Thunderstorms/);
  });
  it("has a friendly default", () => {
    expect(weatherTips(base)).toEqual(["😎 Pleasant weather: enjoy your day!"]);
    expect(weatherTips({ ...base, dt: 9000 })).toEqual(["🌙 Calm night: nothing to worry about."]);
  });
});
