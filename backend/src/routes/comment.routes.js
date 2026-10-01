import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { remove } from '../controllers/comment.controller.js';

const router = Router();

router.delete('/:id', requireAuth, remove);

export default router;