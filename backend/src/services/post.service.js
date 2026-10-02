import { pool } from '../config/db.js';
import { invalidateFeed } from '../utils/cache.js';
import { deleteImage } from './storage.service.js';
import { extractHashtags } from '../utils/hashtags.js';

export async function createPost({ userId, mediaUrl, caption }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO posts (user_id, media_url, caption)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, media_url, caption, created_at`,
            [userId, mediaUrl, caption || null]
        );

        const post = result.rows[0];

        const tags = extractHashtags(caption);

        if (tags.length) {
            await client.query(
                `INSERT INTO post_hashtags (post_id, tag)
                 SELECT $1, UNNEST($2::text[])
                 ON CONFLICT DO NOTHING`,
                [post.id, tags]
            );
        }

        await client.query('COMMIT');

        await invalidateFeed(userId);

        return post;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

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
        `SELECT *
         FROM posts
         WHERE id = $1 AND user_id = $2`,
        [postId, userId]
    );

    const post = result.rows[0];

    if (!post) {
        return undefined;
    }

    await pool.query(
        `DELETE FROM posts
         WHERE id = $1 AND user_id = $2`,
        [postId, userId]
    );

    await invalidateFeed(userId);

    await deleteImage(post.media_url);

    return post;
};