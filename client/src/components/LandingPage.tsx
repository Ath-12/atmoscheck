// client/src/components/LandingPage.tsx
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Zap, Search, ArrowRight } from 'lucide-react'; 

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-white font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="z-10 flex flex-col items-center space-y-10 px-4">
        
        {/* LOGO */}
        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50" />
            <CloudRain className="w-24 h-24 text-white relative z-10" />
            <Zap className="w-8 h-8 text-yellow-400 absolute bottom-2 right-1 z-20 animate-bounce" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent mt-4">
            AtmosCheck
          </h1>
          <p className="text-blue-200/60 font-medium tracking-widest uppercase text-sm">
            Check the sky.
          </p>
        </div>

        {/* SEARCH INPUT + BUTTON */}
        <div className="w-full max-w-[450px] relative group animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
          <div className="relative flex items-center">
            <Search className="absolute left-6 w-5 h-5 text-white/40" />
            
            <input
              autoFocus
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a city..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-14 pr-16 py-4 text-xl outline-none focus:bg-white/10 focus:border-blue-400/50 transition-all placeholder:text-white/20 shadow-2xl"
            />
            
            {/* NEW SEARCH BUTTON */}
            <button 
              onClick={handleSearch}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors shadow-lg group-focus-within:bg-blue-500"
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Glow Ring */}
          <div className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/40 pointer-events-none transition-all" />
        </div>
      </div>
    </div>
  );
}