import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().max(255);

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'must be at least 3 characters')
    .max(30, 'must be 30 characters or fewer')
    .regex(/^[a-z0-9_.]+$/, 'can only contain letters, numbers, _ and .'),
  email,
  password: z
    .string()
    .min(8, 'must be at least 8 characters')
    .max(72, 'must be 72 characters or fewer'), // bcrypt ignores everything past 72 bytes
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'is required'),
});

export const createPostSchema = z.object({
  caption: z.string().max(2200, 'must be 2200 characters or fewer').optional(),
});

export const commentSchema = z.object({
  text: z.string().trim().min(1, 'cannot be empty').max(500, 'must be 500 characters or fewer'),
});