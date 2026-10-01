import fs from 'fs/promises';
import { HttpError } from '../utils/httpError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    // don't leave an orphan upload behind if validation fails
    if (req.file) fs.unlink(req.file.path).catch(() => {});

    const issue = result.error.issues[0];
    const field = issue.path.join('.');
    return next(new HttpError(400, field ? `${field}: ${issue.message}` : issue.message));
  }

  req.body = result.data; // cleaned values replace the raw ones
  next();
};