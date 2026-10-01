import { pool } from '../config/db.js';

export const createPost = async ({ userId, mediaUrl, caption }) => {
    const result = await pool.query(
        `INSERT INTO posts (user_id, media_url, caption)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, mediaUrl, caption]
    );

    return result.rows[0];
};

export const getPostById = async (postId, viewerId) => {
    const result = await pool.query(
        `SELECT
            posts.id,
            posts.user_id,
            users.username,
            posts.media_url,
            posts.caption,
            posts.created_at,
            (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS like_count,
            (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comment_count,
            EXISTS (
                SELECT 1
                FROM likes
                WHERE likes.post_id = posts.id
                  AND likes.user_id = $2
            ) AS liked_by_me
         FROM posts
         JOIN users ON posts.user_id = users.id
         WHERE posts.id = $1`,
        [postId, viewerId]
    );

    return result.rows[0];
};

export const getPostOwner = async (postId) => {
    const result = await pool.query(
        `SELECT id, user_id
         FROM posts
         WHERE id = $1`,
        [postId]
    );

    return result.rows[0];
};

export const deletePost = async (postId, userId) => {
    const result = await pool.query(
        `DELETE FROM posts
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [postId, userId]
    );

    return result.rows[0];
};