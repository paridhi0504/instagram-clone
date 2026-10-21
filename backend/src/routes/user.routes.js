import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getMe,
  updateMe,
  getProfile,
  getUserPosts,
} from '../controllers/user.controller.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);

router.get('/:id', requireAuth, getProfile);
router.get('/:id/posts', requireAuth, getUserPosts);

export default router;