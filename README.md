# ☁️ AtmosCheck — Check the sky

A full-stack weather website where the background matches the real sky: search a city or use your location, and get the current weather, air quality, the next 24 hours and a 5-day forecast, all shown in the city's own local time.

[![ci](https://github.com/Ath-12/atmoscheck/actions/workflows/ci.yml/badge.svg)](https://github.com/Ath-12/atmoscheck/actions/workflows/ci.yml)

**Live:** https://atmoscheck.vercel.app
_The backend is on Render's free plan and sleeps when idle. The first search after a quiet spell can take up to a minute; the app says so and retries automatically._

---

## ✨ Features

- **Weather-matched backgrounds**: 28 pictures chosen by condition, day or night in that city, sunrise/sunset "golden hour", and India-specific scenes (monsoon clouds, heavy rain, dust, morning fog). New pictures cross-fade in.
- **Everything in the city's local time**: clock, sunrise, sunset, hourly and daily labels are correct even when you look up Tokyo from India.
- **Air quality (US AQI)** with a health label: ground-station data from WAQI when available, otherwise a model estimate from Open-Meteo. If neither answers, the weather still loads.
- **Next 24 hours** (3-hour steps) and a **5-day forecast** with daily high/low and rain chance.
- **Practical tips** from the numbers: umbrella (with the time rain is likely), unhealthy air, heat, cold, strong wind.
- **°C / °F** toggle (wind in km/h or mph), remembered on your device.
- **Recent searches** as one-tap chips (stored only in your browser), **use my location**, and a **share** button.
- **Responsive** glass-style UI with Tailwind CSS.

## 🧱 How it works

```
Browser: React app (client/, on Vercel)
   │  GET /api/weather?q=Pune   or  ?lat=…&lon=…
   ▼
Express API (server/, on Render), API keys live only here
   ├─► OpenWeather Geocoding       city → coordinates
   ├─► OpenWeather Current + 5-day forecast (in parallel)
   └─► WAQI (if key) ──no reading──► Open-Meteo     air quality
```

The backend exists so the OpenWeather key never reaches the browser, and so several API calls become one clean response.

**Protecting the backend** (it's a public API on a free plan):
- **CORS**: only atmoscheck.vercel.app, its preview deployments and localhost can call it from a browser.
- **Rate limit**: 60 requests per 10 minutes per visitor.
- **Cache**: each city's result is kept for 10 minutes, so repeat searches are instant and don't use API quota.
- **Input validation**: city names and coordinates are checked, URL-encoded and sent over HTTPS only.

## 🛠️ Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS v4, Lucide icons |
| Backend | Node.js, Express 5, TypeScript, Axios, express-rate-limit |
| Data | OpenWeather (geocoding, current, 5-day/3-hour forecast), WAQI, Open-Meteo Air Quality |
| Tests | Vitest (both), Supertest (API), GitHub Actions CI |
| Hosting | Vercel (frontend), Render (backend) |

## 🚀 Run it locally

```bash
git clone https://github.com/Ath-12/atmoscheck.git
cd atmoscheck
```

**Backend**

```bash
cd server
npm install
cp .env.example .env      # then put your OpenWeather key in OPENWEATHER_KEY
npm run dev               # http://localhost:5050
```

**Frontend** (new terminal)

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Environment variables (names only; see the `.env.example` files):

| Where | Variable | Required |
|---|---|---|
| server | `OPENWEATHER_KEY` | yes |
| server | `WAQI_KEY` | no (falls back to Open-Meteo) |
| server | `ALLOWED_ORIGINS` | no (extra websites allowed to call the API) |
| client | `VITE_API_URL` | no (defaults to localhost in dev, Render in production) |

## 🧪 Tests

```bash
cd client && npm test     # time zones, units, tips, background rules, recent searches
cd server && npm test     # API with outside services faked: caching, CORS, rate limit, errors
```

Outside APIs are faked in the tests, so they need no keys and no internet. CI runs lint, tests and build for both parts on every push.

## 🌍 Deployment

**Backend (Render, Web Service):** root directory `server`, build `npm install && npm run build`, start `npm start`, environment variable `OPENWEATHER_KEY` (optionally `WAQI_KEY`).

**Frontend (Vercel):** root directory `client`, framework preset Vite. `client/vercel.json` sends every path to `index.html`, so links like `/weather?q=Pune` work on refresh.

## 📁 Project structure

```
client/
  src/App.tsx                    dashboard
  src/components/LandingPage.tsx search, location, recent searches
  src/components/VideoBackground.tsx  background picture + cross-fade
  src/utils/videoMap.ts          which picture for which weather
  src/lib/                       api, city time, units, tips, storage
  public/posters/                background pictures
server/
  src/index.ts                   app setup: CORS, rate limit, health check
  src/routes.ts                  GET /api/weather
  src/forecast.ts                24-hour and daily summaries
  src/aqi.ts                     air quality with fallback
  src/cache.ts                   10-minute in-memory cache
```

## 📄 License

MIT, see [LICENSE](LICENSE).

## 👨‍💻 Author

**Atharva Palsuledesai** · [@Ath-12](https://github.com/Ath-12)
