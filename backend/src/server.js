import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PORT } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import followRoutes from './routes/follow.routes.js';
import feedRoutes from './routes/feed.routes.js';
import commentRoutes from './routes/comment.routes.js';

const app = express();

// Security headers
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    })
);

app.use(
    cors({
        origin: 'http://localhost:5173'
    })
);
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Instagram Clone Backend is running');
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/follow', followRoutes);
app.use('/feed', feedRoutes);
app.use('/comments', commentRoutes);

// JSON 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// JSON error handler
app.use((err, req, res, next) => {
    console.error(err);

    const status = err.status || 500;

    res.status(status).json({
        error: err.message || 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});