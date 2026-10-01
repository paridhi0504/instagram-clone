import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { getComments, addComment, deleteComment } from '../api/index.js';

export default function CommentSection({ postId, postOwnerId, onCountChange }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadMore(cursor) {
    setLoading(true);
    setError('');

    try {
      const data = await getComments(postId, cursor);

      setComments((prev) =>
        cursor ? [...prev, ...data.comments] : data.comments
      );

      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialComments() {
      setLoading(true);
      setError('');

      try {
        const data = await getComments(postId, null);

        if (!cancelled) {
          setComments(data.comments);
          setNextCursor(data.nextCursor);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialComments();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) return;

    setError('');

    try {
      const created = await addComment(postId, trimmedText);

      setComments((prev) => [created, ...prev]);
      setText('');

      onCountChange(1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError('');

    try {
      await deleteComment(id);

      setComments((prev) => prev.filter((comment) => comment.id !== id));

      onCountChange(-1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="comments">
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          maxLength={500}
          onChange={(e) => setText(e.target.value)}
        />

        <button type="submit" disabled={!text.trim()}>
          Post
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {comments.map((comment) => {
        const canDelete =
          comment.user_id === user?.id ||
          postOwnerId === user?.id;

        return (
          <p key={comment.id} className="comment">
            <Link to={`/profile/${comment.user_id}`}>
              <strong>{comment.username}</strong>
            </Link>{' '}

            {comment.comment_text}

            {canDelete && (
              <button
                type="button"
                className="link-btn"
                onClick={() => handleDelete(comment.id)}
              >
                delete
              </button>
            )}
          </p>
        );
      })}

      {loading && <p className="muted">Loading...</p>}

      {nextCursor && !loading && (
        <button
          type="button"
          className="link-btn"
          onClick={() => loadMore(nextCursor)}
        >
          Load more comments
        </button>
      )}
    </div>
  );
}