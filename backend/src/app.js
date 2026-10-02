import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import os from 'os';

import { pool } from './config/db.js';
import { CLIENT_URL, NODE_ENV, TRUST_PROXY } from './config/env.js';
import { UPLOADS_DIR } from './config/paths.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import followRoutes from './routes/follow.routes.js';
import feedRoutes from './routes/feed.routes.js';
import commentRoutes from './routes/comment.routes.js';

import { apiLimiter, authLimiter } from './middleware/rateLimit.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Behind Nginx, trust its X-Forwarded-For header so req.ip is the real client
if (TRUST_PROXY) app.set('trust proxy', TRUST_PROXY);

// Show which copy handled each request
app.use((req, res, next) => {
    res.setHeader('X-Served-By', os.hostname());
    next();
});

// Helmet's default blocks cross-origin image loads
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
);

app.use(cors({ origin: CLIENT_URL }));

if (NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));

// Static images
app.use('/uploads', express.static(UPLOADS_DIR));

// Health check
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            status: 'ok',
            instance: os.hostname(),
            dbTime: result.rows[0].now
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

app.use(apiLimiter);

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/follow', followRoutes);
app.use('/feed', feedRoutes);
app.use('/comments', commentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;