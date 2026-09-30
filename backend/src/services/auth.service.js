import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const SALT_ROUNDS = 10;

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username }, // payload
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function registerUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );
    const user = result.rows[0];
    return { user, token: createToken(user) };
  } catch (err) {
    if (err.code === '23505') {
      // Postgres "unique violation": username or email already exists
      throw new HttpError(409, 'Username or email already in use');
    }
    throw err;
  }
}

export async function loginUser({ email, password }) {
  const result = await pool.query(
    'SELECT id, username, email, password_hash FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];

  // Same message whether the email or the password is wrong
  const invalid = new HttpError(401, 'Invalid email or password');
  if (!user) throw invalid;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw invalid;

  return {
    user: { id: user.id, username: user.username, email: user.email },
    token: createToken(user),
  };
}