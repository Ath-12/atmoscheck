# ☁️ AtmosCheck — Cinematic Weather Intelligence

![AtmosCheck Banner](https://via.placeholder.com/1200x400.png?text=AtmosCheck+Preview)
*(Replace this link with a real screenshot of your app once you take one!)*

**AtmosCheck** is a premium, full-stack weather application designed to be beautiful and immersive. It features a cinematic interface that adapts to the real-world weather using dynamic video backgrounds, "Glassmorphism" UI, and real-time data visualization.

**Live Demo:** [https://atmoscheck.vercel.app](https://atmoscheck.vercel.app)

---

## ✨ Key Features

- **🎬 Dynamic Video Backgrounds:** The app background changes instantly based on current weather conditions (Rain, Snow, Clear Night, Haze, etc.).
- **🌫️ Real-Time AQI:** Integrated Air Quality Index (US EPA Standard 0-500) with color-coded health warnings.
- **💎 Glassmorphism UI:** Modern, frosted-glass interface built with Tailwind CSS v4.
- **🌍 Live Search:** Instant weather data for any city worldwide using the OpenWeather API.
- **⚡ Smart Caching:** React state management ensures smooth transitions without flickering.
- **📱 Fully Responsive:** Optimized for desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

### **Frontend (Client)**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Routing:** React Router DOM

### **Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **API Integration:** Axios (OpenWeatherMap)
- **Deployment:** Render (Backend) + Vercel (Frontend)

---

## 🚀 Getting Started (Run Locally)

Follow these steps to run AtmosCheck on your local machine.

### **1. Clone the Repository**
```bash
git clone [https://github.com/Ath-12/atmoscheck.git](https://github.com/Ath-12/atmoscheck.git)
cd atmoscheck
2. Backend Setup (Server)
You need an API Key from OpenWeatherMap to fetch data.

Bash

# Move to server folder
cd server

# Install dependencies
npm install

# Create environment file
# (On Windows, manually create a .env file if this command doesn't work)
echo OPENWEATHER_KEY=your_api_key_here > .env

# Start the Backend Server
npm run dev
The server will start on http://localhost:5050.

3. Frontend Setup (Client)
Open a new terminal window (keep the server running).

Bash

# Move to client folder
cd client

# Install dependencies
npm install

# Start the React App
npm run dev
The frontend will start on http://localhost:5173.

📂 Project Structure
Bash

atmoscheck/
├── client/                 # Frontend (React + Vite)
│   ├── public/             
│   │   ├── posters/        # Static background images (.jpg)
│   │   ├── videos/         # Animated backgrounds (.webm)
│   │   └── logo.png        # App Logo
│   ├── src/
│   │   ├── components/     # UI Components (LandingPage, VideoBackground)
│   │   ├── lib/            # API Utilities
│   │   ├── utils/          # Helper logic (videoMap.ts)
│   │   └── App.tsx         # Main Dashboard Logic
│
├── server/                 # Backend (Node + Express)
│   ├── src/
│   │   ├── routes.ts       # Weather & AQI API Routes
│   │   └── index.ts        # Server Entry Point
└── README.md               # Documentation
🌍 Deployment Guide
Backend (Render)
Create a new Web Service on Render.

Connect your GitHub repo.

Set Root Directory to server.

Set Build Command to npm install && npm run build.

Set Start Command to npm start.

Add Environment Variable: OPENWEATHER_KEY.

Frontend (Vercel)
Create a new Project on Vercel.

Connect your GitHub repo.

Set Root Directory to client.

Select Framework Preset as Vite.

Deploy!

🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any improvements.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

👨‍💻 Author
Atharva Palsuledesai

GitHub: @Ath-12