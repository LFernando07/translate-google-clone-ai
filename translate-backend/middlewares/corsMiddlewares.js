// middlewares/corsMiddlewares.js
import cors from "cors";

// Obtener orígenes permitidos desde variable de entorno
const getFrontendUrls = () => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return frontendUrl.split(",").map((url) => url.trim());
};

const allowedOrigins = getFrontendUrls();

export const corsMiddleware = () => {
  return cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, curl, apps móviles, testing)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar si el origin está en la lista de permitidos
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Bloquear si el origin no está permitido
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Length", "X-Request-Id"],
    optionsSuccessStatus: 204,
    preflightContinue: false,
  });
};
