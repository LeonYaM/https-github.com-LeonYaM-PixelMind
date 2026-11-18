import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { CONFIG } from '../config.js';

const execFileAsync = promisify(execFile);

export class LocalEngine {
  constructor() {
    this.name = 'PixelMind Local Processing Pipeline';
    // Path to ffmpeg-static in parent node_modules
    this.ffmpegPath = path.join(CONFIG.PATHS.ROOT, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
    this.hasFfmpeg = fs.existsSync(this.ffmpegPath);
  }

  // Generate an SVG or enhanced copy for testing UI and before/after workflows when API key is missing
  async processLocalFallback({ type, inputPath, params = {} }) {
    const filename = `local_${type}_${Date.now()}.png`;
    const outputPath = path.join(CONFIG.PATHS.OUTPUTS, filename);

    if (inputPath && fs.existsSync(inputPath)) {
      // If input image exists, copy it to output
      fs.copyFileSync(inputPath, outputPath);
      return `/outputs/${filename}`;
    } else {
      // Create a high-resolution graphical placeholder
      const placeholderSvg = `
        <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0B0D17" />
              <stop offset="40%" stop-color="#141834" />
              <stop offset="100%" stop-color="#0A0C16" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
            </radialGradient>
          </defs>
          <rect width="1280" height="720" fill="url(#g)" />
          <circle cx="640" cy="360" r="300" fill="url(#glow)" />
          <rect x="240" y="160" width="800" height="400" rx="24" fill="#0E1325" stroke="#25325C" stroke-width="2" />
          <text x="640" y="290" font-family="'Inter', sans-serif" font-size="38" font-weight="bold" fill="#00F0FF" text-anchor="middle">
            PIXELMIND AI • ${type.toUpperCase().replace(/_/g, ' ')}
          </text>
          <text x="640" y="350" font-family="'Inter', sans-serif" font-size="20" fill="#E2E8F0" text-anchor="middle">
            Generación Procesada con Motor Local
          </text>
          <text x="640" y="410" font-family="'JetBrains Mono', monospace" font-size="15" fill="#A855F7" text-anchor="middle">
            (Para activar el modelo real de alta fidelidad, configura tu API Key en Ajustes)
          </text>
          <text x="640" y="470" font-family="'Inter', sans-serif" font-size="13" fill="#64748B" text-anchor="middle">
            Resolución: 1280x720 • Estado: Listo para previsualizar y descargar
          </text>
        </svg>
      `;
      const svgPath = outputPath.replace(/\.png$/, '.svg');
      fs.writeFileSync(svgPath, placeholderSvg.trim());
      return `/outputs/${path.basename(svgPath)}`;
    }
  }

  // Create real local MP4 video file using ffmpeg
  async processLocalVideoFallback({ prompt = '', duration = 5 }) {
    const filename = `local_video_${Date.now()}.mp4`;
    const outputPath = path.join(CONFIG.PATHS.OUTPUTS, filename);

    if (this.hasFfmpeg) {
      try {
        const dur = Math.min(Math.max(Number(duration) || 5, 3), 10);
        // Generate an animated gradient video using ffmpeg test filters
        await execFileAsync(this.ffmpegPath, [
          '-y',
          '-f', 'lavfi',
          '-i', `testsrc=size=1280x720:rate=25:duration=${dur}`,
          '-vf', 'hue=s=sin(2*PI*t/5)',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          outputPath
        ]);
        if (fs.existsSync(outputPath)) {
          return `/outputs/${filename}`;
        }
      } catch (err) {
        console.warn('Ffmpeg video generation fallback error:', err.message);
      }
    }

    // Secondary fallback: local static MP4
    return '/outputs/demo_test.mp4';
  }
}
