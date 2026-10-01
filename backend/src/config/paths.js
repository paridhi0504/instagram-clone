import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// src/config -> up two levels -> backend/uploads
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');