import multer from 'multer';
import { HttpError } from '../utils/httpError.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new HttpError(400, 'Only JPEG, PNG or WebP images are allowed'));
    }
}

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});