import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const projects = db.getProjects();
  res.json({ success: true, projects });
});

router.post('/', (req, res) => {
  const { name, folder = 'Todos', description = '' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del proyecto es obligatorio.' });
  }

  const project = db.createProject({
    name: name.trim(),
    folder,
    description: description.trim()
  });

  res.status(201).json({ success: true, project });
});

router.delete('/:id', (req, res) => {
  const deleted = db.deleteProject(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Proyecto no encontrado.' });
  }
  res.json({ success: true, message: 'Proyecto eliminado.' });
});

router.get('/:id/tasks', (req, res) => {
  const tasks = db.getTasks({ projectId: req.params.id });
  res.json({ success: true, tasks });
});

export default router;
