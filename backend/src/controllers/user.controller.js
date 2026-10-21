import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import {
  getProfile as getProfileService,
  getUserPosts as getUserPostsService,
  updateProfile as updateProfileService,
} from '../services/user.service.js';
import { parseId } from '../utils/parseId.js';
import { parsePagination } from '../utils/pagination.js';

export async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, username, email, bio, profile_picture, created_at
       FROM users
       WHERE id = $1`,
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

export async function updateMe(req, res, next) {
  try {
    const { username, bio, profile_picture } = req.body;

    if (
      username === undefined &&
      bio === undefined &&
      profile_picture === undefined
    ) {
      throw new HttpError(400, 'Provide at least one field to update');
    }

    if (
      username !== undefined &&
      (typeof username !== 'string' ||
        username.trim().length < 3 ||
        username.trim().length > 50)
    ) {
      throw new HttpError(
        400,
        'Username must be between 3 and 50 characters'
      );
    }

    if (bio !== undefined && typeof bio !== 'string') {
      throw new HttpError(400, 'Bio must be text');
    }

    if (bio !== undefined && bio.length > 300) {
      throw new HttpError(400, 'Bio cannot exceed 300 characters');
    }

    if (
      profile_picture !== undefined &&
      profile_picture !== null &&
      typeof profile_picture !== 'string'
    ) {
      throw new HttpError(400, 'Profile picture must be a URL or null');
    }

    const user = await updateProfileService({
      userId: req.user.id,
      username: username === undefined ? null : username.trim(),
      bio: bio === undefined ? null : bio,
      profile_picture:
        profile_picture === undefined ? null : profile_picture,
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json(user);
  } catch (err) {
    if (err.code === '23505') {
      return next(new HttpError(409, 'Username is already taken'));
    }

    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const profile = await getProfileService({
      targetId: parseId(req.params.id, 'user id'),
      viewerId: req.user.id,
    });

    if (!profile) {
      throw new HttpError(404, 'User not found');
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getUserPosts(req, res, next) {
  try {
    const targetId = parseId(req.params.id, 'user id');
    const { limit, cursor } = parsePagination(req.query);

    const { items, nextCursor } = await getUserPostsService({
      targetId,
      limit,
      cursor,
    });

    res.json({ posts: items, nextCursor });
  } catch (err) {
    next(err);
  }
}