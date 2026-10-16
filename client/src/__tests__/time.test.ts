import { describe, expect, it } from "vitest";
import { clockTime, hourLabel, weekday } from "../lib/time";

// 2026-10-17 03:00 UTC
const T = Date.UTC(2026, 9, 17, 3, 0, 0) / 1000;

describe("city time", () => {
  it("shows the city's local time, not the device's", () => {
    expect(clockTime(T, 32400)).toBe("12:00 PM");   // Tokyo UTC+9
    expect(clockTime(T, 19800)).toBe("8:30 AM");    // India UTC+5:30
    expect(clockTime(T, -14400)).toBe("11:00 PM");  // New York (EDT) UTC-4
  });
  it("crosses the date line correctly", () => {
    expect(weekday(T, 32400)).toBe("Sat");
    expect(weekday(T, -14400)).toBe("Fri");
  });
  it("labels hours", () => {
    expect(hourLabel(T, 32400)).toBe("12 PM");
  });
});
