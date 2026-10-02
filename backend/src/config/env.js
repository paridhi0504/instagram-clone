import dotenv from 'dotenv';

// Vitest sets NODE_ENV=test automatically
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 4000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const REDIS_URL = process.env.REDIS_URL;   // optional: no Redis = no caching
export const TRUST_PROXY = Number(process.env.TRUST_PROXY || 0);
export const S3_ENDPOINT = process.env.S3_ENDPOINT;          // unset = use local disk
export const S3_BUCKET = process.env.S3_BUCKET || 'instagram-media';
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
export const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in your env file');
}