import express from 'express';
import { db } from '../db.js';
import { queueManager } from '../queue.js';

const router = express.Router();

// --- Text to Image ---
router.post('/text-to-image', (req, res) => {
  const { prompt, style = 'photorealistic', aspectRatio = '16:9', numOutputs = 1, projectId } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Se requiere una descripción o prompt para generar la imagen.' });
  }

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.text_to_image || 5;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes (${cost} necesarios, tienes ${user.credits}).` });
  }

  db.updateUserCredits(user.id, -cost, 'text_to_image');

  const task = db.createTask({
    type: 'text_to_image',
    title: `Generación: "${prompt.substring(0, 32)}..."`,
    resultType: 'image',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      prompt: prompt.trim(),
      style,
      aspectRatio,
      numOutputs: Number(numOutputs)
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

// --- Text to Video ---
router.post('/text-to-video', (req, res) => {
  const { prompt, duration = 5, resolution = '1080p', aspectRatio = '16:9', style = 'cinematic', camera = 'smooth travelling', motionSpeed = 'normal', projectId } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Se requiere un prompt para generar el video.' });
  }

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.text_to_video || 15;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes para video (${cost} necesarios).` });
  }

  db.updateUserCredits(user.id, -cost, 'text_to_video');

  const task = db.createTask({
    type: 'text_to_video',
    title: `Video IA: "${prompt.substring(0, 30)}..."`,
    resultType: 'video',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      prompt: prompt.trim(),
      duration: Number(duration),
      resolution,
      aspectRatio,
      style,
      camera,
      motionSpeed
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

// --- Image to Video ---
router.post('/image-to-video', (req, res) => {
  const { inputUrl, endImageUrl, prompt = 'cinematic camera motion and organic character animation', duration = 5, camera = 'subtle zoom', intensity = 'medium', preserveFaces = true, projectId } = req.body;
  if (!inputUrl) {
    return res.status(400).json({ error: 'Se requiere una imagen de origen para animar.' });
  }

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.image_to_video || 20;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes (${cost} necesarios).` });
  }

  db.updateUserCredits(user.id, -cost, 'image_to_video');

  const task = db.createTask({
    type: 'image_to_video',
    title: 'Animación de Fotografía a Video',
    inputUrl,
    beforeUrl: inputUrl,
    resultType: 'video',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      prompt: prompt.trim(),
      endImageUrl,
      duration: Number(duration),
      camera,
      intensity,
      preserveFaces: Boolean(preserveFaces)
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

export default router;
