import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/s3.js';
import { S3_BUCKET, S3_PUBLIC_URL } from '../config/env.js';
import { UPLOADS_DIR } from '../config/paths.js';

// extension comes from our allow-list, never from the user's filename
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

export async function saveImage(file) {
  const name = `${crypto.randomUUID()}${EXT[file.mimetype]}`;

  if (s3) {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: name,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    return `${S3_PUBLIC_URL}/${name}`;          // full public URL
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, name), file.buffer);
  return `/uploads/${name}`;                    // local fallback (served by Express)
}

export async function deleteImage(mediaUrl) {
  try {
    const name = path.basename(mediaUrl);
    if (mediaUrl.startsWith('/uploads/')) {
      await fs.unlink(path.join(UPLOADS_DIR, name));
    } else if (s3 && mediaUrl.startsWith(S3_PUBLIC_URL)) {
      await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: name }));
    }
  } catch {
    // a missing file must never break deleting a post
  }
}