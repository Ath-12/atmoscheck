// client/src/components/LandingPage.tsx
import { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Wind, Zap } from 'lucide-react'; // Logo icons

export default function LandingPage() {
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (city.trim()) {
      navigate(`/weather?q=${city}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="z-10 flex flex-col items-center space-y-10">
        
        {/* LOGO DESIGN */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50" />
            <CloudRain className="w-24 h-24 text-white relative z-10" />
            <Zap className="w-8 h-8 text-yellow-400 absolute bottom-2 right-1 z-20 animate-bounce" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
            AtmosCheck
          </h1>
          <p className="text-blue-200/60 font-medium tracking-widest uppercase text-sm">
            Premium Cinematic Weather
          </p>
        </div>

        {/* SEARCH INPUT */}
        <div className="w-[400px] relative group">
          <input
            autoFocus
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a city..."
            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-xl text-center outline-none focus:bg-white/10 focus:border-blue-400/50 transition-all placeholder:text-white/20"
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/40 pointer-events-none transition-all" />
        </div>
      </div>
    </div>
  );
}