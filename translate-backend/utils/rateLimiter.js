import rateLimit from "express-rate-limit";

// Rate limiting robusto con express-rate-limit
export const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.isProduction ? 50 : 100, // 50 en producción, 100 en desarrollo
  message: { error: "Demasiadas solicitudes. Intenta en una hora." },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar IP real detrás de proxy (Render usa proxies)
  trustProxy: true,
});
