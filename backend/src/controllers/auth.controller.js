import { registerUser, loginUser } from '../services/auth.service.js';
import { HttpError } from '../utils/httpError.js';

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new HttpError(400, 'username, email and password are required');
    }
    if (password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }

    const data = await registerUser({ username, email, password });
    res.status(201).json(data);
  } catch (err) {
    next(err); // hand the error to the error middleware
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, 'email and password are required');
    }

    const data = await loginUser({ email, password });
    res.json(data);
  } catch (err) {
    next(err);
  }
}