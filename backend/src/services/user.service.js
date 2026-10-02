import { pool } from '../config/db.js';

export async function getProfile({ viewerId, targetId }) {
  const result = await pool.query(
    `SELECT
        u.id,
        u.username,
        u.bio,
        u.profile_picture,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id)::int AS post_count,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.id)::int AS follower_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.id)::int AS following_count,
        EXISTS (
          SELECT 1
          FROM followers
          WHERE follower_id = $1
            AND following_id = u.id
        ) AS is_following
     FROM users u
     WHERE u.id = $2`,
    [viewerId, targetId]
  );

  return result.rows[0] || null;
}

export async function getUserPosts({ targetId, limit, cursor }) {
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
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1
       AND ($2::int IS NULL OR p.id < $2)
     ORDER BY p.id DESC
     LIMIT $3`,
    [targetId, cursor, limit + 1]
  );

  const hasMore = result.rows.length > limit;
  const items = hasMore ? result.rows.slice(0, limit) : result.rows;

  const nextCursor = hasMore
    ? items[items.length - 1].id
    : null;

  return {
    items,
    nextCursor
  };
}