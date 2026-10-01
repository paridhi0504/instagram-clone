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




### Phase 2: Authentication

Good work. Phase 2 is the first time your project handles something security-sensitive, so I'll explain the concepts before the code.

Goal: users can register and log in, and some routes only work for logged-in users.

Part A: The concepts
1. Never store passwords as plain text

If your database leaks, every user's password leaks with it. So we store a hash, a one-way scrambled version of the password.

Hashing is one-way. You can't get the password back from the hash.
Encryption is two-way, so it's not what we want for passwords.
Salt: bcrypt adds random data before hashing, so two users with the same password get different hashes.
Login works by hashing the password the user typed and comparing it with the stored hash. We never decrypt anything.
2. How does the server remember you're logged in?

HTTP is stateless: each request is independent, and the server forgets you after replying. So after login the server gives you a JWT (JSON Web Token), a signed ID card. You send it with every later request.

A JWT has three parts: header.payload.signature

Payload: data such as { id: 5, username: "abhi" }. It is readable by anyone, so never put passwords in it.
Signature: created using a secret only your server knows. If someone edits the payload, the signature no longer matches and the server rejects the token.
Register → Login → server returns JWT → client stores it
Every later request: header "Authorization: Bearer <token>"
Server: verify signature → know who you are → run the route
3. Middleware

A function that runs between the request and your route handler. Our auth middleware checks the token. If it's valid, the request continues. If not, it stops the request with a 401.

4. Status codes you'll use
Code	Meaning
201	Created (registration succeeded)
400	Bad request (missing or invalid input)
401	Unauthorized (not logged in, or wrong credentials)
409	Conflict (username or email already taken)
500	Server error (our bug)




### Phase 3: Posts and Image Upload

Goal: a logged-in user can upload a photo with a caption, view a post, and delete their own post.

Part A: The concepts
1. JSON can't carry files

Until now every request body was JSON. Files are binary data, so browsers send them as multipart/form-data, which can hold text fields and files together. Express can't read this format on its own, so we use Multer.

2. Don't store images in the database

Store the image file on disk (later S3) and store only its path or URL in the database. Databases are good at structured rows, not big blobs, so the posts table holds media_url = "/uploads/abc123.jpg". This is exactly the split in your notes: "Media Storage (S3/GCS)" is separate from "User DB".

3. Serving files

Saving a file doesn't make it visible to the browser. We tell Express to serve the uploads/ folder as static files, so http://localhost:4000/uploads/abc123.jpg shows the image.

4. Upload safety rules

Never trust uploaded files:

Limit the size (5 MB here), or someone can fill your disk.
Allow only image types, not scripts or executables.
Generate your own filename. Using the user's filename can cause collisions (two files called photo.jpg) or path tricks like ../../hack.
5. Authorization, not just authentication

In Phase 2 you learned authentication (who are you?). Now you need authorization (are you allowed to do this?). Anyone logged in can view a post, but only the owner can delete it. The check is post.user_id === req.user.id.

6. SQL JOIN

A post stores only user_id. To show the username with it, we JOIN the posts and users tables in one query.

