CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS post_hashtags (
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (tag, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_hashtags_post
  ON post_hashtags(post_id);

CREATE INDEX IF NOT EXISTS idx_users_username_trgm
  ON users USING gin (username gin_trgm_ops);