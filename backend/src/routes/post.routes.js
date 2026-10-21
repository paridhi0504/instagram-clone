import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

import {
    createPost,
    getPost,
    deletePost
} from '../controllers/post.controller.js';

import { like, unlike } from '../controllers/like.controller.js';

import {
    create as createComment,
    list as listComments
} from '../controllers/comment.controller.js';

import { validate } from '../middleware/validate.middleware.js';

import {
    createPostSchema,
    commentSchema
} from '../validation/schemas.js';

const router = Router();

// Create a post
router.post(
    '/',
    requireAuth,
    upload.single('image'),
    validate(createPostSchema),
    createPost
);

// Get a single post
router.get('/:id', requireAuth, getPost);

// Delete a post
router.delete('/:id', requireAuth, deletePost);

// Like and unlike a post
router.post('/:id/like', requireAuth, like);
router.delete('/:id/like', requireAuth, unlike);

// Create and list comments
router.post(
    '/:id/comments',
    requireAuth,
    validate(commentSchema),
    createComment
);

router.get('/:id/comments', requireAuth, listComments);

export default router;