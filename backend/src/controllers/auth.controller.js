import { registerUser, loginUser } from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const data = await registerUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = await loginUser(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}