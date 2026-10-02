import { z } from 'zod';
import {
    searchUsers,
    postsByHashtag
} from '../services/search.service.js';
import { parsePagination } from '../utils/pagination.js';
import { HttpError } from '../utils/httpError.js';

const querySchema = z.string()
    .trim()
    .min(2, 'must be at least 2 characters')
    .max(50, 'must be 50 characters or fewer');

const tagSchema = z.string()
    .trim()
    .toLowerCase()
    .regex(
        /^[\p{L}\p{N}_]{1,50}$/u,
        'is not a valid hashtag'
    );

function parse(schema, value, label) {
    const r = schema.safeParse(value);

    if (!r.success) {
        throw new HttpError(
            400,
            `${label}: ${r.error.issues[0].message}`
        );
    }

    return r.data;
}

export async function users(req, res, next) {
    try {
        const q = parse(querySchema, req.query.q, 'q');

        res.json({
            users: await searchUsers({ q })
        });
    } catch (err) {
        next(err);
    }
}

export async function hashtag(req, res, next) {
    try {
        const tag = parse(tagSchema, req.params.tag, 'tag');

        const { limit, cursor } = parsePagination(req.query);

        const { items, nextCursor } = await postsByHashtag({
            tag,
            viewerId: req.user.id,
            limit,
            cursor
        });

        res.json({
            posts: items,
            nextCursor
        });
    } catch (err) {
        next(err);
    }
}