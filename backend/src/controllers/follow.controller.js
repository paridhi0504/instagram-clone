import { followUser, unfollowUser } from '../services/follow.service.js';
import { parseId } from '../utils/parseId.js';

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