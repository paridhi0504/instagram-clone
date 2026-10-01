import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../api/client.js';
import { likePost, unlikePost, deletePost } from '../api/index.js';
import { useAuth } from '../context/useAuth.js';
import CommentSection from './CommentSection.jsx';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();

  const isOwner = user?.id === post.user_id;

  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [showComments, setShowComments] = useState(false);

  const pending = useRef(false);

  async function toggleLike() {
    if (pending.current) return;

    pending.current = true;

    const wasLiked = liked;

    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch {
      // Roll back if request fails
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    } finally {
      pending.current = false;
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return;

    try {
      await deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <article className="post-card">
      <header>
        <Link to={`/profile/${post.user_id}`}>
          <strong>{post.username}</strong>
        </Link>

        <span className="muted">
          {new Date(post.created_at).toLocaleString()}
        </span>

        {isOwner && (
          <button
            type="button"
            className="link-btn"
            onClick={handleDelete}
          >
            delete
          </button>
        )}
      </header>

      <img
        src={mediaUrl(post.media_url)}
        alt={post.caption || 'post'}
      />

      <footer>
        <div className="actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleLike}
          >
            {liked ? '❤️' : '🤍'} {likeCount}
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowComments((s) => !s)}
          >
            💬 {commentCount}
          </button>
        </div>

        {post.caption && (
          <p>
            <strong>{post.username}</strong> {post.caption}
          </p>
        )}

        {showComments && (
          <CommentSection
            postId={post.id}
            postOwnerId={post.user_id}
            onCountChange={(delta) =>
              setCommentCount((c) => c + delta)
            }
          />
        )}
      </footer>
    </article>
  );
}