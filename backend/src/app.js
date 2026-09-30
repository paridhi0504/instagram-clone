import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';

const app = express();

app.use(cors());          // allow the frontend to call us
app.use(express.json());  // parse JSON request bodies

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default app;