import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import postRoutes from './routes/post.routes.js';
import { UPLOADS_DIR } from './config/paths.js';
import followRoutes from './routes/follow.routes.js';
import feedRoutes from './routes/feed.routes.js';
import commentRoutes from './routes/comment.routes.js';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/posts', postRoutes);
app.use('/feeds', feedRoutes);
app.use('/follows', followRoutes);
app.use('/comments', commentRoutes);   

app.use(errorHandler); // still LAST

export default app;