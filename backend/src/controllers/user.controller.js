import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

export async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, username, email, profile_pic_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) throw new HttpError(404, 'User not found');
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}