import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { registerUser, authHeader } from './helpers.js';

describe('auth', () => {
  it('registers a user and returns a token without the password hash', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'Alice', email: 'Alice@Test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe('alice');          // lowercased
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('rejects a duplicate email with 409', async () => {
    await registerUser('alice');
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'other', email: 'alice@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'bob', email: 'bob@test.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    await registerUser('alice');
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects a wrong password with 401', async () => {
    await registerUser('alice');
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('protects /users/me', async () => {
    expect((await request(app).get('/users/me')).status).toBe(401);

    const { token } = await registerUser('alice');
    const res = await request(app).get('/users/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('alice');
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });
});