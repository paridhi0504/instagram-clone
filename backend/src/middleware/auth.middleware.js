import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization; // "Bearer eyJhbGci..."

  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing or malformed token'));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next(); // token is good, continue to the route
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}