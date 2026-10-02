### Instagram Clone API Documentation

1. Base URL

http://localhost:4000

Protected APIs require:

Authorization: Bearer <JWT_TOKEN>

2. Authentication

Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Login and receive JWT token

3. User & Follow APIs

Method	Endpoint	Description
GET	/users/me	Get logged-in user
GET	/users/:id	Get user profile
GET	/users/:id/posts	Get user’s posts
POST	/follow/:id	Follow a user
DELETE	/follow/:id	Unfollow a user

4. Post APIs

Method	Endpoint	Description
POST	/posts	Create a post with image
GET	/posts/:id	Get a post
DELETE	/posts/:id	Delete own post
POST	/posts/:id/like	Like a post
DELETE	/posts/:id/like	Unlike a post

5. Comment APIs

Method	Endpoint	Description
POST	/posts/:id/comments	Add a comment
GET	/posts/:id/comments	Get post comments
DELETE	/comments/:id	Delete own comment

6. Feed API

GET /feed

Returns posts from the logged-in user and followed users.

Cursor pagination is supported:

GET /feed?cursor=14

7. Health Check

GET /health

Checks whether the backend and database are running.

8. Security & Performance

The API uses JWT authentication, bcrypt password hashing, Zod validation, Helmet, CORS, Redis-based rate limiting, and Redis caching.

Authentication requests are limited to 20 requests per 15 minutes, while general API requests are limited to 300 requests per minute.

9. Technology Stack

Node.js, Express.js, PostgreSQL, Redis, JWT, bcrypt, Zod, Multer, Docker, Vitest and Supertest.