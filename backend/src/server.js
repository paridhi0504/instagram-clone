import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Instagram Clone Backend is running');
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});