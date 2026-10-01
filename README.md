You’re right. The previous version reads more like technical documentation dumped into a README than a README someone would enjoy reading.

A good README should let a first-time visitor understand:

What is this? → What can it do? → How does it work? → How do I run it? → How is it secured/tested?

Here is a cleaner version with fewer, meaningful sections. Copy the entire block below into README.md.

# InstaClone
InstaClone is a full-stack social media application inspired by Instagram. It allows users to create accounts, upload photo posts, follow other users, like posts, and interact through comments.
This project was built to practice full-stack web development and understand how a real-world application connects a React frontend with an Express backend and PostgreSQL database.

## What can you do with InstaClone?
After creating an account, a user can:
- Register and log in securely
- Create a profile with a bio and profile picture
- Upload photo posts with captions
- Follow and unfollow other users
- View a personalized home feed
- Like and unlike posts
- Add and delete comments
- View other users' profiles and posts
- Delete their own posts
- Load posts and comments page-by-page using cursor pagination
The application also checks permissions, so users cannot perform actions that belong to other users.
## How it works
The project is divided into three main parts:
```text
React Frontend
      │
      │ REST API
      ▼
Node.js + Express Backend
      │
      │ SQL
      ▼
PostgreSQL Database

The React frontend provides the user interface.

The Express backend handles authentication, validation, authorization, image uploads, posts, follows, likes, comments, and feed logic.

The PostgreSQL database stores users, posts, followers, likes, and comments.

The backend is organized into routes, controllers, services, middleware, validation, and database configuration so that each part of the application has a clear responsibility.

Tech Stack

Frontend: React, Vite, React Router, JavaScript, CSS

Backend: Node.js, Express.js, JWT, bcrypt, Multer, Zod, Helmet, express-rate-limit

Database: PostgreSQL

Testing: Vitest and Supertest

Getting Started

Requirements

Make sure you have installed:

* Node.js
* npm
* PostgreSQL

1. Clone the project

git clone https://github.com/paridhi0504/instagram-clone.git
cd instagram-clone

2. Set up the backend

cd backend
npm install

Create a .env file inside the backend folder:

PORT=4000
DATABASE_URL=postgresql://localhost:5432/instagram_clone
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h

Create the PostgreSQL database:

createdb instagram_clone

Run the database schema:

psql instagram_clone -f src/db/schema.sql

Start the backend:

npm run dev

The backend will run on:

http://localhost:4000

3. Set up the frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend will run on:

http://localhost:5173

API

The backend provides REST endpoints for authentication, users, posts, follows, likes, comments, and the home feed.

The main endpoints are:

POST   /auth/register
POST   /auth/login
GET    /users/me
GET    /users/:id
GET    /users/:id/posts
POST   /posts
GET    /posts/:id
DELETE /posts/:id
POST   /posts/:id/like
DELETE /posts/:id/like
GET    /posts/:id/comments
POST   /posts/:id/comments
DELETE /comments/:id
POST   /follow/:id
DELETE /follow/:id
GET    /feed

Pagination

The feed, comments, and user-post endpoints use cursor-based pagination.

The request format is:

?limit=<number>&cursor=<cursor>

For example:

GET /feed?limit=10&cursor=14

The API returns a nextCursor when more data is available:

{
  "posts": [],
  "nextCursor": 5
}

The returned cursor can then be used to request the next page.

The same pagination approach is used for:

GET /feed?limit=10&cursor=<cursor>
GET /posts/:id/comments?limit=10&cursor=<cursor>
GET /users/:id/posts?limit=10&cursor=<cursor>

For complete request and response details, see API Documentation⁠￼.

Security

Security was considered throughout the application rather than treating it as an afterthought.

Passwords are stored using bcrypt hashes, and database queries use parameterized SQL to reduce the risk of SQL injection.

Authentication uses signed JWTs. The authenticated user’s identity is taken from the verified token instead of trusting a user ID supplied by the request body.

Authorization checks prevent users from modifying other users’ data. For example, users can delete their own posts and comments, while post owners can delete comments belonging to their posts. Unauthorized actions return 403 Forbidden.

Uploaded files are protected with type, size, and filename controls. User-generated captions and comments are rendered through React, which escapes normal text content and helps prevent XSS through those fields.

The API uses a CORS allow-list instead of allowing arbitrary browser origins. Input is validated with Zod, and request body limits help reject oversized or malformed input.

Authentication endpoints are protected with rate limiting to reduce password-guessing and brute-force attempts.

Helmet is also enabled to provide security-related HTTP headers.

Testing

The backend uses Vitest and Supertest for automated API testing.

A separate PostgreSQL test database is used so that automated tests do not modify the development database.

Run the tests with:

cd backend
npm test

The test suite covers authentication, protected routes, registration validation, login failures, social features, authorization, and API error handling.

Security-related behavior was also manually verified during development, including:

* Invalid input returning 400 Bad Request
* Repeated login attempts eventually returning 429 Too Many Requests
* Expired JWTs being rejected and the frontend redirecting to /login
* Unauthorized actions returning 403 Forbidden
* Unknown API routes returning a JSON 404
* Security headers being added by Helmet
* The frontend continuing to work after restricting CORS

Project Structure

instagram-clone/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validation/
│   │   ├── uploads/
│   │   └── server.js
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
│
├── docs/
│   ├── api-design.md
│   └── architecture.md
│
└── README.md

What I Learned

Building InstaClone gave me practical experience with full-stack application development, REST APIs, React, Express, PostgreSQL, JWT authentication, password hashing, authorization, file uploads, database relationships, cursor pagination, API validation, security, and automated testing.

The project also helped me understand how frontend components, backend business logic, APIs, and database operations work together to form a complete application.

Future Improvements

Some possible future improvements are:

* Cloud storage for uploaded images
* Redis caching
* Search
* Notifications
* Direct messaging
* Production deployment
* Image optimization
* More extensive frontend testing

Author

Paridhi Gupta

