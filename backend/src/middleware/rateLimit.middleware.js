import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.js';

const skipInTests = () => process.env.NODE_ENV === 'test';

const makeStore = (prefix) => {
    if (!redis || redis.status !== 'ready') {
        return undefined;
    }

    return new RedisStore({
        prefix,
        sendCommand: (...args) => redis.call(...args)
    });
};

const common = {
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: skipInTests,
    passOnStoreError: true
};

export const authLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1000,
    limit: 20,
    store: makeStore('rl:auth:'),
    message: {
        error: 'Too many attempts, please try again in 15 minutes'
    }
});

export const apiLimiter = rateLimit({
    ...common,
    windowMs: 60 * 1000,
    limit: 300,
    store: makeStore('rl:api:'),
    message: {
        error: 'Too many requests, slow down'
    }
});