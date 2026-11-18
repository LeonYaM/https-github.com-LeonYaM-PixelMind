import express from 'express';
import cors from 'cors';
import path from 'path';
import { CONFIG } from './config.js';
import enhanceRoutes from './routes/enhance.js';
import generateRoutes from './routes/generate.js';
import editRoutes from './routes/edit.js';
import promptRoutes from './routes/promptAssistant.js';
import projectRoutes from './routes/projects.js';
import queueRoutes from './routes/queueRoutes.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads and generated outputs
app.use('/uploads', express.static(CONFIG.PATHS.UPLOADS));
app.use('/outputs', express.static(CONFIG.PATHS.OUTPUTS));

// API Routes
app.use('/api/enhance', enhanceRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/edit', editRoutes);
app.use('/api/prompt', promptRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'PIXELMIND AI Studio',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err.message || 'Error interno del servidor en PIXELMIND AI.'
  });
});

// Start listening only in non-serverless environments
if (!process.env.VERCEL) {
  app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`\n======================================================`);
    console.log(`  PIXELMIND AI Studio - Backend Operativo`);
    console.log(`  Servidor corriendo en: http://${CONFIG.HOST}:${CONFIG.PORT}`);
    console.log(`  Almacenamiento: ${CONFIG.PATHS.STORAGE}`);
    console.log(`======================================================\n`);
  });
}

export default app;
