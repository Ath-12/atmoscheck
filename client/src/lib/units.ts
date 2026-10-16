// client/src/lib/units.ts
export type Unit = "C" | "F";

export const toUnit = (celsius: number, unit: Unit) => (unit === "F" ? celsius * 9 / 5 + 32 : celsius);

/** Rounded temperature with degree sign, e.g. "27°" (unit shown by the toggle). */
export const fmtTemp = (celsius: number, unit: Unit) => `${Math.round(toUnit(celsius, unit))}°`;

/** Wind in km/h or mph to match the temperature unit. */
export const fmtWind = (kph: number, unit: Unit) =>
  unit === "F" ? { value: Math.round(kph / 1.609), label: "mph" } : { value: Math.round(kph), label: "km/h" };
