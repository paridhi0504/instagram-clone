import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { registerUser, authHeader, addPost } from './helpers.js';

describe('follow and feed', () => {
  it('feed contains followed users only, and unfollow removes them', async () => {
    const a = await registerUser('alice');
    const b = await registerUser('bob');
    const c = await registerUser('carol');
    await addPost(b.user.id, 'bob post');
    await addPost(c.user.id, 'carol post');

    await request(app).post(`/follow/${b.user.id}`).set(authHeader(a.token)).expect(200);

    let feed = await request(app).get('/feed').set(authHeader(a.token)).expect(200);
    expect(feed.body.posts.map((p) => p.caption)).toEqual(['bob post']);

    await request(app).delete(`/follow/${b.user.id}`).set(authHeader(a.token)).expect(200);
    feed = await request(app).get('/feed').set(authHeader(a.token)).expect(200);
    expect(feed.body.posts).toHaveLength(0);
  });

  it("can't follow yourself", async () => {
    const a = await registerUser('alice');
    await request(app).post(`/follow/${a.user.id}`).set(authHeader(a.token)).expect(400);
  });

  it('paginates with cursors without overlap', async () => {
    const a = await registerUser('alice');
    for (let i = 1; i <= 3; i++) await addPost(a.user.id, `post ${i}`);

    const page1 = await request(app).get('/feed?limit=2').set(authHeader(a.token));
    expect(page1.body.posts).toHaveLength(2);
    expect(page1.body.nextCursor).not.toBeNull();

    const page2 = await request(app)
      .get(`/feed?limit=2&cursor=${page1.body.nextCursor}`)
      .set(authHeader(a.token));
    expect(page2.body.posts).toHaveLength(1);
    expect(page2.body.nextCursor).toBeNull();
  });
});

describe('likes and comments', () => {
  it('liking twice counts once (idempotent)', async () => {
    const a = await registerUser('alice');
    const postId = await addPost(a.user.id);

    await request(app).post(`/posts/${postId}/like`).set(authHeader(a.token));
    const res = await request(app).post(`/posts/${postId}/like`).set(authHeader(a.token));
    expect(res.body.like_count).toBe(1);

    const un = await request(app).delete(`/posts/${postId}/like`).set(authHeader(a.token));
    expect(un.body.like_count).toBe(0);
  });

  it('only the comment author or post owner can delete a comment', async () => {
    const owner = await registerUser('alice');
    const author = await registerUser('bob');
    const stranger = await registerUser('carol');
    const postId = await addPost(owner.user.id);

    const created = await request(app)
      .post(`/posts/${postId}/comments`)
      .set(authHeader(author.token))
      .send({ text: 'nice!' })
      .expect(201);
    const commentId = created.body.id;

    await request(app).delete(`/comments/${commentId}`).set(authHeader(stranger.token)).expect(403);
    await request(app).delete(`/comments/${commentId}`).set(authHeader(owner.token)).expect(204);
  });

  it('rejects empty comments', async () => {
    const a = await registerUser('alice');
    const postId = await addPost(a.user.id);
    await request(app)
      .post(`/posts/${postId}/comments`)
      .set(authHeader(a.token))
      .send({ text: '   ' })
      .expect(400);
  });
});

describe('posts', () => {
  it('only the owner can delete a post', async () => {
    const a = await registerUser('alice');
    const b = await registerUser('bob');
    const postId = await addPost(a.user.id);

    await request(app).delete(`/posts/${postId}`).set(authHeader(b.token)).expect(403);
    await request(app).delete(`/posts/${postId}`).set(authHeader(a.token)).expect(204);
  });

  it('rejects non-image uploads', async () => {
    const a = await registerUser('alice');
    const res = await request(app)
      .post('/posts')
      .set(authHeader(a.token))
      .attach('image', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
  });
});