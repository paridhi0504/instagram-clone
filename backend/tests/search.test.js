import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';
import { createPost } from '../src/services/post.service.js';
import { extractHashtags } from '../src/utils/hashtags.js';
import { registerUser, authHeader } from './helpers.js';

describe('hashtag extraction', () => {
    it('lowercases, dedupes and ignores plain text', () => {
        expect(
            extractHashtags(
                'Hi #Travel and #travel #Sun_set # nope'
            )
        ).toEqual(['travel', 'sun_set']);

        expect(extractHashtags(null)).toEqual([]);
    });
});

describe('search', () => {
    it('finds users by partial name, prefix matches first', async () => {
        const a = await registerUser('natalie');
        await registerUser('alice');
        await registerUser('bob');

        const res = await request(app)
            .get('/search/users?q=ali')
            .set(authHeader(a.token))
            .expect(200);

        expect(
            res.body.users.map((u) => u.username)
        ).toEqual(['alice', 'natalie']);
    });

    it('treats % as a literal character, not a wildcard', async () => {
        const a = await registerUser('alice');

        const res = await request(app)
            .get('/search/users?q=%25%25')
            .set(authHeader(a.token))
            .expect(200);

        expect(res.body.users).toHaveLength(0);
    });

    it('rejects too-short queries', async () => {
        const a = await registerUser('alice');

        await request(app)
            .get('/search/users?q=a')
            .set(authHeader(a.token))
            .expect(400);
    });

    it('saves hashtags with the post and finds posts by tag', async () => {
        const a = await registerUser('alice');

        await createPost({
            userId: a.user.id,
            mediaUrl: '/uploads/x.png',
            caption: 'Beach day #Travel #travel #sunset'
        });

        await createPost({
            userId: a.user.id,
            mediaUrl: '/uploads/y.png',
            caption: 'no tags here'
        });

        const res = await request(app)
            .get('/search/hashtags/travel')
            .set(authHeader(a.token))
            .expect(200);

        expect(res.body.posts).toHaveLength(1);

        const rows = await pool.query(
            'SELECT tag FROM post_hashtags ORDER BY tag'
        );

        expect(
            rows.rows.map((r) => r.tag)
        ).toEqual(['sunset', 'travel']);
    });
});