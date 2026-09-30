Concept                  What it is	                                                 Instagram example
Frontend	             What the user sees and clicks (runs in the browser)	     The feed page, the like button, the upload form
Backend	                 The server program that holds the business logic and rules	 Checks the password, saves the post, builds the feed
API	                     The "menu" of requests the frontend can send to 
                         the backend (usually over HTTP)	                         POST /posts, GET /feed
Database	             Permanent storage for structured data                       Users, posts, likes, comments
File/Object storage	     Storage for big files that don't belong in a database	     Photos and videos
Authentication	         Proving who you are (login)	                             Password check, then a token (JWT)
Authorization	         What you're allowed to do                                   You can delete only your own post