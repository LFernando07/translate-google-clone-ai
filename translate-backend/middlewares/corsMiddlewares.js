import cors from "cors";
import { FRONTEND_URL } from "../config/env.js";

export const corsMiddleware = () => {
  const allowedOrigins = FRONTEND_URL
    ? FRONTEND_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173"];

  return cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  });
};
