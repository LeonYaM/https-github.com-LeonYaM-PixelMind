import express from 'express';
import multer from 'multer';
import path from 'path';
import { CONFIG } from '../config.js';
import { db } from '../db.js';
import { queueManager } from '../queue.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CONFIG.PATHS.UPLOADS);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `upload_${Date.now()}_${uuidv4().substring(0, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: CONFIG.UPLOAD_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [...CONFIG.UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES, ...CONFIG.UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no soportado. Formatos admitidos: JPG, PNG, WEBP, TIFF, BMP, MP4, WebM, QuickTime.'));
    }
  }
});

// Upload image helper
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ningún archivo de imagen válido.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

// Upscale / Enhance
router.post('/upscale', (req, res) => {
  const { inputUrl, filename, scale = 4, faceEnhance = true, denoise = true, sharpen = true, projectId } = req.body;
  if (!inputUrl) {
    return res.status(400).json({ error: 'Se requiere la URL o archivo de entrada.' });
  }

  const user = db.getUser();
  const cost = db.getSettings().creditCosts[`upscale_${scale}x`] || 4;

  if (user.credits < cost) {
    return res.status(402).json({
      error: `Créditos insuficientes. Se requieren ${cost} créditos, tienes ${user.credits}.`,
      requiredCredits: cost,
      currentCredits: user.credits
    });
  }

  // Deduct credits
  db.updateUserCredits(user.id, -cost, `upscale_${scale}x`);

  const task = db.createTask({
    type: 'enhance',
    title: `Mejoramiento IA ${scale}X`,
    inputUrl,
    beforeUrl: inputUrl,
    resultType: 'image',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      inputFilename: filename || path.basename(inputUrl),
      scale: Number(scale),
      faceEnhance: Boolean(faceEnhance),
      denoise: Boolean(denoise),
      sharpen: Boolean(sharpen)
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

// Face Restoration (CodeFormer / GFPGAN)
router.post('/face-restore', (req, res) => {
  const { inputUrl, filename, fidelity = 0.7, upscale = 2, projectId } = req.body;
  if (!inputUrl) return res.status(400).json({ error: 'Se requiere imagen de entrada.' });

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.face_restore || 3;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes. Requieres ${cost} créditos.` });
  }

  db.updateUserCredits(user.id, -cost, 'face_restore');

  const task = db.createTask({
    type: 'face_restore',
    title: 'Restauración Facial CodeFormer',
    inputUrl,
    beforeUrl: inputUrl,
    resultType: 'image',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      inputFilename: filename || path.basename(inputUrl),
      fidelity: Number(fidelity),
      upscale: Number(upscale)
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

// Old Photo Restoration
router.post('/restore-old', (req, res) => {
  const { inputUrl, filename, withScratch = true, colorize = false, projectId } = req.body;
  if (!inputUrl) return res.status(400).json({ error: 'Se requiere imagen de entrada.' });

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.old_photo || 4;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes (${cost} necesarios).` });
  }

  db.updateUserCredits(user.id, -cost, 'old_photo');

  const task = db.createTask({
    type: 'restore_old',
    title: 'Restauración de Fotografía Antigua',
    inputUrl,
    beforeUrl: inputUrl,
    resultType: 'image',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      inputFilename: filename || path.basename(inputUrl),
      withScratch: Boolean(withScratch),
      colorize: Boolean(colorize)
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

// Colorize
router.post('/colorize', (req, res) => {
  const { inputUrl, filename, projectId } = req.body;
  if (!inputUrl) return res.status(400).json({ error: 'Se requiere imagen de entrada.' });

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.colorize || 3;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes (${cost} necesarios).` });
  }

  db.updateUserCredits(user.id, -cost, 'colorize');

  const task = db.createTask({
    type: 'colorize',
    title: 'Colorización DeOldify B&N',
    inputUrl,
    beforeUrl: inputUrl,
    resultType: 'image',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      inputFilename: filename || path.basename(inputUrl)
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

// Background Removal
router.post('/remove-bg', (req, res) => {
  const { inputUrl, filename, projectId } = req.body;
  if (!inputUrl) return res.status(400).json({ error: 'Se requiere imagen de entrada.' });

  const user = db.getUser();
  const cost = db.getSettings().creditCosts.remove_bg || 2;

  if (user.credits < cost) {
    return res.status(402).json({ error: `Créditos insuficientes (${cost} necesarios).` });
  }

  db.updateUserCredits(user.id, -cost, 'remove_bg');

  const task = db.createTask({
    type: 'remove_bg',
    title: 'Eliminación Automática de Fondo',
    inputUrl,
    beforeUrl: inputUrl,
    resultType: 'image',
    creditsCost: cost,
    projectId: projectId || 'proj_default',
    params: {
      inputFilename: filename || path.basename(inputUrl)
    }
  });

  queueManager.enqueue(task);
  res.status(202).json({ success: true, task });
});

export default router;
