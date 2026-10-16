import { describe, expect, it } from "vitest";
import { fmtTemp, fmtWind } from "../lib/units";

describe("units", () => {
  it("converts temperatures", () => {
    expect(fmtTemp(0, "F")).toBe("32°");
    expect(fmtTemp(33.4, "F")).toBe("92°");
    expect(fmtTemp(-40, "F")).toBe("-40°");
    expect(fmtTemp(21.6, "C")).toBe("22°");
  });
  it("switches wind to mph with °F", () => {
    expect(fmtWind(16.09, "F")).toEqual({ value: 10, label: "mph" });
    expect(fmtWind(16.09, "C")).toEqual({ value: 16, label: "km/h" });
  });
});
