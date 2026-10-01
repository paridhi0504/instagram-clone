import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';

export async function registerUser(name = 'alice') {
  const res = await request(app)
    .post('/auth/register')
    .send({ username: name, email: `${name}@test.com`, password: 'password123' });
  return { token: res.body.token, user: res.body.user };
}

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// Insert a post straight into the DB so tests don't write real image files
export async function addPost(userId, caption = 'test post') {
  const r = await pool.query(
    `INSERT INTO posts (user_id, media_url, caption)
     VALUES ($1, '/uploads/fake.png', $2) RETURNING id`,
    [userId, caption]
  );
  return r.rows[0].id;
}