// server/src/forecast.ts
// Turns OpenWeather's 5-day / 3-hour forecast (40 readings) into:
//  - the next 24 hours (8 readings, 3 hours apart), and
//  - one summary per day: high, low, highest chance of rain, and the
//    conditions closest to midday.
// Days are grouped by the CITY's local date (using its UTC offset), not the
// server's, otherwise a Tokyo forecast computed on a US server shifts a day.

export type ForecastItem = {
  dt: number; // unix seconds, UTC
  main: { temp: number; temp_min?: number; temp_max?: number };
  weather: { icon: string; main: string }[];
  pop?: number; // probability of precipitation, 0..1
};

export type HourlyItem = { dt: number; temp: number; icon: string; pop: number };
export type DailyItem = {
  date: number; // dt of the reading used for the day's icon
  max: number;
  min: number;
  temp: number; // kept for older clients: same as max
  icon: string;
  condition: string;
  pop: number;
};

/** "YYYY-MM-DD" and hour-of-day in the city's local time. */
export function cityLocal(dt: number, tzOffsetSec: number) {
  const d = new Date((dt + tzOffsetSec) * 1000);
  return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours() };
}

export function toHourly(list: ForecastItem[]): HourlyItem[] {
  return list.slice(0, 8).map((item) => ({
    dt: item.dt,
    temp: item.main.temp,
    icon: item.weather[0]?.icon ?? "01d",
    pop: item.pop ?? 0,
  }));
}

export function toDaily(list: ForecastItem[], tzOffsetSec: number, days = 5): DailyItem[] {
  const groups = new Map<string, ForecastItem[]>();
  for (const item of list) {
    const { day } = cityLocal(item.dt, tzOffsetSec);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(item);
  }
  return [...groups.values()].slice(0, days).map((items) => {
    const temps = items.flatMap((i) => [i.main.temp, i.main.temp_max ?? i.main.temp, i.main.temp_min ?? i.main.temp]);
    // The reading nearest to 13:00 local time best represents "the day".
    const midday = items.reduce((best, i) =>
      Math.abs(cityLocal(i.dt, tzOffsetSec).hour - 13) < Math.abs(cityLocal(best.dt, tzOffsetSec).hour - 13) ? i : best
    );
    const max = Math.max(...temps);
    return {
      date: midday.dt,
      max,
      min: Math.min(...temps),
      temp: max,
      icon: (midday.weather[0]?.icon ?? "01d").replace("n", "d"), // daily view uses day icons
      condition: midday.weather[0]?.main ?? "",
      pop: Math.max(...items.map((i) => i.pop ?? 0)),
    };
  });
}
