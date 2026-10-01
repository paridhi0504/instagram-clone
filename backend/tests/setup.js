import { beforeEach, afterAll } from 'vitest';
import { pool } from '../src/config/db.js';

// Safety net: this suite DELETES DATA. Never let it touch a real database.
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error('Refusing to run tests: DATABASE_URL does not look like a test database');
}

beforeEach(async () => {
  await pool.query(
    'TRUNCATE users, posts, followers, likes, comments RESTART IDENTITY CASCADE'
  );
});

afterAll(async () => {
  await pool.end();
});