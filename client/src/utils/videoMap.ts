// client/src/utils/videoMap.ts

export interface WeatherAsset {
  poster: string;
  video: string;
}

export const getWeatherAsset = (
  id: number, 
  isDay: boolean, 
  dt: number, 
  sunrise: number, 
  sunset: number
): WeatherAsset => {
  let assetName = "clear-day";

  // --- 1. SPECIAL TIME CHECKS (Sunrise / Sunset) ---
  // If we are within 45 mins of sunrise/sunset, show those special assets
  const isSunrise = dt >= sunrise - 2700 && dt <= sunrise + 2700;
  const isSunset = dt >= sunset - 2700 && dt <= sunset + 2700;

  // --- 2. CONDITION MAPPING ---
  
  // Group 2xx: Thunderstorm
  if (id >= 200 && id <= 232) {
    assetName = isDay ? "thunder" : "thunder-night";
  }
  
  // Group 3xx: Drizzle
  else if (id >= 300 && id <= 321) {
    assetName = "drizzle";
  }

  // Group 5xx: Rain
  else if (id >= 500 && id <= 531) {
    // 502, 503, 504 are Heavy Rain
    if (id === 502 || id === 503 || id === 504) {
      assetName = isDay ? "rain-heavy-day" : "rain-heavy-night";
    } else {
      assetName = isDay ? "rain" : "rain-night";
    }
  }

  // Group 6xx: Snow
  else if (id >= 600 && id <= 622) {
    assetName = isDay ? "snow" : "snow-night";
  }

  // Group 7xx: Atmosphere (Fog, Dust, Haze)
  else if (id >= 701 && id <= 781) {
    if (!isDay) {
      assetName = "fog-night"; // General night fog for all 7xx at night
    } else {
      if (id === 711) assetName = "haze"; // Smoke
      else if (id === 721) assetName = "haze"; // Haze
      else if (id === 731 || id === 751 || id === 761) assetName = "dust-day-india"; // Dust
      else assetName = "mist-hills-day"; // Fog/Mist (defaulting to the nice hills one)
    }
  }

  // Group 800: Clear
  else if (id === 800) {
    if (isSunrise) assetName = "sunrise";
    else if (isSunset) assetName = "sunset";
    else assetName = isDay ? "clear-day" : "clear-night";
  }

  // Group 80x: Clouds
  else if (id > 800) {
    if (id === 801 || id === 802) {
      // Few/Scattered Clouds
      assetName = isDay ? "partly-cloudy-day" : "partly-cloudy-night";
    } else {
      // Broken/Overcast Clouds
      if (isSunset) assetName = "clouds-sunset"; // Special cloudy sunset
      else assetName = isDay ? "clouds-monsoon" : "clouds"; // Dramatic clouds for day
    }
  }

  return {
    poster: `/posters/${assetName}.jpg`,
    video: `/videos/${assetName}.webm`,
  };
};

export const calculateIsDay = (dt: number, sunrise: number, sunset: number): boolean => {
  return dt >= sunrise && dt < sunset;
};