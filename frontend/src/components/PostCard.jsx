import { Link } from 'react-router-dom';
import { mediaUrl } from '../api/client.js';

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <header>
        <Link to={`/profile/${post.user_id}`}>
          <strong>{post.username}</strong>
        </Link>
        <span className="muted">
          {new Date(post.created_at).toLocaleString()}
        </span>
      </header>

      <img src={mediaUrl(post.media_url)} alt={post.caption || 'post'} />

      <footer>
        <p className="muted">
          ♥ {post.like_count} · 💬 {post.comment_count}
        </p>
        {post.caption && (
          <p><strong>{post.username}</strong> {post.caption}</p>
        )}
      </footer>
    </article>
  );
}