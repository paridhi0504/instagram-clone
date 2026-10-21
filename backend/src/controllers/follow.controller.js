import { followUser, unfollowUser } from '../services/follow.service.js';
import { parseId } from '../utils/parseId.js';
import { getFollowers, getFollowing } from '../services/follow.service.js';
import { parsePagination } from '../utils/pagination.js';

export async function follow(req, res, next) {
  try {
    await followUser({
      followerId: req.user.id,
      targetId: parseId(req.params.id, 'user id'),
    });
    res.json({ following: true });
  } catch (err) {
    next(err);
  }
}

export async function unfollow(req, res, next) {
  try {
    await unfollowUser({
      followerId: req.user.id,
      targetId: parseId(req.params.id, 'user id'),
    });
    res.json({ following: false });
  } catch (err) {
    next(err);
  }
}

export async function followers(req, res, next) {
  try {
    const userId = parseId(req.params.id, 'user id');
    const { limit, cursor } = parsePagination(req.query);

    const result = await getFollowers({ userId, limit, cursor });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function following(req, res, next) {
  try {
    const userId = parseId(req.params.id, 'user id');
    const { limit, cursor } = parsePagination(req.query);

    const result = await getFollowing({ userId, limit, cursor });
    res.json(result);
  } catch (err) {
    next(err);
  }
}