// client/src/lib/time.ts
// Show any timestamp in the *city's* local time, not the visitor's.
// OpenWeather gives times as UTC seconds plus the city's offset from UTC in
// seconds. Adding the offset and then formatting "as UTC" gives the city's
// wall-clock time, whatever time zone the visitor's device is in.

export function cityTime(
  unixSec: number,
  tzOffsetSec: number,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US"
): string {
  return new Date((unixSec + tzOffsetSec) * 1000).toLocaleString(locale, { ...options, timeZone: "UTC" });
}

export const clockTime = (unixSec: number, tz: number) =>
  cityTime(unixSec, tz, { hour: "numeric", minute: "2-digit", hour12: true });

export const clockDate = (unixSec: number, tz: number) =>
  cityTime(unixSec, tz, { weekday: "short", month: "short", day: "numeric" });

export const hourLabel = (unixSec: number, tz: number) => cityTime(unixSec, tz, { hour: "numeric", hour12: true });

export const weekday = (unixSec: number, tz: number) => cityTime(unixSec, tz, { weekday: "short" });
