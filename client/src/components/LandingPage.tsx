// client/src/components/LandingPage.tsx
import { useState } from 'react';
// FIX: Type-only import for KeyboardEvent
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="z-10 flex flex-col items-center space-y-12">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <img 
              src="/logo.png" 
              alt="AtmosCheck Logo" 
              className="w-auto h-40 object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-blue-200/60 font-medium tracking-[0.3em] uppercase text-sm mt-4">
            Cinematic Weather Intelligence
          </p>
        </div>

        <div className="w-full max-w-[400px] relative group animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
          <input
            autoFocus
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a city..."
            className="w-[400px] bg-white/5 border border-white/10 rounded-full px-8 py-5 text-xl text-center outline-none focus:bg-white/10 focus:border-blue-400/50 transition-all placeholder:text-white/20 shadow-2xl"
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/40 pointer-events-none transition-all" />
        </div>
      </div>
    </div>
  );
}