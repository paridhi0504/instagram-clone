import { redis } from './config/redis.js';

const waitForRedis = async () => {
    if (!redis) {
        return;
    }

    const timeout = 3000;
    const start = Date.now();

    while (redis.status !== 'ready' && Date.now() - start < timeout) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (redis.status === 'ready') {
        console.log('Redis connected');
    } else {
        console.log('Redis unavailable, starting without Redis rate limiting');
    }
};

await waitForRedis();

const { default: app } = await import('./app.js');
const { PORT } = await import('./config/env.js');

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});