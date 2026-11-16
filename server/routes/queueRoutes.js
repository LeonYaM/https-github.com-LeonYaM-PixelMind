import express from 'express';
import { db } from '../db.js';
import { queueManager } from '../queue.js';

const router = express.Router();

// Real-time SSE Stream
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial state
  const tasks = db.getTasks({ limit: 30 });
  res.write(`data: ${JSON.stringify({ type: 'init', tasks })}\n\n`);

  const onTaskUpdate = (task) => {
    res.write(`data: ${JSON.stringify({ type: 'task_updated', task })}\n\n`);
  };

  const onTaskQueued = (task) => {
    res.write(`data: ${JSON.stringify({ type: 'task_queued', task })}\n\n`);
  };

  queueManager.on('task_updated', onTaskUpdate);
  queueManager.on('task_queued', onTaskQueued);

  // Keep alive heartbeat
  const pingInterval = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(pingInterval);
    queueManager.off('task_updated', onTaskUpdate);
    queueManager.off('task_queued', onTaskQueued);
  });
});

// Get task list
router.get('/tasks', (req, res) => {
  const { status, type, projectId, limit = 50 } = req.query;
  let tasks = db.getTasks({
    status: status ? String(status) : undefined,
    projectId: projectId ? String(projectId) : undefined,
    limit: Number(limit)
  });

  if (type) {
    tasks = tasks.filter(t => t.type === type);
  }

  res.json({ success: true, tasks });
});

// Get single task
router.get('/tasks/:id', (req, res) => {
  const task = db.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' });
  res.json({ success: true, task });
});

// Cancel task
router.post('/tasks/:id/cancel', (req, res) => {
  const success = queueManager.cancelTask(req.params.id);
  if (!success) {
    return res.status(400).json({ error: 'No se pudo cancelar la tarea (puede que ya haya terminado).' });
  }
  res.json({ success: true, message: 'Tarea cancelada con éxito.' });
});

// Retry task
router.post('/tasks/:id/retry', (req, res) => {
  const oldTask = db.getTask(req.params.id);
  if (!oldTask) return res.status(404).json({ error: 'Tarea no encontrada.' });

  const user = db.getUser();
  if (user.credits < oldTask.creditsCost) {
    return res.status(402).json({ error: 'Créditos insuficientes para reintentar la tarea.' });
  }

  db.updateUserCredits(user.id, -oldTask.creditsCost, 'reintento');

  const newTask = db.createTask({
    type: oldTask.type,
    title: `[Reintento] ${oldTask.title}`,
    inputUrl: oldTask.inputUrl,
    beforeUrl: oldTask.beforeUrl,
    resultType: oldTask.resultType,
    creditsCost: oldTask.creditsCost,
    projectId: oldTask.projectId,
    params: oldTask.params
  });

  queueManager.enqueue(newTask);
  res.status(202).json({ success: true, task: newTask });
});

// Delete task
router.delete('/tasks/:id', (req, res) => {
  const deleted = db.deleteTask(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Tarea no encontrada.' });
  res.json({ success: true, message: 'Registro de tarea eliminado.' });
});

export default router;
