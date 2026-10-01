import {
    createPost as createPostService,
    getPostById,
    getPostOwner,
    deletePost as deletePostService
} from '../services/post.service.js';

export const createPost = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Image is required'
            });
        }

        const userId = req.user.id;
        const mediaUrl = `/uploads/${req.file.filename}`;
        const caption = req.body.caption || null;

        const post = await createPostService({
            userId,
            mediaUrl,
            caption
        });

        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

export const getPost = async (req, res, next) => {
    try {
        const postId = Number(req.params.id);

        if (Number.isNaN(postId)) {
            return res.status(400).json({
                error: 'Invalid post ID'
            });
        }

        const post = await getPostById(postId);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        res.json(post);
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req, res, next) => {
    try {
        const postId = Number(req.params.id);

        if (Number.isNaN(postId)) {
            return res.status(400).json({
                error: 'Invalid post ID'
            });
        }

        // Check whether the post exists
        const existingPost = await getPostOwner(postId);

        if (!existingPost) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Check whether the logged-in user owns the post
        if (existingPost.user_id !== req.user.id) {
            return res.status(403).json({
                error: 'You are not allowed to delete this post'
            });
        }

        const post = await deletePostService(postId, req.user.id);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};