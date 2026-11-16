import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config.js';

export class LocalEngine {
  constructor() {
    this.name = 'PixelMind Local Processing Pipeline';
  }

  // Generate an SVG-based preview for testing UI and before/after workflows when API key is missing
  async processLocalFallback({ type, inputPath, params = {} }) {
    const filename = `local_${type}_${Date.now()}.png`;
    const outputPath = path.join(CONFIG.PATHS.OUTPUTS, filename);

    // If input file exists, we can create an enhanced copy or watermark indicating local demo
    if (inputPath && fs.existsSync(inputPath)) {
      // Copy file as baseline
      fs.copyFileSync(inputPath, outputPath);
    } else {
      // Create a dummy high-resolution placeholder
      const placeholderSvg = `
        <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0B0D17" />
              <stop offset="50%" stop-color="#1E1B4B" />
              <stop offset="100%" stop-color="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="1280" height="720" fill="url(#g)" />
          <text x="640" y="320" font-family="sans-serif" font-size="44" font-weight="bold" fill="#00F0FF" text-anchor="middle">
            PIXELMIND AI - ${type.toUpperCase()}
          </text>
          <text x="640" y="380" font-family="sans-serif" font-size="20" fill="#E2E8F0" text-anchor="middle">
            Procesado con Motor Local de Evaluación
          </text>
          <text x="640" y="440" font-family="sans-serif" font-size="16" fill="#A855F7" text-anchor="middle">
            (Para activar el modelo real de alta fidelidad, configura tu API Key en Ajustes)
          </text>
        </svg>
      `;
      const svgPath = outputPath.replace(/\.png$/, '.svg');
      fs.writeFileSync(svgPath, placeholderSvg.trim());
      return `/outputs/${path.basename(svgPath)}`;
    }

    return `/outputs/${filename}`;
  }

  // Create sample video clip for testing video playback when external video provider is not keyed
  async processLocalVideoFallback({ prompt = '' }) {
    // We can provide a cinematic royalty-free demo video link or placeholder MP4
    return 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1610-large.mp4';
  }
}
