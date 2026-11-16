export class FalProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://queue.fal.run';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  async runModel(modelId, input) {
    if (!this.isConfigured()) {
      throw new Error('API Key de Fal.ai no configurada. Ingresa tu API Key en Configuración.');
    }

    const res = await fetch(`${this.baseUrl}/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Fal.ai error (${res.status}): ${errText}`);
    }

    return res.json();
  }

  // Fal.ai FLUX Pro / Dev
  async generateFluxImage({ prompt, imageSize = 'landscape_16_9' }) {
    const data = await this.runModel('fal-ai/flux/dev', {
      prompt,
      image_size: imageSize,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true
    });
    return data.images?.[0]?.url;
  }

  // Fal.ai Luma Dream Machine / Kling Video
  async generateVideo({ prompt, imageUrl = null, duration = 5, aspectRatio = '16:9' }) {
    if (imageUrl) {
      // Image to Video
      const data = await this.runModel('fal-ai/luma-dream-machine/image-to-video', {
        prompt,
        image_url: imageUrl,
        aspect_ratio: aspectRatio
      });
      return data.video?.url;
    } else {
      // Text to Video
      const data = await this.runModel('fal-ai/luma-dream-machine', {
        prompt,
        aspect_ratio: aspectRatio
      });
      return data.video?.url;
    }
  }

  // Fal.ai Crystal Clear Upscaler
  async upscale({ imageUrl, scale = 4 }) {
    const data = await this.runModel('fal-ai/ccsr', {
      image_url: imageUrl,
      scale: scale
    });
    return data.image?.url;
  }
}
