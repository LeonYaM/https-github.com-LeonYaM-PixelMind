export type ViewType =
  | 'dashboard'
  | 'image_enhancer'
  | 'photo_restorer'
  | 'text_to_image'
  | 'text_to_video'
  | 'image_to_video'
  | 'smart_editor'
  | 'projects'
  | 'history'
  | 'settings';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'error' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  credits: number;
  avatar: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  folder: string;
  description: string;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationTask {
  id: string;
  userId: string;
  projectId: string;
  type: string;
  title: string;
  status: TaskStatus;
  progress: number;
  stage: string;
  params: Record<string, any>;
  inputUrl?: string | null;
  outputUrl?: string | null;
  beforeUrl?: string | null;
  afterUrl?: string | null;
  resultType: 'image' | 'video';
  creditsCost: number;
  provider: string;
  notice?: string | null;
  isRealAI?: boolean;
  error?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface PromptOptimizationResult {
  enhancedPrompt: string;
  negativePrompt: string;
  cameraMotion: string;
  lightingSetup: string;
  recommendedModel: string;
  aspectRatioRecommended: string;
  tips: string;
}

export interface SettingsState {
  providers: {
    textToImage: string;
    textToVideo: string;
    imageToVideo: string;
    enhancer: string;
    restoration: string;
    promptAssist: string;
  };
  creditCosts: Record<string, number>;
  hasKeys: {
    gemini: boolean;
    replicate: boolean;
    fal: boolean;
    openai: boolean;
  };
  keyMasks: {
    gemini: string;
    replicate: string;
    fal: string;
    openai: string;
  };
}
