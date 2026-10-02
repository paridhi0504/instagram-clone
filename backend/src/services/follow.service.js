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