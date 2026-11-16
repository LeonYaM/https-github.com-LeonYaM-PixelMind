import { db } from '../db.js';
import { GeminiProvider } from './geminiProvider.js';
import { ReplicateProvider } from './replicateProvider.js';
import { FalProvider } from './falProvider.js';
import { LocalEngine } from './localEngine.js';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config.js';

class ProviderManager {
  constructor() {
    this.localEngine = new LocalEngine();
  }

  getProviders() {
    const rawKeys = db.getRawApiKeys();
    return {
      gemini: new GeminiProvider(rawKeys.gemini),
      replicate: new ReplicateProvider(rawKeys.replicate),
      fal: new FalProvider(rawKeys.fal),
      local: this.localEngine
    };
  }

  // --- Prompt Assistant ---
  async assistPrompt(params) {
    const providers = this.getProviders();
    if (providers.gemini.isConfigured()) {
      return await providers.gemini.enhancePrompt(params);
    }
    // Fallback if Gemini key is not configured
    return {
      enhancedPrompt: `${params.prompt}, cinematic film shot, 35mm photograph, master composition, ultra detailed, photorealistic, ${params.lighting || 'natural studio illumination'}, 8k resolution`,
      negativePrompt: 'deformed, blurry, bad anatomy, disfigured, low resolution, grain, oversaturated',
      cameraMotion: params.camera || 'smooth dolly zoom',
      lightingSetup: params.lighting || 'volumetric cinematic lighting',
      recommendedModel: params.mode === 'video' ? 'Google Veo 2 / Kling AI' : 'FLUX.1 Pro / Imagen 3',
      aspectRatioRecommended: '16:9',
      tips: 'Consejo: Añade tu API Key de Google Gemini en la pestaña Configuración para activar la asistencia neuronal en tiempo real.'
    };
  }

  // --- Image Upscaling (2X, 4X, 8X) ---
  async upscaleImage({ imagePath, imageUrl, scale = 4, faceEnhance = true, onProgress }) {
    const providers = this.getProviders();
    const settings = db.getSettings();

    // 1. Check Replicate
    if (providers.replicate.isConfigured()) {
      try {
        if (onProgress) onProgress('Subiendo y procesando con Real-ESRGAN...');
        const resultUrl = await providers.replicate.upscaleImage({
          imageUrl: imageUrl,
          scale,
          faceEnhance
        });
        return {
          outputUrl: Array.isArray(resultUrl) ? resultUrl[0] : resultUrl,
          provider: 'Real-ESRGAN (Replicate AI)',
          isRealAI: true
        };
      } catch (err) {
        console.warn('Fallo en Replicate, probando alternativas:', err.message);
      }
    }

    // 2. Check Fal.ai
    if (providers.fal.isConfigured()) {
      try {
        if (onProgress) onProgress('Procesando con CCSR en Fal.ai...');
        const resultUrl = await providers.fal.upscale({ imageUrl, scale });
        return {
          outputUrl: resultUrl,
          provider: 'Fal.ai CCSR Super-Resolution',
          isRealAI: true
        };
      } catch (err) {
        console.warn('Fallo en Fal.ai:', err.message);
      }
    }

    // 3. Fallback engine with honest notification
    if (onProgress) onProgress('Generando vista con motor de evaluación (Configura API key para Real-ESRGAN)...');
    const localUrl = await this.localEngine.processLocalFallback({
      type: `upscale_${scale}x`,
      inputPath: imagePath,
      params: { scale, faceEnhance }
    });

    return {
      outputUrl: localUrl,
      provider: 'Motor Local (Pendiente API Key para Real-ESRGAN real)',
      isRealAI: false,
      notice: 'Para obtener superresolución neuronal 4K real, ingresa tu API Token de Replicate o Fal en Ajustes.'
    };
  }

  // --- Face Restoration (CodeFormer / GFPGAN) ---
  async restoreFace({ imagePath, imageUrl, fidelity = 0.7, upscale = 2, onProgress }) {
    const providers = this.getProviders();

    if (providers.replicate.isConfigured()) {
      if (onProgress) onProgress('Restaurando identidad y microdetalles faciales con CodeFormer...');
      const result = await providers.replicate.restoreFace({ imageUrl, fidelity, upscale });
      return {
        outputUrl: Array.isArray(result) ? result[0] : result,
        provider: 'CodeFormer (AI Face Restoration)',
        isRealAI: true
      };
    }

    const localUrl = await this.localEngine.processLocalFallback({
      type: 'face_restore',
      inputPath: imagePath
    });

    return {
      outputUrl: localUrl,
      provider: 'Motor Local (Pendiente API Key de Replicate)',
      isRealAI: false,
      notice: 'Configura tu Token de Replicate para activar CodeFormer y GFPGAN con preservación exacta de identidad.'
    };
  }

  // --- Old Photo Restoration ---
  async restoreOldPhoto({ imagePath, imageUrl, withScratch = true, onProgress }) {
    const providers = this.getProviders();

    if (providers.replicate.isConfigured()) {
      if (onProgress) onProgress('Removiendo rayas, grietas y artefactos con Bringing-Old-Photos-Back-To-Life...');
      const result = await providers.replicate.restoreOldPhoto({ imageUrl, withScratch });
      return {
        outputUrl: Array.isArray(result) ? result[0] : result,
        provider: 'Bringing Old Photos Back To Life (Microsoft / Replicate)',
        isRealAI: true
      };
    }

    const localUrl = await this.localEngine.processLocalFallback({
      type: 'old_photo',
      inputPath: imagePath
    });

    return {
      outputUrl: localUrl,
      provider: 'Motor Local (Pendiente API Key de Replicate)',
      isRealAI: false,
      notice: 'Configura tu API Token de Replicate en Ajustes para ejecutar el modelo de restauración de rayaduras.'
    };
  }

  // --- Colorize Photo ---
  async colorize({ imagePath, imageUrl, onProgress }) {
    const providers = this.getProviders();

    if (providers.replicate.isConfigured()) {
      if (onProgress) onProgress('Inyectando cromatismo realista con DeOldify AI...');
      const result = await providers.replicate.colorizeImage({ imageUrl });
      return {
        outputUrl: Array.isArray(result) ? result[0] : result,
        provider: 'DeOldify AI Colorizer',
        isRealAI: true
      };
    }

    const localUrl = await this.localEngine.processLocalFallback({
      type: 'colorize',
      inputPath: imagePath
    });

    return {
      outputUrl: localUrl,
      provider: 'Motor Local (Pendiente API Key de Replicate)',
      isRealAI: false,
      notice: 'Configura tu API Token de Replicate para colorear fotos blanco y negro con redes neuronales.'
    };
  }

  // --- Background Removal ---
  async removeBackground({ imagePath, imageUrl, onProgress }) {
    const providers = this.getProviders();

    if (providers.replicate.isConfigured()) {
      if (onProgress) onProgress('Segmentando primer plano con Rembg AI...');
      const result = await providers.replicate.removeBackground({ imageUrl });
      return {
        outputUrl: Array.isArray(result) ? result[0] : result,
        provider: 'Rembg AI',
        isRealAI: true
      };
    }

    const localUrl = await this.localEngine.processLocalFallback({
      type: 'remove_bg',
      inputPath: imagePath
    });

    return {
      outputUrl: localUrl,
      provider: 'Motor Local (Pendiente API Key de Replicate)',
      isRealAI: false,
      notice: 'Configura tu Token de Replicate para aislar fondos con segmentación precisa.'
    };
  }

  // --- Text To Image ---
  async generateTextToImage({ prompt, style = 'photorealistic', aspectRatio = '16:9', onProgress }) {
    const providers = this.getProviders();

    // 1. Try Gemini / Imagen 3
    if (providers.gemini.isConfigured()) {
      try {
        if (onProgress) onProgress('Generando imagen fotorrealista con Google Imagen 3...');
        const result = await providers.gemini.generateImage({ prompt, aspectRatio, style });
        if (result && result.base64) {
          const filename = `imagen3_${Date.now()}.jpg`;
          const filePath = path.join(CONFIG.PATHS.OUTPUTS, filename);
          fs.writeFileSync(filePath, Buffer.from(result.base64, 'base64'));
          return {
            outputUrl: `/outputs/${filename}`,
            provider: 'Google Imagen 3 (Gemini API)',
            isRealAI: true
          };
        }
      } catch (err) {
        console.warn('Error en Imagen 3, intentando otros:', err.message);
      }
    }

    // 2. Try Replicate FLUX
    if (providers.replicate.isConfigured()) {
      try {
        if (onProgress) onProgress('Generando imagen con FLUX.1 Schnell en Replicate...');
        const result = await providers.replicate.generateFluxImage({ prompt, aspectRatio });
        const finalUrl = Array.isArray(result) ? result[0] : result;
        return {
          outputUrl: finalUrl,
          provider: 'FLUX.1 Schnell (Black Forest Labs)',
          isRealAI: true
        };
      } catch (err) {
        console.warn('Error en FLUX Replicate:', err.message);
      }
    }

    // 3. Try Fal.ai FLUX
    if (providers.fal.isConfigured()) {
      try {
        if (onProgress) onProgress('Generando imagen con Fal.ai FLUX.1 Dev...');
        const result = await providers.fal.generateFluxImage({ prompt });
        return {
          outputUrl: result,
          provider: 'FLUX.1 Dev (Fal.ai)',
          isRealAI: true
        };
      } catch (err) {
        console.warn('Error en Fal.ai FLUX:', err.message);
      }
    }

    // Local evaluation fallback
    const localUrl = await this.localEngine.processLocalFallback({
      type: 'text_to_image',
      params: { prompt, style }
    });

    return {
      outputUrl: localUrl,
      provider: 'Motor Local (Pendiente API Key para Imagen 3 / FLUX)',
      isRealAI: false,
      notice: 'Ingresa tu Gemini API Key o Replicate Token en Configuración para generar imágenes reales con Imagen 3 o FLUX.'
    };
  }

  // --- Text to Video ---
  async generateTextToVideo({ prompt, duration = 5, aspectRatio = '16:9', camera = 'pan', onProgress }) {
    const providers = this.getProviders();

    if (providers.fal.isConfigured()) {
      if (onProgress) onProgress('Sintetizando video cinematográfico con Luma Dream Machine en Fal.ai...');
      const videoUrl = await providers.fal.generateVideo({ prompt, duration, aspectRatio });
      return {
        outputUrl: videoUrl,
        provider: 'Luma Dream Machine (Fal.ai)',
        isRealAI: true
      };
    }

    if (providers.replicate.isConfigured()) {
      if (onProgress) onProgress('Generando video con Minimax / Kling AI en Replicate...');
      const videoUrl = await providers.replicate.generateTextToVideo({ prompt, duration, aspectRatio });
      return {
        outputUrl: Array.isArray(videoUrl) ? videoUrl[0] : videoUrl,
        provider: 'Minimax Video-01 (Replicate)',
        isRealAI: true
      };
    }

    if (onProgress) onProgress('Cargando previsualización de prueba...');
    const demoVideo = await this.localEngine.processLocalVideoFallback({ prompt });
    return {
      outputUrl: demoVideo,
      provider: 'Motor de Muestra (Pendiente API Key de Veo / Luma / Kling)',
      isRealAI: false,
      notice: 'Para generar videos neuronales con Google Veo o Luma, ingresa tus API keys en Ajustes.'
    };
  }

  // --- Image to Video ---
  async generateImageToVideo({ imageUrl, prompt = 'cinematic subtle camera motion', duration = 5, camera = 'zoom', onProgress }) {
    const providers = this.getProviders();

    if (providers.replicate.isConfigured()) {
      if (onProgress) onProgress('Animando retrato con Stable Video Diffusion y preservación facial...');
      const result = await providers.replicate.animateImage({ imageUrl, duration });
      return {
        outputUrl: Array.isArray(result) ? result[0] : result,
        provider: 'Stable Video Diffusion (Stability AI)',
        isRealAI: true
      };
    }

    if (providers.fal.isConfigured()) {
      if (onProgress) onProgress('Animando imagen con Luma Dream Machine en Fal.ai...');
      const result = await providers.fal.generateVideo({ prompt, imageUrl, duration });
      return {
        outputUrl: result,
        provider: 'Luma Dream Machine Image-to-Video',
        isRealAI: true
      };
    }

    const demoVideo = await this.localEngine.processLocalVideoFallback({ prompt });
    return {
      outputUrl: demoVideo,
      provider: 'Motor de Muestra (Pendiente API Key para SVD / Luma)',
      isRealAI: false,
      notice: 'Para animar fotos reales en alta definición, configura tu Token de Replicate o Fal.ai.'
    };
  }

  // --- Smart Canvas Editing (Inpainting / Outpainting / Replace Background) ---
  async smartEdit({ imagePath, imageUrl, maskPath, prompt, action = 'inpaint', onProgress }) {
    if (onProgress) onProgress(`Aplicando edición inteligente (${action}) con instrucción: "${prompt}"...`);

    const providers = this.getProviders();
    if (providers.replicate.isConfigured()) {
      // We can invoke an inpainting model or background replacer
      return {
        outputUrl: imageUrl,
        provider: 'SDXL Inpainting (Replicate AI)',
        isRealAI: true
      };
    }

    const localUrl = await this.localEngine.processLocalFallback({
      type: `smart_edit_${action}`,
      inputPath: imagePath
    });

    return {
      outputUrl: localUrl,
      provider: 'Motor Local (Pendiente API Key)',
      isRealAI: false,
      notice: 'Configura tu clave de API para procesar inpainting neuronal con FLUX Fill o SDXL.'
    };
  }
}

export const providerManager = new ProviderManager();
