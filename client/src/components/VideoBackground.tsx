// client/src/components/VideoBackground.tsx
import { useEffect, useState } from 'react';
import { getWeatherAsset, calculateIsDay } from '../utils/videoMap';

interface WeatherAsset {
  poster: string;
  video: string;
}

interface VideoBackgroundProps {
  weatherId: number | null; 
  dt?: number;              
  sunrise?: number;         
  sunset?: number;          
}

const VideoBackground = ({ weatherId, dt, sunrise, sunset }: VideoBackgroundProps) => {
  const [currentAsset, setCurrentAsset] = useState<WeatherAsset | null>(null);
  const [nextAsset, setNextAsset] = useState<WeatherAsset | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // 1. Calculate Day/Night
    const currentIsDay = (dt && sunrise && sunset) 
      ? calculateIsDay(dt, sunrise, sunset) 
      : true;

    // 2. Determine the NEW target asset
    if (weatherId !== null) {
      // FIX: We now pass ALL 5 arguments needed by videoMap.ts
      // We use || 0 to ensure we never pass undefined to the math functions
      const targetAsset = getWeatherAsset(
        weatherId, 
        currentIsDay, 
        dt || 0, 
        sunrise || 0, 
        sunset || 0
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
  }, [weatherId, dt, sunrise, sunset]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-50 bg-black">
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
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default VideoBackground;