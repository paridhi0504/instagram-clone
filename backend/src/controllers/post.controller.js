import {
    createPost as createPostService,
    getPostById,
    getPostOwner,
    deletePost as deletePostService
} from '../services/post.service.js';

import { saveImage, deleteImage } from '../services/storage.service.js';
import { HttpError } from '../utils/httpError.js';

export const createPost = async (req, res, next) => {
    let mediaUrl;

    try {
        if (!req.file) {
            throw new HttpError(
                400,
                'An image file is required (field name: image)'
            );
        }

        // 1. Upload image to object storage
        mediaUrl = await saveImage(req.file);

        // 2. Save post information in PostgreSQL
        const post = await createPostService({
            userId: req.user.id,
            mediaUrl,
            caption: req.body.caption
        });

        res.status(201).json(post);
    } catch (error) {
        // If database insert fails after image upload,
        // remove the uploaded image so it does not become an orphan.
        if (mediaUrl) {
            await deleteImage(mediaUrl);
        }

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

        const post = await getPostById(postId, req.user.id);

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