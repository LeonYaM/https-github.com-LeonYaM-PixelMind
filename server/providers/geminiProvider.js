import { GoogleGenAI } from '@google/genai';

export class GeminiProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  // --- Prompt Assistant (Text Enhancement, Camera & Lighting Guidance) ---
  async enhancePrompt({ prompt, style = 'cinematic', camera = 'smooth travelling', lighting = 'volumetric cinematic lighting', mode = 'video' }) {
    if (!this.isConfigured()) {
      throw new Error('API Key de Gemini no configurada. Añádela en Configuración para usar el Asistente de Prompts.');
    }

    const systemInstruction = `Eres el Director Creativo de Inteligencia Artificial Multimedia de PIXELMIND AI.
Tu tarea es convertir descripciones simples de usuarios en Prompts Cinematográficos Profesionales de clase mundial para generadores de imagen y video de última generación (como Google Veo, Runway Gen-3, Kling, FLUX y Midjourney).

Debes devolver un objeto JSON estrictamente válido con los siguientes campos:
{
  "enhancedPrompt": "El prompt principal detallado en inglés optimizado para los modelos de IA (iluminación, composición, detalles fotorrealistas, 8k, cinematografía)",
  "negativePrompt": "Cosas a evitar (deformaciones, baja resolución, artefactos, texto, desenfoque no deseado)",
  "cameraMotion": "Instrucción técnica precisa de movimiento de cámara",
  "lightingSetup": "Configuración de iluminación sugerida",
  "recommendedModel": "Modelo recomendado (ej: Google Veo 2, FLUX.1 Pro, Kling 1.5)",
  "aspectRatioRecommended": "16:9 o 9:16 o 1:1",
  "tips": "Un consejo breve en español para el creador"
}`;

    const userMessage = `Por favor optimiza este concepto:
Concepto del usuario: "${prompt}"
Modo: ${mode}
Estilo deseado: ${style}
Movimiento de cámara: ${camera}
Iluminación: ${lighting}`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userMessage}` }] }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      return JSON.parse(responseText);
    } catch (err) {
      console.error('Error en Gemini Prompt Assistant:', err);
      // Fallback structured response if JSON parse fails
      return {
        enhancedPrompt: `${prompt}, master shot, ${style} aesthetic, ${lighting}, directed with ${camera}, 8k UHD, hyper-realistic cinematic texture, sharp focus`,
        negativePrompt: 'blurry, distorted face, low quality, duplicate limbs, pixelated, watermark',
        cameraMotion: camera,
        lightingSetup: lighting,
        recommendedModel: mode === 'video' ? 'Google Veo 2' : 'FLUX.1 Pro',
        aspectRatioRecommended: '16:9',
        tips: 'Prompt enriquecido localmente tras respuesta de red.'
      };
    }
  }

  // --- Real Text to Image Generation via Imagen 3 / Gemini ---
  async generateImage({ prompt, aspectRatio = '16:9', style = 'photorealistic' }) {
    if (!this.isConfigured()) {
      throw new Error('API Key de Gemini no configurada. Ingresa tu API Key en Configuración para generar imágenes con Imagen 3.');
    }

    try {
      // Use Imagen 3 endpoint via GenAI client or REST
      const response = await this.client.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `${prompt}, ${style} style, highest quality, highly detailed`,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9',
          outputMimeType: 'image/jpeg',
        }
      });

      if (response && response.generatedImages && response.generatedImages.length > 0) {
        const imageBase64 = response.generatedImages[0].image.imageBytes;
        return {
          success: true,
          mimeType: 'image/jpeg',
          base64: imageBase64,
          provider: 'Google Imagen 3 via Gemini API'
        };
      }
      throw new Error('No se recibió imagen generada del modelo Imagen 3.');
    } catch (err) {
      console.error('Gemini Imagen error:', err);
      throw new Error(`Error generando con Google Imagen 3: ${err.message || err}`);
    }
  }
}
