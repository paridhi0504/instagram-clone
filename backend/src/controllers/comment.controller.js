import {
  addComment,
  listComments,
  deleteComment as deleteCommentService,
} from '../services/comment.service.js';
import { parseId } from '../utils/parseId.js';
import { parsePagination } from '../utils/pagination.js';
import { HttpError } from '../utils/httpError.js';

export async function create(req, res, next) {
  try {
    const text = req.body.text;

    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new HttpError(400, 'Comment text is required');
    }

    if (text.length > 500) {
      throw new HttpError(400, 'Comment cannot exceed 500 characters');
    }

    const comment = await addComment({
      postId: parseId(req.params.id, 'post id'),
      userId: req.user.id,
      text: text.trim(),
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { limit, cursor } = parsePagination(req.query);

    const { items, nextCursor } = await listComments({
      postId: parseId(req.params.id, 'post id'),
      limit,
      cursor,
    });

    res.json({
      comments: items,
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteCommentService({
      commentId: parseId(req.params.id, 'comment id'),
      userId: req.user.id,
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}