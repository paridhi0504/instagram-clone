import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../api/client.js';
import { likePost, unlikePost } from '../api/index.js';
import CommentSection from './CommentSection.jsx';

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [showComments, setShowComments] = useState(false);
  const pending = useRef(false); // ignore clicks while a request is in flight

  async function toggleLike() {
    if (pending.current) return;
    pending.current = true;

    const wasLiked = liked;
    // 1. optimistic update
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    try {
      // 2. tell the server
      if (wasLiked) await unlikePost(post.id);
      else await likePost(post.id);
    } catch {
      // 3. roll back on failure
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    } finally {
      pending.current = false;
    }
  }

  return (
    <article className="post-card">
      <header>
        <Link to={`/profile/${post.user_id}`}>
          <strong>{post.username}</strong>
        </Link>
        <span className="muted">{new Date(post.created_at).toLocaleString()}</span>
      </header>

      <img src={mediaUrl(post.media_url)} alt={post.caption || 'post'} />

      <footer>
        <div className="actions">
          <button className="icon-btn" onClick={toggleLike}>
            {liked ? '❤️' : '🤍'} {likeCount}
          </button>
          <button className="icon-btn" onClick={() => setShowComments((s) => !s)}>
            💬 {commentCount}
          </button>
        </div>

        {post.caption && (
          <p><strong>{post.username}</strong> {post.caption}</p>
        )}

        {showComments && (
          <CommentSection
            postId={post.id}
            postOwnerId={post.user_id}
            onCountChange={(delta) => setCommentCount((c) => c + delta)}
          />
        )}
      </footer>
    </article>
  );
}