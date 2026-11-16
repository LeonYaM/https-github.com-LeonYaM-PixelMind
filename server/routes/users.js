import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Current user profile
router.get('/me', (req, res) => {
  const user = db.getUser();
  res.json({ success: true, user });
});

// Recharge credits
router.post('/recharge', (req, res) => {
  const { amount = 100 } = req.body;
  const user = db.getUser();
  const newCredits = db.updateUserCredits(user.id, Number(amount), 'recarga_manual');
  res.json({
    success: true,
    message: `Se añadieron ${amount} créditos a tu cuenta.`,
    credits: newCredits
  });
});

// Admin update user credits directly
router.post('/admin/set-credits', (req, res) => {
  const { userId = 'user_admin', credits } = req.body;
  if (credits === undefined || isNaN(credits)) {
    return res.status(400).json({ error: 'Monto de créditos inválido.' });
  }

  const updated = db.setUserCredits(userId, Number(credits));
  res.json({ success: true, credits: updated });
});

// Admin update operation costs
router.post('/admin/credit-costs', (req, res) => {
  const { costs } = req.body;
  if (!costs || typeof costs !== 'object') {
    return res.status(400).json({ error: 'Configuración de costos inválida.' });
  }

  const updatedSettings = db.updateSettings({ creditCosts: costs });
  res.json({ success: true, creditCosts: updatedSettings.creditCosts });
});

export default router;
