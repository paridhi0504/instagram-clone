import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

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

app.use(errorHandler); // must be LAST

export default app;