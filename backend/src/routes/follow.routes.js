import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { follow, unfollow } from '../controllers/follow.controller.js';

const router = Router();

router.post('/:id', requireAuth, follow);
router.delete('/:id', requireAuth, unfollow);

export default router;