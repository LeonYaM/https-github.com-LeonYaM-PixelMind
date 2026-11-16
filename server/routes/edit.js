import express from 'express';
import { db } from '../db.js';
import { queueManager } from '../queue.js';
import path from 'path';
import fs from 'fs';
import { CONFIG } from '../config.js';

const router = express.Router();

// Smart Edit endpoint
router.post('/inpaint', (req, res) => {
  const { inputUrl, maskData, prompt, action = 'inpaint', projectId } = req.body;
  if (!inputUrl) {
    return res.status(400).json({ error: 'Se requiere la imagen base.' });
  }
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Se requiere una descripción para la modificación.' });
  }

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.smart_edit || 6;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes (${cost} requeridos).` });
  }

  // Save mask base64 if provided
  let maskFilename = null;
  if (maskData && maskData.startsWith('data:image')) {
    try {
      const base64Data = maskData.replace(/^data:image\/\w+;base64,/, '');
      maskFilename = `mask_${Date.now()}.png`;
      fs.writeFileSync(path.join(CONFIG.PATHS.UPLOADS, maskFilename), Buffer.from(base64Data, 'base64'));
    } catch (e) {
      console.warn('Error saving mask data:', e);
    }
  }

  db.updateUserCredits(user.id, -cost, 'smart_edit');

  const task = db.createTask({
    type: 'smart_edit',
    title: `Edición Inteligente: "${prompt.substring(0, 28)}..."`,
    inputUrl,
    beforeUrl: inputUrl,
    resultType: 'image',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      inputFilename: path.basename(inputUrl),
      maskUrl: maskFilename ? `/uploads/${maskFilename}` : null,
      prompt: prompt.trim(),
      action
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

export default router;
