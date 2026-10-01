import rateLimit from 'express-rate-limit';

const skipInTests = () => process.env.NODE_ENV === 'test';

// strict: protects login/register from password guessing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipInTests,
  message: { error: 'Too many attempts, please try again in 15 minutes' },
});

// generous: a general safety net for the whole API
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipInTests,
  message: { error: 'Too many requests, slow down' },
});