import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { feed } from '../controllers/feed.controller.js';

const router = Router();

router.get('/', requireAuth, feed);

export default router;