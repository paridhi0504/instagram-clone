import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
    createPost,
    getPost,
    deletePost
} from '../controllers/post.controller.js';

const router = Router();

router.post('/', requireAuth, upload.single('image'), createPost);

router.get('/:id', requireAuth, getPost);

router.delete('/:id', requireAuth, deletePost);

export default router;