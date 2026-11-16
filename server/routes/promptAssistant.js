import express from 'express';
import { providerManager } from '../providers/providerManager.js';

const router = express.Router();

router.post('/optimize', async (req, res) => {
  const { prompt, style = 'cinematic', camera = 'travelling', lighting = 'volumetric cinematic lighting', mode = 'video' } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Debes ingresar un concepto o descripción base.' });
  }

  try {
    const result = await providerManager.assistPrompt({
      prompt: prompt.trim(),
      style,
      camera,
      lighting,
      mode
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error optimizando prompt:', err);
    res.status(500).json({ error: err.message || 'Error en el asistente de prompts.' });
  }
});

export default router;
