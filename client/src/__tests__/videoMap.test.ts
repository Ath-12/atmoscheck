import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getWeatherAsset } from "../utils/videoMap";

const H = 3600;
const sunrise = 6 * H, sunset = 18 * H;            // a day starting at 00:00 UTC
const at = (hour: number) => hour * H;
const pick = (id: number, hour: number, country = "US", tz = 0) => getWeatherAsset(id, country, at(hour), sunrise, sunset, tz).poster;

describe("background picture", () => {
  it("uses golden-hour pictures around sunrise and sunset", () => {
    expect(pick(800, 6.5)).toBe("/posters/sunrise.jpg");
    expect(pick(800, 17.5)).toBe("/posters/sunset.jpg");
    expect(pick(804, 18.2)).toBe("/posters/clouds-sunset.jpg");
    expect(pick(500, 17.5)).toBe("/posters/rain.jpg");             // rain beats golden hour
  });
  it("always uses dark pictures at night (the 'Mumbai 4 AM' bug)", () => {
    expect(pick(721, 4, "IN")).toBe("/posters/fog-night.jpg");
    expect(pick(300, 23)).toBe("/posters/rain-night.jpg");         // drizzle at night
    expect(pick(800, 23)).toBe("/posters/clear-night.jpg");
  });
  it("uses India-specific pictures", () => {
    expect(pick(800, 12, "IN")).toBe("/posters/sunny-tropical-day.jpg");
    expect(pick(751, 12, "IN")).toBe("/posters/dust-day-india.jpg");
    expect(pick(741, 8, "IN")).toBe("/posters/fog-morning-india.jpg");
    // overcast in July (monsoon) vs January
    const july = Date.UTC(2026, 6, 15, 12) / 1000, jan = Date.UTC(2026, 0, 15, 12) / 1000;
    const day = (t: number) => getWeatherAsset(804, "IN", t, t - 6 * H, t + 6 * H, 0).poster;
    expect(day(july)).toBe("/posters/clouds-monsoon.jpg");
    expect(day(jan)).toBe("/posters/clouds.jpg");
  });
  it("only points at pictures that exist", () => {
    const ids = [200, 300, 500, 502, 600, 701, 711, 731, 741, 771, 781, 800, 801, 803];
    for (const id of ids) for (const hour of [3, 6.5, 8, 12, 17.5, 22]) for (const c of ["IN", "US"]) {
      const file = resolve(__dirname, "../../public", pick(id, hour, c).slice(1));
      expect(existsSync(file), file).toBe(true);
    }
  });
});
