import { pool } from '../config/db.js';
import { buildPage } from '../utils/pagination.js';

export async function getFeed({ userId, limit, cursor }) {
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
    AND user_id = $1
) AS liked_by_me
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE (
         p.user_id IN (
           SELECT following_id
           FROM followers
           WHERE follower_id = $1
         )
         OR p.user_id = $1
       )
       AND ($2::int IS NULL OR p.id < $2)
     ORDER BY p.id DESC
     LIMIT $3`,
    [userId, cursor, limit + 1]
  );

  return buildPage(result.rows, limit);
}