// client/src/components/VideoBackground.tsx
import { useEffect, useState } from 'react';
import { getWeatherAsset } from '../utils/videoMap';

interface WeatherAsset {
  poster: string;
  video: string;
}

interface VideoBackgroundProps {
  weatherId: number | null;
  countryCode: string; // NEW PROP defined here
  dt?: number;
  sunrise?: number;
  sunset?: number;
}

const VideoBackground = ({ weatherId, countryCode, dt, sunrise, sunset }: VideoBackgroundProps) => {
  const [currentAsset, setCurrentAsset] = useState<WeatherAsset | null>(null);
  const [nextAsset, setNextAsset] = useState<WeatherAsset | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (weatherId !== null && dt && sunrise && sunset) {
      // Pass countryCode to the function
      const targetAsset = getWeatherAsset(
        weatherId,
        countryCode, 
        dt,
        sunrise,
        sunset
      ) as WeatherAsset;

      if (!currentAsset) {
        setCurrentAsset(targetAsset);
        return;
      }

      if (targetAsset.poster !== currentAsset.poster) {
        setNextAsset(targetAsset);
        setIsTransitioning(true);
        
        const timer = setTimeout(() => {
          setCurrentAsset(targetAsset);
          setNextAsset(null);
          setIsTransitioning(false);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [weatherId, countryCode, dt, sunrise, sunset]); // Add countryCode to dependency array

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-50 bg-black">
      {/* We only use posters for now as requested, video tag is commented out but ready */}
      {/* {currentAsset && (
        <video
          key={currentAsset.video}
          autoPlay
          muted
          loop
          playsInline
          poster={currentAsset.poster}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        >
          <source src={currentAsset.video} type="video/webm" />
        </video>
      )} */}
      
      {currentAsset && (
        <img src={currentAsset.poster} alt="Current Weather" className="absolute inset-0 w-full h-full object-cover" />
      )}
      
      {nextAsset && (
        <img 
          key={nextAsset.poster}
          src={nextAsset.poster} 
          alt="New Weather" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};

export default VideoBackground;