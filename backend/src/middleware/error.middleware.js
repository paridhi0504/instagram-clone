export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;

  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'Image must be 5 MB or smaller';
  }

  if (status === 500) {
    console.error(err);
    message = 'Internal server error';
  }

  res.status(status).json({ error: message });
}