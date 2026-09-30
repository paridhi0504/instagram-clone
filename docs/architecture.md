Your notes show microservices (User Service, Feed Service, and so on). That is the end goal. For a beginner POC we start with a modular monolith: one backend application, internally split into modules that match those future services. It's much easier to build and debug, and you can split it into microservices later without a rewrite.

[ React Frontend ]  →  HTTP/JSON  →  [ Node.js + Express Backend ]
                                        ├── auth module
                                        ├── users module
                                        ├── posts module
                                        ├── feed module
                                        └── (likes/comments)
                                              │            │
                                       [ PostgreSQL ]   [ uploads/ folder ]
                                       (structured data)  (images, for now)


Suggested stack (beginner friendly, widely used)

Frontend: React (with Vite)
Backend: Node.js + Express
Database: PostgreSQL
Auth: JWT and bcrypt (password hashing)
File uploads: Multer (saves to a local folder now; swap for S3 later)
Tools: Git/GitHub, Postman (API testing)                                       