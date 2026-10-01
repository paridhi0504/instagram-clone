import { getFeed } from '../services/feed.service.js';
import { parsePagination } from '../utils/pagination.js';

export async function feed(req, res, next) {
  try {
    const { limit, cursor } = parsePagination(req.query);
    const { items, nextCursor } = await getFeed({
      userId: req.user.id,
      limit,
      cursor,
    });
    res.json({ posts: items, nextCursor });
  } catch (err) {
    next(err);
  }
}