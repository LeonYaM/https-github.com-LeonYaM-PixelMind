import { db } from './db.js';
import { providerManager } from './providers/providerManager.js';
import { EventEmitter } from 'events';
import path from 'path';
import { CONFIG } from './config.js';

class QueueManager extends EventEmitter {
  constructor() {
    super();
    this.activeJobs = new Map();
    this.concurrency = 2;
    this.runningCount = 0;
    this.queue = [];
    
    // Auto-process queue tick
    setInterval(() => this.processNext(), 1500);
  }

  enqueue(task) {
    this.queue.push(task.id);
    this.emit('task_queued', task);
    this.processNext();
    return task;
  }

  cancelTask(taskId) {
    const task = db.getTask(taskId);
    if (!task) return false;

    if (task.status === 'pending') {
      const idx = this.queue.indexOf(taskId);
      if (idx !== -1) this.queue.splice(idx, 1);
      db.updateTask(taskId, {
        status: 'cancelled',
        stage: 'Tarea cancelada por el usuario.',
        completedAt: new Date().toISOString()
      });
      // Refund credits
      if (task.creditsCost > 0) {
        db.updateUserCredits(task.userId, task.creditsCost, 'reembolso_cancelacion');
      }
      this.emit('task_updated', db.getTask(taskId));
      return true;
    }

    if (task.status === 'processing') {
      db.updateTask(taskId, {
        status: 'cancelled',
        stage: 'Cancelado durante el procesamiento.',
        completedAt: new Date().toISOString()
      });
      if (task.creditsCost > 0) {
        db.updateUserCredits(task.userId, task.creditsCost, 'reembolso_cancelacion');
      }
      this.emit('task_updated', db.getTask(taskId));
      return true;
    }

    return false;
  }

  async processNext() {
    if (this.runningCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const taskId = this.queue.shift();
    const task = db.getTask(taskId);

    if (!task || task.status === 'cancelled') {
      return;
    }

    this.runningCount++;
    db.updateTask(taskId, {
      status: 'processing',
      progress: 10,
      stage: 'Iniciando generación con red neuronal...',
      startedAt: new Date().toISOString()
    });
    this.emit('task_updated', db.getTask(taskId));

    try {
      await this.executeTask(task);
    } catch (err) {
      console.error(`Error procesando tarea ${taskId}:`, err);
      db.updateTask(taskId, {
        status: 'error',
        error: err.message || 'Error desconocido durante la ejecución de la tarea',
        stage: 'Error de procesamiento',
        completedAt: new Date().toISOString()
      });
      // Refund credits on failure
      if (task.creditsCost > 0) {
        db.updateUserCredits(task.userId, task.creditsCost, 'reembolso_error');
      }
      this.emit('task_updated', db.getTask(taskId));
    } finally {
      this.runningCount--;
      this.processNext();
    }
  }

  async executeTask(task) {
    const onProgress = (stage, progress = null) => {
      const current = db.getTask(task.id);
      if (!current || current.status === 'cancelled') return;

      const newProgress = progress !== null ? progress : Math.min(95, (current.progress || 10) + 15);
      db.updateTask(task.id, {
        stage: stage,
        progress: newProgress
      });
      this.emit('task_updated', db.getTask(task.id));
    };

    let result = null;
    const params = task.params || {};

    switch (task.type) {
      case 'enhance': {
        const fullInputPath = params.inputFilename ? path.join(CONFIG.PATHS.UPLOADS, params.inputFilename) : null;
        result = await providerManager.upscaleImage({
          imagePath: fullInputPath,
          imageUrl: task.inputUrl,
          scale: params.scale || 4,
          faceEnhance: params.faceEnhance ?? true,
          onProgress
        });
        break;
      }

      case 'face_restore': {
        const fullInputPath = params.inputFilename ? path.join(CONFIG.PATHS.UPLOADS, params.inputFilename) : null;
        result = await providerManager.restoreFace({
          imagePath: fullInputPath,
          imageUrl: task.inputUrl,
          fidelity: params.fidelity || 0.7,
          upscale: params.upscale || 2,
          onProgress
        });
        break;
      }

      case 'restore_old': {
        const fullInputPath = params.inputFilename ? path.join(CONFIG.PATHS.UPLOADS, params.inputFilename) : null;
        result = await providerManager.restoreOldPhoto({
          imagePath: fullInputPath,
          imageUrl: task.inputUrl,
          withScratch: params.withScratch ?? true,
          onProgress
        });
        break;
      }

      case 'colorize': {
        const fullInputPath = params.inputFilename ? path.join(CONFIG.PATHS.UPLOADS, params.inputFilename) : null;
        result = await providerManager.colorize({
          imagePath: fullInputPath,
          imageUrl: task.inputUrl,
          onProgress
        });
        break;
      }

      case 'remove_bg': {
        const fullInputPath = params.inputFilename ? path.join(CONFIG.PATHS.UPLOADS, params.inputFilename) : null;
        result = await providerManager.removeBackground({
          imagePath: fullInputPath,
          imageUrl: task.inputUrl,
          onProgress
        });
        break;
      }

      case 'text_to_image': {
        result = await providerManager.generateTextToImage({
          prompt: params.prompt,
          style: params.style || 'cinematic',
          aspectRatio: params.aspectRatio || '16:9',
          onProgress
        });
        break;
      }

      case 'text_to_video': {
        result = await providerManager.generateTextToVideo({
          prompt: params.prompt,
          duration: params.duration || 5,
          aspectRatio: params.aspectRatio || '16:9',
          camera: params.camera || 'pan',
          onProgress
        });
        break;
      }

      case 'image_to_video': {
        result = await providerManager.generateImageToVideo({
          imageUrl: task.inputUrl,
          prompt: params.prompt || 'cinematic motion',
          duration: params.duration || 5,
          camera: params.camera || 'zoom',
          onProgress
        });
        break;
      }

      case 'smart_edit': {
        const fullInputPath = params.inputFilename ? path.join(CONFIG.PATHS.UPLOADS, params.inputFilename) : null;
        result = await providerManager.smartEdit({
          imagePath: fullInputPath,
          imageUrl: task.inputUrl,
          maskPath: params.maskUrl,
          prompt: params.prompt,
          action: params.action || 'inpaint',
          onProgress
        });
        break;
      }

      default:
        throw new Error(`Tipo de tarea desconocido: ${task.type}`);
    }

    if (!result || !result.outputUrl) {
      throw new Error('El modelo de IA no retornó una URL de salida válida.');
    }

    // Complete task
    db.updateTask(task.id, {
      status: 'completed',
      progress: 100,
      stage: '¡Finalizado con éxito!',
      outputUrl: result.outputUrl,
      afterUrl: result.outputUrl,
      provider: result.provider || task.provider,
      notice: result.notice || null,
      isRealAI: result.isRealAI ?? false,
      completedAt: new Date().toISOString()
    });

    this.emit('task_updated', db.getTask(task.id));
  }
}

export const queueManager = new QueueManager();
