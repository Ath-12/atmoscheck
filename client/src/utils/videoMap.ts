// client/src/utils/videoMap.ts
// Picks the background picture for the current weather.
//
// Inputs: OpenWeather condition code (https://openweathermap.org/weather-conditions),
// country, current time, sunrise and sunset (all UTC seconds) and the city's
// UTC offset (for local hour and month).
//
// Rules are checked from most specific to most general:
//   1. golden hour: 45 min around sunrise / sunset with clear or cloudy skies
//   2. night versions (dark pictures whenever the sun is down)
//   3. day versions, with India-specific pictures where the weather looks
//      different there (monsoon clouds, heavy rain, dust, morning fog)

export type WeatherAsset = { poster: string };

const P = (name: string): WeatherAsset => ({ poster: `/posters/${name}.jpg` });
const GOLDEN_HOUR_SEC = 45 * 60;
const HEAVY_RAIN = [502, 503, 504, 522];

export const calculateIsDay = (dt: number, sunrise: number, sunset: number): boolean =>
  dt >= sunrise && dt < sunset;

/** Local hour (0-23) and month (1-12) in the city. */
export function localClock(dt: number, tzOffsetSec: number) {
  const d = new Date((dt + tzOffsetSec) * 1000);
  return { hour: d.getUTCHours(), month: d.getUTCMonth() + 1 };
}

export const getWeatherAsset = (
  weatherId: number,
  countryCode: string,
  dt: number,
  sunrise: number,
  sunset: number,
  tzOffsetSec = 0
): WeatherAsset => {
  const isDay = calculateIsDay(dt, sunrise, sunset);
  const isIndia = countryCode === 'IN';
  const { hour, month } = localClock(dt, tzOffsetSec);
  const isClearOrCloudy = weatherId >= 800;

  // --- 1. Golden hour ---
  if (isClearOrCloudy && Math.abs(dt - sunrise) <= GOLDEN_HOUR_SEC) return P('sunrise');
  if (isClearOrCloudy && Math.abs(dt - sunset) <= GOLDEN_HOUR_SEC) {
    return weatherId >= 802 ? P('clouds-sunset') : P('sunset');
  }

  // --- 2. Night (dark pictures whenever the sun is down) ---
  if (!isDay) {
    if (weatherId >= 200 && weatherId < 300) return P('thunder-night');
    if (weatherId >= 300 && weatherId < 600) {
      return HEAVY_RAIN.includes(weatherId) && isIndia ? P('rain-heavy-night') : P('rain-night');
    }
    if (weatherId >= 600 && weatherId < 700) return P('snow-night');
    if (weatherId >= 700 && weatherId < 800) return P('fog-night'); // the "Mumbai 4 AM" fix
    if (weatherId === 800) return P('clear-night');
    return P('partly-cloudy-night');
  }

  // --- 3. Day ---
  if (weatherId >= 200 && weatherId < 300) return P('thunder');
  if (weatherId >= 300 && weatherId < 400) return P('drizzle');
  if (weatherId >= 500 && weatherId < 600) {
    if (HEAVY_RAIN.includes(weatherId)) return isIndia ? P('rain-heavy-day') : P('storm');
    return P('rain');
  }
  if (weatherId >= 600 && weatherId < 700) return P('snow');
  if (weatherId >= 700 && weatherId < 800) {
    if (weatherId === 771) return P('windy');                       // squalls
    if (weatherId === 781) return P('storm');                       // tornado
    if ([731, 751, 761].includes(weatherId)) return isIndia ? P('dust-day-india') : P('dust');
    if ([711, 721].includes(weatherId)) return P('haze');           // smoke / haze
    if (isIndia && hour < 10) return P('fog-morning-india');        // mist / fog early in the day
    if (weatherId === 701) return P('mist-hills-day');
    return P('fog');
  }
  if (weatherId === 800) return isIndia ? P('sunny-tropical-day') : P('clear-day');
  if (weatherId === 801 || weatherId === 802) return P('partly-cloudy-day');
  // 803-804 overcast: monsoon skies in India from June to September
  if (isIndia && month >= 6 && month <= 9) return P('clouds-monsoon');
  return P('clouds');
};
