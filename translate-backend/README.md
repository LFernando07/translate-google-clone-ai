# 🚀 Guía de Despliegue en Render

## 📋 Pre-requisitos

- ✅ Cuenta en [Render](https://render.com)
- ✅ Cuenta en [GitHub](https://github.com)
- ✅ API Key de OpenAI

## 🔧 Preparación del Código

### 1. Actualizar dependencias

```bash
cd backend
npm install express-rate-limit helmet
```

### 2. Crear repositorio en GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial commit - Backend traductor"
git branch -M main
git remote add origin https://github.com/tu-usuario/translator-backend.git
git push -u origin main
```

### 3. Estructura recomendada

```
translator-backend/
├── server.js
├── package.json
├── .gitignore
├── .env.example
├── render.yaml (opcional)
└── README.md
```

**Crear `.gitignore`:**

```
node_modules/
.env
.DS_Store
npm-debug.log
```

## 🌐 Desplegar en Render

### Opción A: Desde el Dashboard (Recomendado)

1. **Ir a [Render Dashboard](https://dashboard.render.com)**

2. **Click en "New +" → "Web Service"**

3. **Conectar tu repositorio de GitHub**

   - Autoriza Render para acceder a tus repos
   - Selecciona el repo `translator-backend`

4. **Configurar el servicio:**

   ```
   Name: translator-api
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

5. **Variables de Entorno (Environment):**

   Click en "Advanced" y agrega:

   | Key              | Value                       |
   | ---------------- | --------------------------- |
   | `NODE_ENV`       | `production`                |
   | `OPENAI_API_KEY` | `sk-tu-key-aqui`            |
   | `FRONTEND_URL`   | `https://tu-app.vercel.app` |

6. **Click en "Create Web Service"**

7. **Esperar el despliegue** (2-5 minutos)
   - Verás logs en tiempo real
   - Tu API estará en: `https://translator-api-xxxx.onrender.com`

### Opción B: Con render.yaml

1. Incluir `render.yaml` en tu repo
2. En Render: "New +" → "Blueprint"
3. Conectar repo y seleccionar `render.yaml`
4. Configurar variables de entorno manualmente

## ✅ Verificar el Despliegue

### 1. Probar endpoint de salud

```bash
curl https://tu-servicio.onrender.com/health
```

Deberías ver:

```json
{ "status": "ok", "message": "Servidor funcionando" }
```

### 2. Probar traducción

```bash
curl -X POST https://tu-servicio.onrender.com/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "fromLanguage": "auto",
    "toLanguage": "English",
    "text": "Hola mundo"
  }'
```

Deberías ver:

```json
{ "translation": "Hello world" }
```

## 🎨 Configurar Frontend

### 1. Actualizar variable de entorno

En tu proyecto frontend (Vercel, Netlify, etc.):

```env
VITE_API_URL=https://tu-servicio.onrender.com
```

### 2. En Vercel:

1. Settings → Environment Variables
2. Agregar: `VITE_API_URL` = `https://tu-servicio.onrender.com`
3. Redeploy

### 3. En Netlify:

1. Site settings → Build & deploy → Environment
2. Agregar: `VITE_API_URL` = `https://tu-servicio.onrender.com`
3. Trigger deploy

## ⚡ Características del Plan Free de Render

- ✅ 750 horas gratis al mes
- ✅ HTTPS automático
- ✅ Auto-deploy desde GitHub
- ⚠️ Se duerme después de 15 min de inactividad
- ⚠️ Primera petición puede tardar 30-60 segundos (cold start)

## 🔥 Optimizaciones para Cold Start

Si usas el plan free y quieres reducir el tiempo de arranque:

### 1. Crear un cron job que haga ping cada 14 minutos

Usa [cron-job.org](https://cron-job.org) o [UptimeRobot](https://uptimerobot.com):

- URL: `https://tu-servicio.onrender.com/health`
- Intervalo: cada 14 minutos

### 2. Mostrar loading en frontend

```typescript
// En tu translate.ts
export async function translate({...}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos

  try {
    const response = await fetch(`${API_URL}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromLanguage, toLanguage, text }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    // ... resto del código
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado. Intenta de nuevo.')
    }
    throw error
  }
}
```

## 🔍 Monitoreo y Logs

### Ver logs en tiempo real:

1. Dashboard de Render
2. Tu servicio → "Logs"
3. Ver errores y requests

### Configurar alertas:

1. Settings → Notifications
2. Agregar email para notificaciones de errores

## 🆙 Actualizar el Backend

Render hace auto-deploy cuando haces push a GitHub:

```bash
git add .
git commit -m "Actualización de funcionalidad"
git push origin main
```

Render detectará el cambio y desplegará automáticamente.

## 🐛 Solución de Problemas

### Error: "Application failed to respond"

- Verifica que el servidor escuche en `0.0.0.0` (ya configurado)
- Revisa que el PORT sea dinámico (ya configurado)

### Error 502 Bad Gateway

- El servidor está iniciando (cold start)
- Espera 30-60 segundos y reintenta

### CORS Error

- Verifica que `FRONTEND_URL` incluya tu dominio de producción
- Formato correcto: `https://miapp.vercel.app` (sin slash al final)

### Error con OpenAI API

- Verifica que `OPENAI_API_KEY` esté configurada correctamente
- Revisa los logs para ver el error específico

## 💰 Costos Estimados

### Plan Free:

- Backend: $0
- OpenAI (GPT-4o-mini): ~$0.15 por 1000 requests
- Estimado: $5-10/mes con uso moderado

### Plan Starter ($7/mes):

- Sin cold starts
- Siempre activo
- 400 horas incluidas

## 📊 Límites Recomendados

Con el plan free y para proteger tu billetera:

```javascript
// En server.js ya está configurado:
// - 50 requests por hora por IP
// - Máximo 5000 caracteres por traducción
// - Rate limit estricto
```

## 🎯 Próximos Pasos

1. ✅ Configura monitoreo con logs
2. ✅ Agrega cron job para evitar cold starts
3. ✅ Configura alertas de errores
4. 📊 Monitorea uso de OpenAI API
5. 💳 Configura límites de gasto en OpenAI

## 🔗 Links Útiles

- [Render Docs](https://render.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
