import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { getProfile as getProfileService, getUserPosts as getUserPostsService } from '../services/user.service.js';
import { parseId } from '../utils/parseId.js';
import { parsePagination } from '../utils/pagination.js';

export async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, username, email, profile_picture, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, 'User not found');
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const profile = await getProfileService({
      targetId: parseId(req.params.id, 'user id'),
      viewerId: req.user.id,
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getUserPosts(req, res, next) {
  try {
    const targetId = parseId(req.params.id, 'user id');
    const { limit, cursor } = parsePagination(req.query);
    const { items, nextCursor } = await getUserPostsService({ targetId, limit, cursor });
    res.json({ posts: items, nextCursor });
  } catch (err) {
    next(err);
  }
}