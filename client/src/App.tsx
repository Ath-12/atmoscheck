// client/src/App.tsx
import { useEffect, useState } from "react";
import { fetchWeather } from "./lib/api";
import VideoBackground from "./components/VideoBackground";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Wind, Droplets, Eye, Sunrise, Sunset, 
  MapPin, Search, Leaf, ArrowLeft, Calendar, Loader2, Clock, Umbrella
} from "lucide-react";

type HourlyItem = {
  dt: number;
  temp: number;
  icon: string;
  pop: number;
};

type ForecastDay = {
  date: number;
  temp: number;
  condition: string;
  icon: string;
  pop: number;
};

type Weather = {
  city: string;
  state?: string; // State Name
  country: string;
  tempC: number;
  feelsLikeC: number;
  conditionText: string;
  humidity: number;
  windKph: number;
  pressure: number;
  visibility: number;
  aqi: number;
  pm25: number;
  id: number;
  dt: number;
  sunrise: number;
  sunset: number;
  timezone: number;
  forecast: ForecastDay[];
  hourly: HourlyItem[];
};

export default function App() {
  const [w, setW] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState<string>("--:--");
  const [clockDate, setClockDate] = useState<string>("");
  
  // FIX: Removed 'setSearchParams' because it was unused and causing the build error
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryCity = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const [inputCity, setInputCity] = useState(queryCity || "");

  async function loadData() {
    setLoading(true);
    setErr(null);
    try {
      let data;
      if (queryCity) {
        data = (await fetchWeather({ q: queryCity })) as Weather;
        setInputCity(queryCity);
      } else if (lat && lon) {
        data = (await fetchWeather({ lat: parseFloat(lat), lon: parseFloat(lon) })) as Weather;
        setInputCity(data.city);
      } else {
        data = (await fetchWeather({ q: "Mumbai" })) as Weather;
        setInputCity("Mumbai");
      }
      setW(data);
    } catch (e: any) {
      setErr("Location not found. Try searching 'City, State'.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [queryCity, lat, lon]);

  // Tab Title
  useEffect(() => {
    if (w) document.title = `${w.city} ${Math.round(w.tempC)}° | AtmosCheck`;
  }, [w]);

  // Clock
  useEffect(() => {
    if (!w) return;
    const tick = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const cityTime = new Date(utc + (w.timezone * 1000));
      setClockTime(cityTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setClockDate(cityTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [w]);

  const getAqiColor = (val: number) => {
    if (val <= 50) return "text-green-400";
    if (val <= 100) return "text-yellow-400";
    if (val <= 150) return "text-orange-400";
    if (val <= 200) return "text-red-400";
    if (val <= 300) return "text-purple-400";
    return "text-rose-900";
  };
  
  const getAqiStatus = (val: number) => {
    if (val <= 50) return "Good";
    if (val <= 100) return "Moderate";
    if (val <= 150) return "Sensitive";
    if (val <= 200) return "Unhealthy";
    if (val <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  return (
    <div className="min-h-screen text-white font-sans antialiased relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none scale-110"> 
        <VideoBackground 
          weatherId={w?.id ?? null} 
          countryCode={w?.country ?? 'IN'} 
          dt={w?.dt} 
          sunrise={w?.sunrise} 
          sunset={w?.sunset} 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen p-4 md:p-8">
        
        {/* Navigation */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="relative group w-full max-w-xs ml-4">
            <input
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') navigate(`/weather?q=${inputCity}`); }}
              placeholder="Search (e.g. Ratnagiri, MH)"
              className="w-full pl-4 pr-10 py-2 bg-black/20 border border-white/10 rounded-full backdrop-blur-md text-white outline-none focus:bg-black/40"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-white/50" />
          </div>
        </div>

        {loading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"><Loader2 className="w-12 h-12 animate-spin text-white" /></div>}
        {err && <div className="bg-red-500/50 px-6 py-2 rounded-full mb-4 backdrop-blur-md">{err}</div>}

        {w && !loading && (
          <div className="w-full max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* MAIN CARD */}
              <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between min-h-[300px] shadow-2xl">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight flex flex-wrap items-center gap-2">
                    <MapPin className="w-6 h-6 opacity-70" /> 
                    {/* Display: City, State, Country */}
                    {w.city}, {w.state && <span className="opacity-70 text-2xl">{w.state},</span>}
                    <span className="text-xl opacity-50">{w.country}</span>
                  </h1>
                  <p className="text-lg opacity-80 font-medium mt-1 flex items-center gap-2">
                     {clockDate} • {clockTime}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center my-4">
                  <span className="text-8xl font-thin tracking-tighter drop-shadow-xl">{Math.round(w.tempC)}°</span>
                  <span className="text-xl capitalize opacity-90 font-medium">{w.conditionText}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4 opacity-80">
                  <span>Feels like {Math.round(w.feelsLikeC)}°</span>
                  <span>Pressure {w.pressure} hPa</span>
                </div>
              </div>

              {/* AQI */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2 opacity-60 text-sm uppercase font-bold tracking-wider">
                  <Leaf className="w-4 h-4" /> Air Quality
                </div>
                <div className="mt-2">
                  <div className="text-4xl font-bold">{w.aqi}</div>
                  <div className={`text-lg font-medium ${getAqiColor(w.aqi)}`}>{getAqiStatus(w.aqi)}</div>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className={`h-full bg-current ${getAqiColor(w.aqi)}`} style={{ width: `${Math.min((w.aqi / 300) * 100, 100)}%` }} />
                </div>
              </div>

              {/* Wind / Hum / Vis / Sun */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 opacity-60 text-sm uppercase font-bold tracking-wider"><Wind className="w-4 h-4" /> Wind</div>
                <div className="text-3xl font-bold mt-2">{Math.round(w.windKph)} <span className="text-base font-normal opacity-60">km/h</span></div>
              </div>
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 opacity-60 text-sm uppercase font-bold tracking-wider"><Droplets className="w-4 h-4" /> Humidity</div>
                <div className="text-3xl font-bold mt-2">{w.humidity}%</div>
              </div>
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 opacity-60 text-sm uppercase font-bold tracking-wider"><Eye className="w-4 h-4" /> Visibility</div>
                <div className="text-3xl font-bold mt-2">{(w.visibility / 1000).toFixed(1)} <span className="text-base font-normal opacity-60">km</span></div>
              </div>
              <div className="md:col-span-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex justify-around items-center">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center opacity-60 text-sm uppercase font-bold tracking-wider mb-2"><Sunrise className="w-5 h-5 text-orange-300" /> Sunrise</div>
                  <div className="text-2xl font-semibold">{new Date(w.sunrise * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</div>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center opacity-60 text-sm uppercase font-bold tracking-wider mb-2"><Sunset className="w-5 h-5 text-purple-300" /> Sunset</div>
                  <div className="text-2xl font-semibold">{new Date(w.sunset * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</div>
                </div>
              </div>
            </div>

            {/* HOURLY FORECAST */}
            {w.hourly && w.hourly.length > 0 && (
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-2 opacity-60 text-sm uppercase font-bold tracking-wider mb-4"><Clock className="w-4 h-4" /> Hourly Forecast</div>
                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                  {w.hourly.map((hour, i) => (
                    <div key={i} className="flex flex-col items-center min-w-[80px] p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="opacity-70 text-sm whitespace-nowrap">{new Date(hour.dt * 1000).toLocaleTimeString([], {hour: 'numeric'})}</span>
                      <img src={`https://openweathermap.org/img/wn/${hour.icon}.png`} alt="icon" className="w-8 h-8 my-1" />
                      <span className="font-bold">{Math.round(hour.temp)}°</span>
                      {hour.pop > 0 && (<span className="text-xs text-blue-300 flex items-center gap-0.5 mt-1"><Umbrella className="w-3 h-3" /> {Math.round(hour.pop * 100)}%</span>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-DAY FORECAST */}
            {w.forecast && w.forecast.length > 0 && (
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                 <div className="flex items-center gap-2 opacity-60 text-sm uppercase font-bold tracking-wider mb-4"><Calendar className="w-4 h-4" /> 5-Day Forecast</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {w.forecast.map((day, i) => (
                    <div key={i} className="flex flex-col items-center p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                      <span className="opacity-70 text-sm mb-1">{new Date(day.date * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.condition} className="w-10 h-10 opacity-90 drop-shadow-md" />
                      <span className="text-xl font-bold my-1">{Math.round(day.temp)}°</span>
                      <span className="text-xs opacity-50 capitalize mb-1">{day.condition}</span>
                      {day.pop > 0 && (<span className="text-xs text-blue-300 flex items-center gap-1"><Umbrella className="w-3 h-3" /> {Math.round(day.pop * 100)}%</span>)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}