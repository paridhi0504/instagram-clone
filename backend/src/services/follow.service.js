import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { invalidateFeed } from '../utils/cache.js';

export async function followUser({ followerId, targetId }) {
  if (followerId === targetId) {
    throw new HttpError(400, "You can't follow yourself");
  }

  const target = await pool.query(
    'SELECT 1 FROM users WHERE id = $1',
    [targetId]
  );

  if (target.rowCount === 0) {
    throw new HttpError(404, 'User not found');
  }

  await pool.query(
    `INSERT INTO followers (follower_id, following_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [followerId, targetId]
  );

  await invalidateFeed(followerId);
}

export async function unfollowUser({ followerId, targetId }) {
  await pool.query(
    `DELETE FROM followers
     WHERE follower_id = $1 AND following_id = $2`,
    [followerId, targetId]
  );

  await invalidateFeed(followerId);
}

export async function getFollowers({ userId, limit = 20, cursor = null }) {
  const result = await pool.query(
    `SELECT
        u.id,
        u.username,
        u.profile_picture
     FROM followers f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = $1
       AND ($2::int IS NULL OR u.id > $2)
     ORDER BY u.id ASC
     LIMIT $3`,
    [userId, cursor, limit + 1]
  );

  const hasMore = result.rows.length > limit;
  const users = hasMore ? result.rows.slice(0, limit) : result.rows;

  return {
    users,
    nextCursor: hasMore ? users[users.length - 1].id : null,
  };
}

export async function getFollowing({ userId, limit = 20, cursor = null }) {
  const result = await pool.query(
    `SELECT
        u.id,
        u.username,
        u.profile_picture
     FROM followers f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = $1
       AND ($2::int IS NULL OR u.id > $2)
     ORDER BY u.id ASC
     LIMIT $3`,
    [userId, cursor, limit + 1]
  );

  const hasMore = result.rows.length > limit;
  const users = hasMore ? result.rows.slice(0, limit) : result.rows;

  return {
    users,
    nextCursor: hasMore ? users[users.length - 1].id : null,
  };
}