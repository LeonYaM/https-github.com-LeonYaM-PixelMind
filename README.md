# PIXELMIND AI – Plataforma de Inteligencia Artificial Multimedia

Plataforma profesional de inteligencia artificial multimedia especializada en el mejoramiento, restauración, transformación y generación de imágenes, además de la creación de videos cinematográficos mediante instrucciones escritas (Text to Video) e imágenes (Image to Video).

---

## 🚀 Arquitectura del Proyecto

```
pixelmind-ai/
├── server/                           # Backend Node.js / Express
│   ├── index.js                      # Servidor principal y middlewares
│   ├── config.js                     # Configuración de rutas, límites y costos de créditos
│   ├── db.js                         # Persistencia de usuarios, proyectos, tareas y ajustes
│   ├── queue.js                      # Sistema de colas asíncronas con SSE (Server-Sent Events)
│   ├── providers/                    # Capa de abstracción multi-proveedor de IA
│   │   ├── providerManager.js        # Orquestador con conmutación por error
│   │   ├── geminiProvider.js         # Google Gemini 2.5 Flash & Imagen 3
│   │   ├── replicateProvider.js      # Real-ESRGAN, CodeFormer, GFPGAN, FLUX, SVD
│   │   ├── falProvider.js            # Fal.ai (FLUX Pro, Luma Dream Machine)
│   │   └── localEngine.js            # Motor local con etiquetado honesto de estado
│   └── routes/                       # Endpoints de la API
│       ├── enhance.js                # Upscale 2x/4x/8x, Denoise, Rostros, Restauración
│       ├── generate.js               # Text-to-Image, Text-to-Video, Image-to-Video
│       ├── edit.js                   # Edición inteligente (Inpainting con pincel)
│       ├── promptAssistant.js        # Asistente neuronal de prompts
│       ├── projects.js               # Gestión de proyectos y carpetas
│       ├── queueRoutes.js            # Stream en tiempo real, cancelación y reintento
│       ├── users.js                  # Control de créditos y perfil
│       └── settings.js               # Gestión segura de API Keys y pruebas de conexión
├── src/                              # Frontend React + TypeScript + Tailwind CSS
│   ├── components/
│   │   ├── layout/                   # Sidebar (10 módulos), Header con recarga de créditos
│   │   ├── common/                   # Slider Antes/Después, Canvas Inpainter, Asistente Prompts, FileUploader
│   │   └── views/                    # Las 10 vistas completas del sistema
│   ├── context/                      # AppContext (Estado global) y QueueContext (SSE)
│   ├── services/                     # Cliente API con tipado TypeScript
│   └── types/                        # Definiciones TypeScript
```

---

## 🌟 Los 10 Módulos Implementados

1. **Panel Principal (Dashboard):** Visión general del estudio, métricas de saldo de créditos, accesos directos a todas las herramientas y galería de trabajos recientes.
2. **Mejorar Imágenes (AI Image Enhancer):** Superresolución 2X, 4X y 8X, recuperación de detalles y texturas, eliminación de ruido, recuperación de nitidez y restauración de rostros con preservación estricta de identidad (CodeFormer / GFPGAN) mediante deslizador interactivo Antes / Después con zoom.
3. **Restaurar Fotografías (Photo Restorer):** Reparación de fotos antiguas, eliminación de grietas y pliegues, colorización de blanco y negro con DeOldify y optimización de documentos.
4. **Generar Imágenes (Text to Image):** Creación de imágenes con FLUX.1 y Google Imagen 3 con selección de estilo artístico, formato (16:9, 9:16, 1:1, 4:5) y asistente integrado.
5. **Texto a Video (Text to Video):** Síntesis de secuencias cinematográficas (Google Veo, Luma, Kling) con control de duración (5s, 10s, 15s, 30s), movimiento de cámara (travelling, zoom, órbita) y resolución.
6. **Imagen a Video (Image to Video):** Animación de fotografías estáticas y retratos con preservación de identidad facial, vestimenta, física de viento y partículas.
7. **Editor Inteligente (Magic Inpainting Canvas):** Pincel interactivo para pintar máscaras sobre la imagen, reemplazar fondos, eliminar elementos no deseados o modificar iluminación y ropa mediante texto.
8. **Mis Proyectos:** Organización por carpetas (Todos, Mejoras, Videos, Generaciones, Restauraciones), administración de archivos multimedia y descargas.
9. **Historial de Generaciones & Cola Asíncrona:** Flujo de tareas en tiempo real (En espera, Procesando, Finalizado, Error, Cancelado), barra de progreso, reintentos y auditoría de créditos.
10. **Configuración & Claves API:** Gestión segura en el servidor de credenciales de Google Gemini, Replicate y Fal.ai, botón de test de conexión en vivo y panel administrativo de costos por operación.

---

## 🛠️ Ejecución Local

Para iniciar el frontend y el backend de forma simultánea:

```bash
cd pixelmind-ai
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
