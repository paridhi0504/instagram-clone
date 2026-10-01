import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getMe, getProfile, getUserPosts } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', requireAuth, getMe);              // must come BEFORE '/:id'
router.get('/:id', requireAuth, getProfile);
router.get('/:id/posts', requireAuth, getUserPosts);

export default router;