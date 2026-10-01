import { HttpError } from './httpError.js';

export function parsePagination(query) {
  let limit = query.limit === undefined ? 10 : Number(query.limit);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new HttpError(400, 'Invalid limit');
  }
  limit = Math.min(limit, 50); // never allow huge pages

  let cursor = null;
  if (query.cursor !== undefined) {
    cursor = Number(query.cursor);
    if (!Number.isInteger(cursor) || cursor < 1) {
      throw new HttpError(400, 'Invalid cursor');
    }
  }
  return { limit, cursor };
}

// rows were fetched with LIMIT (limit + 1)
export function buildPage(rows, limit) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  return { items, nextCursor };
}