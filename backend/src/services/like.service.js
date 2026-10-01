import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

async function assertPostExists(postId) {
  const r = await pool.query('SELECT 1 FROM posts WHERE id = $1', [postId]);
  if (r.rowCount === 0) throw new HttpError(404, 'Post not found');
}

async function countLikes(postId) {
  const r = await pool.query(
    'SELECT COUNT(*)::int AS count FROM likes WHERE post_id = $1',
    [postId]
  );
  return r.rows[0].count;
}

export async function likePost({ postId, userId }) {
  await assertPostExists(postId);
  await pool.query(
    `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, postId]
  );
  return { liked: true, like_count: await countLikes(postId) };
}

export async function unlikePost({ postId, userId }) {
  await assertPostExists(postId);
  await pool.query(
    'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
    [userId, postId]
  );
  return { liked: false, like_count: await countLikes(postId) };
}