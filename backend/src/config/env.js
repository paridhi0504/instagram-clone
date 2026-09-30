import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in .env');
}