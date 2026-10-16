// client/src/components/VideoBackground.tsx
// Full-screen background picture that matches the weather. When the weather
// changes (new search), the new picture fades in over the old one.
// (Named "Video" for history: video loops are planned; images are used now
// because they load much faster.)
import { useEffect, useMemo, useRef, useState } from 'react';
import { getWeatherAsset } from '../utils/videoMap';

interface WeatherAsset {
  poster: string;
}

interface VideoBackgroundProps {
  weatherId: number | null;
  countryCode: string;
  dt?: number;
  sunrise?: number;
  sunset?: number;
}

const FADE_MS = 1000;

const VideoBackground = ({ weatherId, countryCode, dt, sunrise, sunset }: VideoBackgroundProps) => {
  const target = useMemo<WeatherAsset | null>(
    () => (weatherId !== null && dt && sunrise && sunset
      ? getWeatherAsset(weatherId, countryCode, dt, sunrise, sunset)
      : null),
    [weatherId, countryCode, dt, sunrise, sunset]
  );

  const [currentAsset, setCurrentAsset] = useState<WeatherAsset | null>(null);
  const [nextAsset, setNextAsset] = useState<WeatherAsset | null>(null);
  // The picture currently on screen, readable inside the effect without
  // making the effect re-run every time it changes.
  const shown = useRef<WeatherAsset | null>(null);

  useEffect(() => {
    if (!target) return;
    if (!shown.current) {                  // first picture: show directly
      shown.current = target;
      setCurrentAsset(target);
      return;
    }
    if (target.poster === shown.current.poster) return;

    setNextAsset(target);                  // fades in on top (CSS animation)
    const timer = setTimeout(() => {
      shown.current = target;
      setCurrentAsset(target);
      setNextAsset(null);
    }, FADE_MS);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-50 bg-black">
      {currentAsset && (
        <img src={currentAsset.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {nextAsset && (
        <img
          key={nextAsset.poster}
          src={nextAsset.poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-[bg-fade-in_1s_ease-in-out_both]"
        />
      )}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};

export default VideoBackground;
