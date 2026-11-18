import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';
import { v4 as uuidv4 } from 'uuid';

class Database {
  constructor() {
    this.filePath = CONFIG.PATHS.DB_FILE;
    this.data = {
      users: [],
      projects: [],
      tasks: [],
      folders: ['Todos', 'Mejoras', 'Videos', 'Generaciones', 'Restauraciones'],
      settings: {
        apiKeys: {
          gemini: process.env.GEMINI_API_KEY || '',
          replicate: process.env.REPLICATE_API_TOKEN || '',
          fal: process.env.FAL_KEY || '',
          openai: process.env.OPENAI_API_KEY || ''
        },
        providers: {
          textToImage: 'gemini',     // 'gemini' | 'replicate' | 'fal'
          textToVideo: 'gemini',     // 'gemini' (Veo) | 'replicate' | 'fal'
          imageToVideo: 'replicate', // 'replicate' | 'fal' | 'gemini'
          enhancer: 'replicate',     // 'replicate' (Real-ESRGAN/GFPGAN) | 'fal' | 'local'
          restoration: 'replicate',  // 'replicate' (CodeFormer) | 'fal' | 'local'
          promptAssist: 'gemini'     // 'gemini'
        },
        creditCosts: { ...CONFIG.DEFAULT_CREDIT_COSTS }
      }
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(CONFIG.PATHS.DATA)) {
        fs.mkdirSync(CONFIG.PATHS.DATA, { recursive: true });
      }
      if (!fs.existsSync(CONFIG.PATHS.UPLOADS)) {
        fs.mkdirSync(CONFIG.PATHS.UPLOADS, { recursive: true });
      }
      if (!fs.existsSync(CONFIG.PATHS.OUTPUTS)) {
        fs.mkdirSync(CONFIG.PATHS.OUTPUTS, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      } else {
        // Create initial default user
        this.data.users.push({
          id: 'user_admin',
          name: 'Creador PixelMind',
          email: 'admin@pixelmind.ai',
          role: 'admin',
          credits: CONFIG.INITIAL_USER_CREDITS,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString()
        });

        // Create default demo project
        this.data.projects.push({
          id: 'proj_default',
          userId: 'user_admin',
          name: 'Estudio Creativo Principal',
          folder: 'Todos',
          description: 'Proyecto principal para restauraciones, creaciones de video y arte digital.',
          itemsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        this.save();
      }
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- Users ---
  getUser(id = 'user_admin') {
    return this.data.users.find(u => u.id === id) || this.data.users[0];
  }

  updateUserCredits(id, amount, operation) {
    const user = this.getUser(id);
    if (!user) return false;
    user.credits = Math.max(0, (user.credits || 0) + amount);
    this.save();
    return user.credits;
  }

  setUserCredits(id, totalCredits) {
    const user = this.getUser(id);
    if (!user) return false;
    user.credits = Number(totalCredits);
    this.save();
    return user.credits;
  }

  // --- Projects ---
  getProjects(userId = 'user_admin') {
    return this.data.projects.filter(p => p.userId === userId || !p.userId);
  }

  getProject(id) {
    return this.data.projects.find(p => p.id === id);
  }

  createProject({ userId = 'user_admin', name, folder = 'Todos', description = '' }) {
    const project = {
      id: 'proj_' + uuidv4().substring(0, 8),
      userId,
      name,
      folder,
      description,
      itemsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.projects.unshift(project);
    this.save();
    return project;
  }

  deleteProject(id) {
    const index = this.data.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.projects.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Tasks / Generations ---
  getTasks({ userId, projectId, status, limit = 50 } = {}) {
    let list = [...this.data.tasks];
    if (userId) list = list.filter(t => t.userId === userId);
    if (projectId) list = list.filter(t => t.projectId === projectId);
    if (status) list = list.filter(t => t.status === status);
    
    // Sort by latest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.slice(0, limit);
  }

  getTask(id) {
    return this.data.tasks.find(t => t.id === id);
  }

  createTask(taskData) {
    const task = {
      id: 'task_' + uuidv4(),
      userId: taskData.userId || 'user_admin',
      projectId: taskData.projectId || 'proj_default',
      type: taskData.type, // 'enhance' | 'restore' | 'text_to_image' | 'text_to_video' | 'image_to_video' | 'smart_edit'
      title: taskData.title || 'Generación AI',
      status: 'pending', // 'pending' | 'processing' | 'completed' | 'error' | 'cancelled'
      progress: 0,
      stage: 'En cola de procesamiento...',
      params: taskData.params || {},
      inputUrl: taskData.inputUrl || null,
      outputUrl: null,
      beforeUrl: taskData.beforeUrl || taskData.inputUrl || null,
      afterUrl: null,
      resultType: taskData.resultType || 'image', // 'image' | 'video'
      creditsCost: taskData.creditsCost || 0,
      provider: taskData.provider || 'auto',
      error: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    };

    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  updateTask(id, updates) {
    const task = this.getTask(id);
    if (!task) return null;
    Object.assign(task, updates);
    this.save();
    return task;
  }

  deleteTask(id) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.tasks.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Settings & API Keys ---
  getSettings() {
    return {
      providers: this.data.settings.providers,
      creditCosts: this.data.settings.creditCosts,
      // Mask keys when returning to frontend for security
      hasKeys: {
        gemini: Boolean(this.data.settings.apiKeys.gemini),
        replicate: Boolean(this.data.settings.apiKeys.replicate),
        fal: Boolean(this.data.settings.apiKeys.fal),
        openai: Boolean(this.data.settings.apiKeys.openai),
      },
      keyMasks: {
        gemini: this.maskKey(this.data.settings.apiKeys.gemini),
        replicate: this.maskKey(this.data.settings.apiKeys.replicate),
        fal: this.maskKey(this.data.settings.apiKeys.fal),
        openai: this.maskKey(this.data.settings.apiKeys.openai),
      }
    };
  }

  maskKey(key) {
    if (!key || key.length < 8) return '';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  }

  getRawApiKeys() {
    return this.data.settings.apiKeys;
  }

  updateSettings({ apiKeys, providers, creditCosts }) {
    if (apiKeys) {
      for (const [k, v] of Object.entries(apiKeys)) {
        if (v && !v.includes('••••')) {
          this.data.settings.apiKeys[k] = v.trim();
        } else if (v === '') {
          this.data.settings.apiKeys[k] = '';
        }
      }
    }
    if (providers) {
      this.data.settings.providers = { ...this.data.settings.providers, ...providers };
    }
    if (creditCosts) {
      this.data.settings.creditCosts = { ...this.data.settings.creditCosts, ...creditCosts };
    }
    this.save();
    return this.getSettings();
  }
}

export const db = new Database();
