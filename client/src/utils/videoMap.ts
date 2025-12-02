// client/src/utils/videoMap.ts

export const calculateIsDay = (dt: number, sunrise: number, sunset: number): boolean => {
  return dt >= sunrise && dt < sunset;
};

export const getWeatherAsset = (
  weatherId: number,
  countryCode: string,
  dt: number,
  sunrise: number,
  sunset: number
) => {
  const isDay = calculateIsDay(dt, sunrise, sunset);
  const isIndia = countryCode === 'IN';

  // --- 1. NIGHT OVERRIDES (Safety First) ---
  // If it is night, we generally want dark backgrounds regardless of subtle conditions.
  
  // Thunderstorm Night
  if (weatherId >= 200 && weatherId < 300 && !isDay) {
    return { poster: '/posters/thunder-night.jpg', video: '/videos/thunder.webm' };
  }
  
  // Rain Night
  if (weatherId >= 500 && weatherId < 600 && !isDay) {
    // Check for heavy rain at night
    if ([502, 503, 504, 522].includes(weatherId) && isIndia) {
       return { poster: '/posters/rain-heavy-night.jpg', video: '/videos/rain.webm' };
    }
    return { poster: '/posters/rain-night.jpg', video: '/videos/rain.webm' };
  }

  // Snow Night
  if (weatherId >= 600 && weatherId < 700 && !isDay) {
    return { poster: '/posters/snow-night.jpg', video: '/videos/snow.webm' };
  }

  // Atmosphere Night (Fog, Mist, Haze, Dust)
  // FIX: This was the Mumbai 4AM bug. We force ALL atmosphere codes to fog-night if it's dark.
  if (weatherId >= 700 && weatherId < 800 && !isDay) {
    return { poster: '/posters/fog-night.jpg', video: '/videos/fog.webm' };
  }

  // Clear/Clouds Night
  if (weatherId === 800 && !isDay) {
    return { poster: '/posters/clear-night.jpg', video: '/videos/clear-night.webm' };
  }
  if (weatherId > 800 && !isDay) {
    return { poster: '/posters/partly-cloudy-night.jpg', video: '/videos/clouds-night.webm' };
  }


  // --- 2. DAYTIME LOGIC ---

  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) {
    return { poster: '/posters/thunder.jpg', video: '/videos/thunder.webm' };
  }

  // Drizzle
  if (weatherId >= 300 && weatherId < 400) {
    return { poster: '/posters/drizzle.jpg', video: '/videos/rain.webm' };
  }

  // Rain
  if (weatherId >= 500 && weatherId < 600) {
    // Heavy Rain (India vs World)
    if ([502, 503, 504, 522].includes(weatherId)) {
      const poster = isIndia ? '/posters/rain-heavy-day.jpg' : '/posters/rain.jpg';
      return { poster, video: '/videos/rain.webm' };
    }
    return { poster: '/posters/rain.jpg', video: '/videos/rain.webm' };
  }

  // Snow
  if (weatherId >= 600 && weatherId < 700) {
    return { poster: '/posters/snow.jpg', video: '/videos/snow.webm' };
  }

  // Atmosphere (Fog, Haze, Dust)
  if (weatherId >= 700 && weatherId < 800) {
    // Dust/Sand
    if ([731, 751, 761].includes(weatherId)) {
      return { poster: isIndia ? '/posters/dust-day-india.jpg' : '/posters/dust.jpg', video: '/videos/fog.webm' };
    }
    // Haze / Smoke
    if ([711, 721].includes(weatherId)) {
      return { poster: '/posters/haze.jpg', video: '/videos/fog.webm' };
    }
    // Default Fog/Mist
    return { poster: '/posters/fog.jpg', video: '/videos/fog.webm' };
  }

  // Clear Day
  if (weatherId === 800) {
    return { poster: '/posters/clear-day.jpg', video: '/videos/clear-day.webm' };
  }

  // Clouds
  if (weatherId > 800) {
    // 801-802: Few Clouds
    if (weatherId === 801 || weatherId === 802) {
      return { poster: '/posters/partly-cloudy-day.jpg', video: '/videos/clouds-day.webm' };
    }
    // 803-804: Overcast (FIX: We used "overcast.jpg" before but file is "clouds.jpg")
    return { poster: '/posters/clouds.jpg', video: '/videos/clouds-day.webm' };
  }

  // Fallback
  return { poster: '/posters/clear-day.jpg', video: '/videos/clear-day.webm' };
};