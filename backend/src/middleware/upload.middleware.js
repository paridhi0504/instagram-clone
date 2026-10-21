import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { HttpError } from '../utils/httpError.js';

const ALLOWED_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

export async function validateImageContent(req, res, next) {
    try {
        if (!req.file) {
            return next();
        }

        const detectedType = await fileTypeFromBuffer(req.file.buffer);

        if (
            !detectedType ||
            !Object.hasOwn(ALLOWED_TYPES, detectedType.mime) ||
            detectedType.mime !== req.file.mimetype
        ) {
            return next(
                new HttpError(400, 'Only valid JPEG, PNG or WebP images are allowed')
            );
        }

        req.file.detectedExtension = ALLOWED_TYPES[detectedType.mime];

        next();
    } catch (error) {
        next(error);
    }
}