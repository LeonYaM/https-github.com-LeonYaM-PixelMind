import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || '0.0.0.0',
  ENV: process.env.NODE_ENV || 'development',
  
  PATHS: {
    ROOT: path.join(__dirname, '..'),
    STORAGE: path.join(__dirname, 'storage'),
    UPLOADS: path.join(__dirname, 'storage', 'uploads'),
    OUTPUTS: path.join(__dirname, 'storage', 'outputs'),
    DATA: path.join(__dirname, 'storage', 'data'),
    DB_FILE: path.join(__dirname, 'storage', 'data', 'pixelmind.json'),
  },

  // Credit costs per operation (configurable by Admin)
  DEFAULT_CREDIT_COSTS: {
    upscale_2x: 2,
    upscale_4x: 4,
    upscale_8x: 8,
    face_restore: 3,
    old_photo: 4,
    colorize: 3,
    remove_bg: 2,
    replace_bg: 4,
    doc_enhance: 2,
    text_to_image: 5,
    text_to_video: 15,
    image_to_video: 20,
    smart_edit: 6,
    prompt_assist: 1
  },

  UPLOAD_LIMITS: {
    MAX_FILE_SIZE_MB: 50,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime']
  },

  // Initial user settings
  INITIAL_USER_CREDITS: 150
};
