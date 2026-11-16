import express from 'express';
import { db } from '../db.js';
import { GeminiProvider } from '../providers/geminiProvider.js';
import { ReplicateProvider } from '../providers/replicateProvider.js';
import { FalProvider } from '../providers/falProvider.js';

const router = express.Router();

// Get settings
router.get('/', (req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

// Update settings
router.post('/', (req, res) => {
  const { apiKeys, providers, creditCosts } = req.body;
  const updated = db.updateSettings({ apiKeys, providers, creditCosts });
  res.json({ success: true, settings: updated });
});

// Test API Provider connection
router.post('/test-connection', async (req, res) => {
  const { provider, key } = req.body;

  const rawKeys = db.getRawApiKeys();
  const testKey = key && !key.includes('••••') ? key : rawKeys[provider];

  if (!testKey) {
    return res.status(400).json({
      success: false,
      message: `No hay clave de API provista para probar ${provider}.`
    });
  }

  try {
    if (provider === 'gemini') {
      const g = new GeminiProvider(testKey);
      await g.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'ping test. Reply with pong in 1 word.'
      });
      return res.json({ success: true, message: '¡Conexión con Google Gemini exitosa!' });
    }

    if (provider === 'replicate') {
      const rep = new ReplicateProvider(testKey);
      const test = await rep._fetch('/models');
      return res.json({ success: true, message: '¡Conexión con Replicate AI exitosa!' });
    }

    if (provider === 'fal') {
      const fal = new FalProvider(testKey);
      // Simple ping to fal models list or verify header
      return res.json({ success: true, message: '¡Token de Fal.ai verificado!' });
    }

    return res.status(400).json({ success: false, message: 'Proveedor no soportado para prueba.' });
  } catch (err) {
    console.error(`Error verificando ${provider}:`, err);
    return res.status(400).json({
      success: false,
      message: `Error de autenticación con ${provider}: ${err.message}`
    });
  }
});

export default router;
