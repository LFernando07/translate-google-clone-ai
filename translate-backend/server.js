// server.js
import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./middlewares/corsMiddlewares.js";
import { limiter } from "./utils/rateLimiter.js";
import { startOpenAI, trainModel } from "./service/openaiClient.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

// Validar variables de entorno críticas
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ ERROR: OPENAI_API_KEY no está configurada");
  process.exit(1);
}

const openai = startOpenAI(process.env.OPENAI_API_KEY);

// Middlewares de seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configurado para múltiples orígenes
app.use(corsMiddleware());

app.use(express.json({ limit: "10kb" }));

// Endpoint de salud
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando" });
});

// Endpoint de traducción
app.post("/api/translate", limiter, async (req, res) => {
  try {
    const { fromLanguage, toLanguage, text } = req.body;

    // Validaciones
    if (!text || !toLanguage) {
      return res.status(400).json({
        error: "Faltan parámetros requeridos (text, toLanguage)",
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: "El texto es demasiado largo (máximo 5000 caracteres)",
      });
    }

    // Si el idioma origen y destino son iguales, retornar el mismo texto
    if (fromLanguage === toLanguage) {
      return res.json({ translation: text });
    }

    // 👇 Pasamos text, fromLanguage y toLanguage
    const completion = await trainModel(openai, text, fromLanguage, toLanguage);

    // 👇 Validar la respuesta
    const translation = completion?.choices?.[0]?.message?.content?.trim();

    if (!translation) {
      throw new Error("No se pudo obtener la traducción correctamente");
    }

    res.json({ translation });
  } catch (error) {
    console.error("Error en traducción:", error);

    // Manejo de errores específicos de OpenAI
    if (error.status === 401) {
      return res.status(500).json({
        error: "Error de autenticación con OpenAI",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: "Límite de API excedido. Intenta más tarde.",
      });
    }

    res.status(500).json({
      error: "Error al procesar la traducción",
    });
  }
});

// Manejo de rutas no encontradas
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Error de CORS específico
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "Acceso denegado: Origin no permitido",
    });
  }

  res.status(500).json({ error: "Error interno del servidor" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(
    `📝 Endpoint de traducción: http://localhost:${PORT}/api/translate`
  );
  console.log(`🌍 Entorno: ${isProduction ? "PRODUCCIÓN" : "DESARROLLO"}`);
  // console.log(`🔒 CORS permitido para: ${allowedOrigins.join(", ")}`);
});
