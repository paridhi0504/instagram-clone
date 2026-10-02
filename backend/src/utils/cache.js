import { redis } from '../config/redis.js';
import { NODE_ENV } from '../config/env.js';

const log = (...args) => {
  if (NODE_ENV === 'development') console.log(...args);
};

// Cache-aside:
// Use Redis when it is ready.
// If Redis is unavailable, go directly to PostgreSQL.
export async function cached(key, ttlSeconds, fetcher) {
  if (!redis || redis.status !== 'ready') {
    log('Redis unavailable, using DB:', key);
    return fetcher();
  }

  try {
    const hit = await redis.get(key);

    if (hit) {
      log('cache HIT ', key);
      return JSON.parse(hit);
    }
  } catch (err) {
    log('cache read failed, falling back to DB:', err.message);
  }

  log('cache MISS', key);

  const data = await fetcher();

  if (redis.status === 'ready') {
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {
      log('cache write failed:', err.message);
    }
  }

  return data;
}

export async function feedVersion(userId) {
  if (!redis || redis.status !== 'ready') {
    return 0;
  }

  try {
    return (await redis.get(`feedver:${userId}`)) || 0;
  } catch {
    return 0;
  }
}

export async function invalidateFeed(userId) {
  if (!redis || redis.status !== 'ready') {
    return;
  }

  try {
    await redis.incr(`feedver:${userId}`);
  } catch {
    // Redis failure must never break a real action.
  }
}