import { likePost, unlikePost } from '../services/like.service.js';
import { parseId } from '../utils/parseId.js';

export async function like(req, res, next) {
  try {
    const data = await likePost({
      postId: parseId(req.params.id, 'post id'),
      userId: req.user.id,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function unlike(req, res, next) {
  try {
    const data = await unlikePost({
      postId: parseId(req.params.id, 'post id'),
      userId: req.user.id,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}