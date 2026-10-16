import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import routes from "./routes";

dotenv.config();

// Only these websites may call the API from a browser. Anything else is
// refused by the browser (CORS). Extra origins can be added with the
// ALLOWED_ORIGINS env var, comma-separated.
const allowedOrigins = [
  "https://atmoscheck.vercel.app",
  "http://localhost:5173", // vite dev
  "http://localhost:4173", // vite preview
  ...(process.env.ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
];
// Vercel preview deployments look like https://atmoscheck-<hash>-<user>.vercel.app
const vercelPreview = /^https:\/\/atmoscheck(-[a-z0-9-]+)?\.vercel\.app$/;

export function createApp() {
  const app = express();

  // Render puts a proxy in front of the app; trust it so the rate limiter
  // sees each visitor's real IP address instead of the proxy's.
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: (origin, callback) => {
        // No Origin header = not a browser on another site (curl, health checks).
        if (!origin || allowedOrigins.includes(origin) || vercelPreview.test(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
    })
  );
  app.use(express.json());

  // CORS only stops other websites in a browser. Scripts can still call the
  // API directly, so each IP also gets a request budget.
  app.use(
    "/api/weather",
    rateLimit({
      windowMs: 10 * 60 * 1000,
      limit: 60,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "Too many requests. Please wait a few minutes and try again." },
    })
  );

  app.use("/api", routes);
  app.get("/", (_req, res) => res.send("AtmosCheck API OK"));
  return app;
}

// Start listening only when run directly (not when imported by tests).
if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  createApp().listen(PORT, () => console.log(`Server listening http://localhost:${PORT}`));
}
