import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  follow,
  unfollow,
  followers,
  following,
} from '../controllers/follow.controller.js';

const router = Router();

router.get('/:id/followers', requireAuth, followers);
router.get('/:id/following', requireAuth, following);

router.post('/:id', requireAuth, follow);
router.delete('/:id', requireAuth, unfollow);

export default router;