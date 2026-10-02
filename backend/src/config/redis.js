import Redis from 'ioredis';
import { REDIS_URL } from './env.js';

export const redis = REDIS_URL
    ? new Redis(REDIS_URL, {
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: (times) => Math.min(times * 100, 2000),
          reconnectOnError: () => true
      })
    : null;

if (redis) {
    redis.on('connect', () => {
        console.log('Redis connection established');
    });

    redis.on('ready', () => {
        console.log('Redis ready');
    });

    redis.on('reconnecting', () => {
        console.log('Redis reconnecting...');
    });

    redis.on('close', () => {
        console.log('Redis connection closed');
    });

    redis.on('error', (err) => {
        console.error('Redis error:', err.message);
    });
}