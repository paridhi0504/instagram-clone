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


### Phase 4: Follow, Unfollow and the Home Feed
Goal: users can follow and unfollow each other, view profiles, and get a paginated home feed of posts from the people they follow.

Part A: The concepts
1. A many-to-many relationship on one table

A user can follow many users, and a user can be followed by many users. Both sides are the same users table, so we need a join table, your followers table:

followers (user_id, follower_id)
(2, 1)  → user 1 follows user 2
(3, 1)  → user 1 follows user 3
(1, 2)  → user 2 follows user 1

Be careful with the direction. user_id is the person being followed and follower_id is the person doing the following. Most beginners mix these up at least once, so keep this table in your head.

"Who do I follow?" → WHERE follower_id = me
"Who follows me?" → WHERE user_id = me
2. Idempotency

An operation is idempotent if doing it twice has the same result as doing it once. If a user double-clicks Follow, we don't want an error or a duplicate row. The composite primary key (user_id, follower_id) already blocks duplicates, and INSERT ... ON CONFLICT DO NOTHING makes the second attempt a quiet no-op.

3. Indexes

An index is like the index at the back of a book. Without one, Postgres reads every row to find matches (a sequential scan). With one, it jumps straight to them.

Your primary key (user_id, follower_id) already gives you a fast lookup by user_id. But the feed asks "who does I follow?", which searches by follower_id, so we add an index for it. We also index posts(user_id, id DESC) so "latest posts by these users" is fast. Indexes make reads faster but writes slightly slower, so you add them where you query.

4. Pagination

You never return all posts at once. There are two approaches:

	Offset (LIMIT 10 OFFSET 20)	Cursor (WHERE id < last_seen_id)
Simplicity	Very easy	A little more work
Speed on deep pages	Slow, since it skips 20 rows to start	Fast, since it jumps via the index
New posts arrive while scrolling	Duplicates or skipped items	Stable

Feeds use cursor pagination. The client says "give me 10 posts older than post #57". The response includes a nextCursor to use for the next request. This is how infinite scroll works.

Trick: fetch limit + 1 rows. If you get the extra one, you know there's another page, and you drop it before responding.

5. The feed query is "fan-out on read"

This is the pull model from section 6 of your notes. At request time we look up everyone I follow and fetch their latest posts. It's simple and always fresh. At Instagram scale it gets expensive, which is why the push model and Redis exist later. You are building the "before" picture that makes those optimizations make sense.


### Phase 5: The React Frontend
Goal: a browser app where you can register, log in, see your feed, upload a photo, view profiles, and follow or unfollow people. It talks to the backend you've already built and tested.

Likes and comments come in Phase 6. For now, post cards will show the counts only.

Part A: The concepts
1. What React is

React builds the UI out of components, which are functions that return what should appear on screen.

jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
JSX is the HTML-looking syntax inside JavaScript. { } lets you drop in any JS value.
Props are the inputs to a component (name above), like function arguments.
State (useState) is data a component remembers. When state changes, React re-renders the component. You never manually edit the page. You change state, and the UI follows. This is the biggest mindset shift from plain JavaScript.
Effects (useEffect) run code after rendering, such as fetching data when a page opens.
2. The frontend is a separate program

It runs in the browser at localhost:5173 (Vite's port). Your backend runs at localhost:4000. Because they're on different origins, the browser enforces CORS. You already added cors() in Phase 1, which is why this will work.

3. Single Page App and routing

The browser loads one HTML page once. React Router swaps components when the URL changes (/login, /profile/3) without reloading the page. The backend returns the data, and the frontend decides what to show.

4. Where does the token live?

After login you get a JWT, and the frontend must remember it across page refreshes. We store it in localStorage and keep the logged-in user in a React Context, which is shared state any component can read.

Storing JWTs in localStorage is common for learning projects, but a script injected into the page (XSS) could read it. Production apps often use httpOnly cookies instead. For this project, localStorage is fine and I want you to know the trade-off.

5. Protected routes

The backend already refuses unauthenticated requests. The frontend also hides pages from logged-out users, but only for user experience. Real security is always on the backend.


### Phase 6: Likes and Comments

Goal: users can like and unlike posts (with an instant-feeling heart button) and read, add and delete comments.

Your likes and comments tables already exist from Phase 1, so this phase adds endpoints and UI.

Part A: The concepts
1. Like is a toggle built from two idempotent operations

You've already done this with follows. A like is a row in a join table, with (user_id, post_id) as the primary key.

POST /posts/:id/like inserts a row with ON CONFLICT DO NOTHING. Liking twice is harmless.
DELETE /posts/:id/like deletes the row. Unliking twice is harmless.

We use two explicit endpoints instead of one "toggle" endpoint. If a request is retried, a toggle would flip the state twice, but explicit operations always end in the state you asked for.

2. Comments are a one-to-many relationship

One post has many comments, and each comment belongs to one post and one user. Unlike likes, comments have their own id, because you need to refer to one comment (to delete it).

Who may delete a comment? The comment's author, and also the owner of the post. Instagram works the same way. This is an authorization rule, so it lives in the service.

3. Optimistic UI

When you tap the heart, waiting 200 ms for the server before the heart turns red feels laggy. So we:

Update the UI immediately, assuming success.
Send the request.
If it fails, roll the UI back.

This is how real apps feel instant. You'll write it by hand.

4. liked_by_me

The frontend needs to know whether the current viewer already liked each post, to draw a filled or empty heart. So the feed query returns that as a boolean using EXISTS, just like is_following on profiles.

5. A scaling note that ties back to your notes

(SELECT COUNT(*) FROM likes WHERE post_id = p.id) counts rows on every read. That's fine now. With millions of likes per post it becomes expensive, and real systems keep a stored counter or cache it in Redis. You'll meet this in the scale-up phase.

6. Safe text

Users can write <script>alert(1)</script> as a comment. React escapes text rendered with {comment.text}, so it shows as plain text and doesn't run. That protection is automatic unless you use dangerouslySetInnerHTML. Never use that on user content.
