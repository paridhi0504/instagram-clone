import { redis } from './config/redis.js';
import app from './app.js';
import { PORT } from './config/env.js';
import { ensureBucket } from './config/s3.js';

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

const waitForStorage = async () => {
    for (let attempt = 1; attempt <= 10; attempt++) {
        try {
            await ensureBucket();
            console.log('Object storage ready');
            return;
        } catch (err) {
            if (attempt === 10) {
                throw err;
            }

            console.log(
                `Waiting for object storage (${attempt}/10): ${err.message}`
            );

            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
};

await waitForRedis();
await waitForStorage();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});