import { GenerationTask, Project, SettingsState, User, PromptOptimizationResult } from '../types';

const API_BASE = '/api';

export const api = {
  // --- Uploads ---
  async uploadImage(file: File): Promise<{ fileUrl: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/enhance/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error en la subida' }));
      throw new Error(err.error || 'Fallo al subir la imagen');
    }
    return res.json();
  },

  // --- Image Enhancer ---
  async upscaleImage(data: {
    inputUrl: string;
    filename?: string;
    scale: number;
    faceEnhance?: boolean;
    denoise?: boolean;
    sharpen?: boolean;
    projectId?: string;
  }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/enhance/upscale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al iniciar mejoramiento');
    return json;
  },

  async restoreFace(data: {
    inputUrl: string;
    filename?: string;
    fidelity?: number;
    upscale?: number;
    projectId?: string;
  }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/enhance/face-restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error restaurando rostros');
    return json;
  },

  async restoreOldPhoto(data: {
    inputUrl: string;
    filename?: string;
    withScratch?: boolean;
    colorize?: boolean;
    projectId?: string;
  }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/enhance/restore-old`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error restaurando foto antigua');
    return json;
  },

  async colorizePhoto(data: { inputUrl: string; filename?: string; projectId?: string }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/enhance/colorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al colorizar imagen');
    return json;
  },

  async removeBackground(data: { inputUrl: string; filename?: string; projectId?: string }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/enhance/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al remover fondo');
    return json;
  },

  // --- Generation ---
  async generateTextToImage(data: {
    prompt: string;
    style?: string;
    aspectRatio?: string;
    numOutputs?: number;
    projectId?: string;
  }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/generate/text-to-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error generando imagen');
    return json;
  },

  async generateTextToVideo(data: {
    prompt: string;
    duration?: number;
    resolution?: string;
    aspectRatio?: string;
    style?: string;
    camera?: string;
    projectId?: string;
  }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/generate/text-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error generando video');
    return json;
  },

  async generateImageToVideo(data: {
    inputUrl: string;
    endImageUrl?: string;
    prompt?: string;
    duration?: number;
    camera?: string;
    intensity?: string;
    preserveFaces?: boolean;
    projectId?: string;
  }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/generate/image-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al animar imagen a video');
    return json;
  },

  // --- Smart Edit ---
  async inpaintImage(data: {
    inputUrl: string;
    maskData?: string;
    prompt: string;
    action?: string;
    projectId?: string;
  }): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/edit/inpaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al ejecutar edición inteligente');
    return json;
  },

  // --- Prompt Assistant ---
  async optimizePrompt(data: {
    prompt: string;
    style?: string;
    camera?: string;
    lighting?: string;
    mode?: 'image' | 'video';
  }): Promise<{ result: PromptOptimizationResult }> {
    const res = await fetch(`${API_BASE}/prompt/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error en optimizador de prompts');
    return json;
  },

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    const json = await res.json();
    return json.projects || [];
  },

  async createProject(data: { name: string; folder?: string; description?: string }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error creando proyecto');
    return json.project;
  },

  async deleteProject(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // --- Queue ---
  async getTasks(params?: { status?: string; type?: string; projectId?: string }): Promise<GenerationTask[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/queue/tasks?${query}`);
    const json = await res.json();
    return json.tasks || [];
  },

  async cancelTask(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/queue/tasks/${id}/cancel`, { method: 'POST' });
    return res.ok;
  },

  async retryTask(id: string): Promise<{ task: GenerationTask }> {
    const res = await fetch(`${API_BASE}/queue/tasks/${id}/retry`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error reintentando tarea');
    return json;
  },

  async deleteTask(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/queue/tasks/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // --- Users & Credits ---
  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/users/me`);
    const json = await res.json();
    return json.user;
  },

  async rechargeCredits(amount: number = 100): Promise<{ credits: number }> {
    const res = await fetch(`${API_BASE}/users/recharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return res.json();
  },

  async setAdminCredits(userId: string, credits: number): Promise<{ credits: number }> {
    const res = await fetch(`${API_BASE}/users/admin/set-credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, credits })
    });
    return res.json();
  },

  // --- Settings ---
  async getSettings(): Promise<SettingsState> {
    const res = await fetch(`${API_BASE}/settings`);
    const json = await res.json();
    return json.settings;
  },

  async updateSettings(data: Partial<SettingsState & { apiKeys: Record<string, string> }>): Promise<SettingsState> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.settings;
  },

  async testConnection(provider: string, key?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/settings/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, key })
    });
    return res.json();
  }
};
