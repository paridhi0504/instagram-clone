Method	  Endpoint	          Purpose	                     Auth?
POST	  /auth/register	  Create an account	             No
POST	  /auth/login	      Get a JWT token	             No
GET	      /users/:id	      View a profile	             Yes
POST	  /follow/:id	      Follow a user	                 Yes
DELETE	  /follow/:id	      Unfollow	                     Yes
POST	  /posts	          Upload a photo and caption     Yes
GET	      /posts/:id	      View one post	                 Yes
GET	      /feed	              Posts from people you follow	 Yes
POST	  /posts/:id/like	  Like a post	                 Yes
POST	  /posts/:id/comment  Comment on a post	             Yes