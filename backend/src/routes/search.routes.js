import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    users,
    hashtag
} from '../controllers/search.controller.js';

const router = Router();

router.get('/users', requireAuth, users);
router.get('/hashtags/:tag', requireAuth, hashtag);

export default router;