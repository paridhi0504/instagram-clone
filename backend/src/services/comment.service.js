import { pool } from '../config/db.js';

export async function addComment({ userId, postId, text }) {
    const result = await pool.query(
        `INSERT INTO comments (user_id, post_id, comment_text)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, post_id, comment_text, created_at`,
        [userId, postId, text]
    );

    const comment = result.rows[0];

    const userResult = await pool.query(
        `SELECT username
         FROM users
         WHERE id = $1`,
        [comment.user_id]
    );

    return {
        ...comment,
        username: userResult.rows[0].username
    };
}

export async function listComments({ postId, limit, cursor }) {
    const result = await pool.query(
        `SELECT
            c.id,
            c.user_id,
            u.username,
            c.post_id,
            c.comment_text,
            c.created_at
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.post_id = $1
           AND ($2::int IS NULL OR c.id < $2)
         ORDER BY c.id DESC
         LIMIT $3`,
        [postId, cursor, limit + 1]
    );

    const hasMore = result.rows.length > limit;

    const items = hasMore
        ? result.rows.slice(0, limit)
        : result.rows;

    const nextCursor = hasMore
        ? items[items.length - 1].id
        : null;

    return {
        items,
        nextCursor
    };
}

export async function getCommentOwner(commentId) {
    const result = await pool.query(
        `SELECT id, user_id
         FROM comments
         WHERE id = $1`,
        [commentId]
    );

    return result.rows[0];
}

export async function deleteComment({ commentId, userId }) {
    const comment = await pool.query(
        `SELECT user_id
         FROM comments
         WHERE id = $1`,
        [commentId]
    );

    if (comment.rowCount === 0) {
        const error = new Error('Comment not found');
        error.status = 404;
        throw error;
    }

    if (comment.rows[0].user_id !== userId) {
        const error = new Error('You are not allowed to delete this comment');
        error.status = 403;
        throw error;
    }

    await pool.query(
        `DELETE FROM comments
         WHERE id = $1`,
        [commentId]
    );
}