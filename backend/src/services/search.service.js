import { pool } from '../config/db.js';
import { buildPage } from '../utils/pagination.js';

const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

export async function searchUsers({ q, limit = 20 }) {
    const esc = escapeLike(q);

    const result = await pool.query(
        `SELECT id, username, profile_picture
         FROM users
         WHERE username ILIKE $1
         ORDER BY (username ILIKE $2) DESC, length(username), username
         LIMIT $3`,
        [`%${esc}%`, `${esc}%`, limit]
    );

    return result.rows;
}

export async function postsByHashtag({
    tag,
    viewerId,
    limit,
    cursor
}) {
    const result = await pool.query(
        `SELECT
            p.id,
            p.media_url,
            p.caption,
            p.created_at,
            u.id AS user_id,
            u.username,
            u.profile_picture,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id)::int AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count,
            EXISTS (
                SELECT 1
                FROM likes
                WHERE post_id = p.id
                  AND user_id = $4
            ) AS liked_by_me
         FROM post_hashtags h
         JOIN posts p ON p.id = h.post_id
         JOIN users u ON u.id = p.user_id
         WHERE h.tag = $1
           AND ($2::int IS NULL OR p.id < $2)
         ORDER BY p.id DESC
         LIMIT $3`,
        [tag, cursor, limit + 1, viewerId]
    );

    return buildPage(result.rows, limit);
}