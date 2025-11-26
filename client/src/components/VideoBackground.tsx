// client/src/components/VideoBackground.tsx
import { useEffect, useState } from 'react';
import { getWeatherAsset, calculateIsDay } from '../utils/videoMap';

// 1. Define Types Locally
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
  // We keep track of TWO assets to create a cross-fade
  const [currentAsset, setCurrentAsset] = useState<WeatherAsset | null>(null);
  const [nextAsset, setNextAsset] = useState<WeatherAsset | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    // 1. Calculate Day/Night
    const currentIsDay = (dt && sunrise && sunset) 
      ? calculateIsDay(dt, sunrise, sunset) 
      : true;
    setIsDay(currentIsDay);

    // 2. Determine the NEW target asset
    if (weatherId !== null) {
      const targetAsset = getWeatherAsset(weatherId, currentIsDay) as WeatherAsset;

      // If it's the very first load, set it immediately
      if (!currentAsset) {
        setCurrentAsset(targetAsset);
        return;
      }

      // If the asset is DIFFERENT from what we are showing, start transition
      if (targetAsset.poster !== currentAsset.poster) {
        setNextAsset(targetAsset);
        setIsTransitioning(true);
        
        // 3. WAIT for the fade animation (1000ms), then swap them
        const timer = setTimeout(() => {
          setCurrentAsset(targetAsset); // Old becomes New
          setNextAsset(null);           // Clear the "Next" slot
          setIsTransitioning(false);    // Reset transition
        }, 1000); // Must match the duration-1000 class below

        return () => clearTimeout(timer);
      }
    }
  }, [weatherId, dt, sunrise, sunset]); // Re-run when these change

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-50 bg-black">
      
      {/* LAYER 1: The OLD Image (Always Visible at the bottom) */}
      {currentAsset && (
        <img 
          src={currentAsset.poster} 
          alt="Current Weather" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* LAYER 2: The NEW Image (Fades in on top) */}
      {/* We only render this if we are transitioning */}
      {nextAsset && (
        <img 
          key={nextAsset.poster} // Force re-render for animation
          src={nextAsset.poster} 
          alt="New Weather" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* LAYER 3: Dark Overlay (For text readability) */}
      <div className="absolute inset-0 bg-black/20" />
      
    </div>
  );
};

export default VideoBackground;