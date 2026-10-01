import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
    createPost,
    getPost,
    deletePost
} from '../controllers/post.controller.js';
import { like, unlike } from '../controllers/like.controller.js';
import { create as createComment, list as listComments } from '../controllers/comment.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPostSchema, commentSchema } from '../validation/schemas.js';

const router = Router();

router.post('/', requireAuth, upload.single('image'), createPost);

router.get('/:id', requireAuth, getPost);

router.delete('/:id', requireAuth, deletePost);

router.post('/:id/like', requireAuth, like);
router.delete('/:id/like', requireAuth, unlike);
router.post('/:id/comments', requireAuth, createComment);
router.get('/:id/comments', requireAuth, listComments);

router.post('/', requireAuth, upload.single('image'), validate(createPostSchema), createPost);
// ...
router.post('/:id/comments', requireAuth, validate(commentSchema), createComment);

export default router;