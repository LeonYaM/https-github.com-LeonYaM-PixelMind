export class ReplicateProvider {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.replicate.com/v1';
  }

  isConfigured() {
    return Boolean(this.apiToken && this.apiToken.trim().length > 10);
  }

  async _fetch(endpoint, options = {}) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const errBody = await res.text();
      let msg = `Replicate API error (${res.status})`;
      try {
        const parsed = JSON.parse(errBody);
        msg = parsed.detail || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  }

  // Poll prediction until completed or failed
  async waitForPrediction(predictionId, onProgress) {
    const startTime = Date.now();
    const timeoutMs = 300000; // 5 minutes max

    while (Date.now() - startTime < timeoutMs) {
      const prediction = await this._fetch(`/predictions/${predictionId}`);

      if (prediction.status === 'succeeded') {
        return prediction.output;
      }
      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(prediction.error || 'La tarea en Replicate falló o fue cancelada.');
      }

      if (onProgress) {
        onProgress(prediction.status, prediction.logs || '');
      }

      await new Promise(r => setTimeout(r, 2500));
    }
    throw new Error('Tiempo de espera agotado al procesar la predicción en Replicate.');
  }

  // --- Real-ESRGAN Upscaling ---
  async upscaleImage({ imageUrl, scale = 4, faceEnhance = true }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token en Configuración para usar Real-ESRGAN.');
    }

    // nightmareai/real-esrgan
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
        input: {
          image: imageUrl,
          scale: Number(scale),
          face_enhance: faceEnhance
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }

  // --- CodeFormer Face Restoration ---
  async restoreFace({ imageUrl, fidelity = 0.7, upscale = 2 }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token en Configuración para usar CodeFormer.');
    }

    // sczhou/codeformer
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c875db73c496e513409b2',
        input: {
          image: imageUrl,
          codeformer_fidelity: Number(fidelity),
          background_enhance: true,
          face_upsample: true,
          upscale: Number(upscale)
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }

  // --- Old Photo Restoration (Scratches & Tears) ---
  async restoreOldPhoto({ imageUrl, withScratch = true }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token en Configuración para restaurar fotos antiguas.');
    }

    // microsoft/bringing-old-photos-back-to-life
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: 'c75dbb1dda5bac4855b305f300c23aca524f334aa501ab878113da82e2d4199f',
        input: {
          image: imageUrl,
          HR: true,
          with_scratch: withScratch
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }

  // --- Colorize Black & White ---
  async colorizeImage({ imageUrl, renderFactor = 35 }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token para colorear fotografías.');
    }

    // ariel415el/colorizer
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: '0da600fab0c45a66218143f81e57e99764e6063bfab72239d6182f00d901e788',
        input: {
          image: imageUrl,
          render_factor: renderFactor
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }

  // --- Background Removal ---
  async removeBackground({ imageUrl }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token para remover fondos.');
    }

    // cjwbw/rembg
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242fa093f9f40e8a947d630496fa9d503d28fddf3729',
        input: {
          image: imageUrl
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }

  // --- FLUX Text to Image ---
  async generateFluxImage({ prompt, aspectRatio = '16:9', numOutputs = 1 }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token para generar con FLUX.');
    }

    // black-forest-labs/flux-schnell
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: 'black-forest-labs/flux-schnell',
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          num_outputs: numOutputs,
          output_format: 'webp',
          output_quality: 90
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }

  // --- Image to Video (Stable Video Diffusion / Kling) ---
  async animateImage({ imageUrl, motionBucketId = 127, fps = 24, duration = 5 }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token para animar imágenes.');
    }

    // stability-ai/stable-video-diffusion
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: '3f0457e4619da8151802eac2804c7702971a070417957da02bc179554d2d40d6',
        input: {
          input_image: imageUrl,
          motion_bucket_id: motionBucketId,
          fps: fps,
          cond_aug: 0.02,
          decoding_t: 7
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }

  // --- Text to Video ---
  async generateTextToVideo({ prompt, duration = 5, aspectRatio = '16:9' }) {
    if (!this.isConfigured()) {
      throw new Error('Token de Replicate no configurado. Ingresa tu API Token para generar video desde texto.');
    }

    // minimax/video-01 or another reliable fast text to video model
    const prediction = await this._fetch('/predictions', {
      method: 'POST',
      body: JSON.stringify({
        version: 'minimax/video-01',
        input: {
          prompt,
          prompt_optimizer: true
        }
      })
    });

    return this.waitForPrediction(prediction.id);
  }
}
