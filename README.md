InstaClone

InstaClone is a full-stack social media application inspired by Instagram. It allows users to create accounts, upload photo posts, follow other users, like posts, and interact through comments.

This project was built to practice full-stack web development and understand how a real-world application connects a React frontend with an Express backend and PostgreSQL database. It also explores containerization, load balancing, caching, object storage, API security, and automated testing.

What Can You Do with InstaClone?

After creating an account, a user can:

* Register and log in securely
* Create a profile with a bio and profile picture
* Upload photo posts with captions
* Follow and unfollow other users
* View a personalized home feed
* Like and unlike posts
* Add and delete comments
* View other users’ profiles and posts
* Delete their own posts
* Load posts and comments page-by-page using cursor pagination

The application checks permissions so users cannot perform actions that belong to other users.

Architecture

The application uses a React frontend, a Node.js and Express backend, and a PostgreSQL database. Its Docker-based infrastructure also includes Redis, MinIO, and Nginx.

                    React Frontend
                          |
                       REST API
                          |
                         Nginx
                    Load Balancer
                          |
             +------------+------------+
             |            |            |
          Backend 1    Backend 2    Backend 3
             |            |            |
             +------------+------------+
                          |
             +------------+------------+
             |            |            |
         PostgreSQL     Redis         MinIO
          Database      Cache      Object Storage

* React frontend: Provides the user interface.
* Express backend: Handles authentication, validation, authorization, uploads, posts, follows, likes, comments, and feed logic.
* PostgreSQL: Stores application data.
* Redis: Provides the caching infrastructure.
* MinIO: Provides S3-compatible object storage for media.
* Nginx: Distributes incoming API requests across three backend instances.
* Docker Compose: Runs and connects the application services.

The backend is organized into routes, controllers, services, middleware, validation, and database configuration so each component has a clear responsibility.

Tech Stack

Frontend: React, Vite, React Router, JavaScript, CSS

Backend: Node.js, Express.js, JWT, bcrypt, Multer, Zod, Helmet, express-rate-limit

Database: PostgreSQL

Infrastructure: Docker, Docker Compose, Nginx, Redis, MinIO

Testing: Vitest, Supertest

Getting Started

You can run InstaClone locally using either Docker Compose or the manual development setup.

Option 1: Run with Docker Compose

Requirements

* Docker Desktop or Docker Engine with the Docker Compose plugin
* Git

1. Clone the project

git clone https://github.com/paridhi0504/instagram-clone.git
cd instagram-clone

2. Configure environment variables

Review backend/.env and ensure the required application settings are present.

Docker Compose supplies the internal database, Redis, object-storage, and proxy configuration to the backend containers. Keep local development credentials out of public deployments, and never commit real secrets.

3. Build and start the services

docker compose config --quiet
docker compose build
docker compose up -d

Docker Compose starts PostgreSQL, Redis, MinIO, three backend instances, and Nginx.

4. Check container status

docker compose ps

Make sure the services are running. PostgreSQL should report a healthy status.

5. Test the API

curl -i http://localhost:4000/health

A successful response returns HTTP 200 and JSON containing the status, backend instance identifier, and database timestamp.

6. Verify load balancing

for i in {1..10}; do
  curl -s http://localhost:4000/health | grep -o '"instance":"[^"]*"' 
done

The output should show requests reaching multiple backend instances.

7. View logs

docker compose logs --tail=50 backend-1 backend-2 backend-3

To stop the services:

docker compose down

To stop the services and remove their named data volumes, use the following command only when you intentionally want to delete the stored Docker database and object-storage data:

docker compose down -v

Important: The included Compose configuration is for local development. Before exposing the application publicly, replace default credentials, protect secrets, restrict database/cache/storage ports, configure production CORS and frontend URLs, and use HTTPS.

Option 2: Run Manually for Development

Requirements

* Node.js 22 or a compatible supported version
* npm
* PostgreSQL

1. Clone the project

git clone https://github.com/paridhi0504/instagram-clone.git
cd instagram-clone

2. Set up the backend

cd backend
npm install

Create a .env file inside the backend folder with the required settings:

PORT=4000
DATABASE_URL=postgresql://localhost:5432/instagram_clone
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173

Use a strong, private JWT secret. Add any other variables required by your local configuration.

Create the PostgreSQL database:

createdb instagram_clone

Run the database schema:

psql instagram_clone -f src/db/schema.sql

Start the backend:

npm run dev

The backend runs on http://localhost:4000.

3. Set up the frontend

Open another terminal from the project root:

cd frontend
npm install
npm run dev

The frontend runs on http://localhost:5173.

API

The backend provides REST endpoints for authentication, users, posts, follows, likes, comments, and the home feed.

Method	Endpoint	Purpose
POST	/auth/register	Register an account
POST	/auth/login	Log in
GET	/users/me	Get the current user’s profile
GET	/users/:id	Get a user’s profile
GET	/users/:id/posts	Get a user’s posts
POST	/posts	Create a post
GET	/posts/:id	Get a post
DELETE	/posts/:id	Delete a post
POST	/posts/:id/like	Like a post
DELETE	/posts/:id/like	Unlike a post
GET	/posts/:id/comments	Get comments
POST	/posts/:id/comments	Add a comment
DELETE	/comments/:id	Delete a comment
POST	/follow/:id	Follow a user
DELETE	/follow/:id	Unfollow a user
GET	/feed	Get the personalized feed

For complete request and response details, see the API documentation in docs/api-design.md.

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

The returned cursor can be used to request the next page.

Pagination is supported by:

* GET /feed
* GET /posts/:id/comments
* GET /users/:id/posts

Security

Security was considered throughout the application.

* Password protection: Passwords are stored using bcrypt hashes.
* Authentication: Signed JWTs identify authenticated users.
* Authorization: Users cannot modify resources they are not permitted to access.
* SQL injection protection: Database queries use parameterized SQL.
* Input validation: Zod validates incoming data.
* Upload validation: Image uploads are restricted by file type, content signature, and size.
* Rate limiting: Authentication endpoints are protected against excessive requests.
* CORS: Browser requests are restricted to the configured frontend origin.
* HTTP security headers: Helmet adds security-related response headers.
* Request limits: JSON request bodies have a size limit.
* Error handling: Unknown routes and application errors are handled centrally.

These controls improve application security, but they do not replace a production security review.

Testing

The backend uses Vitest and Supertest for automated API testing.

A separate PostgreSQL test database is used so automated tests do not modify the development database.

Run the tests from the backend directory:

cd backend
npm test

The test suite covers authentication, protected routes, registration validation, login failures, social features, authorization, and API error handling.

Security-related behavior was also manually verified during development, including:

* Invalid input returning 400 Bad Request
* Repeated login attempts eventually returning 429 Too Many Requests
* Expired JWTs being rejected
* Unauthorized actions returning 403 Forbidden
* Unknown API routes returning a JSON 404
* Security headers being added by Helmet
* The frontend continuing to work after restricting CORS

Project Structure

instagram-clone/
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
│   │   └── server.js
│   └── tests/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
├── docs/
│   ├── api-design.md
│   └── architecture.md
├── nginx/
│   └── nginx.conf
├── postman/
├── docker-compose.yml
└── README.md

What I Learned

Building InstaClone provided practical experience with full-stack application development, REST APIs, React, Express, PostgreSQL, JWT authentication, password hashing, authorization, file uploads, database relationships, cursor pagination, input validation, security, and automated testing.

The project also helped me understand how frontend components, backend business logic, APIs, databases, containerization, caching, object storage, and load balancing work together.

Future Improvements

* Production deployment with HTTPS
* Cloud-based media storage
* Improved caching strategies
* Search enhancements
* Notifications
* Direct messaging
* Image optimization
* More extensive frontend testing
* Continuous integration and deployment

Author

Paridhi Gupta