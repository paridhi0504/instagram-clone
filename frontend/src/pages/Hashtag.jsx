import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getHashtagPosts } from '../api/index.js';
import PostCard from '../components/PostCard.jsx';

export default function Hashtag() {
  const { tag } = useParams();

  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);

      try {
        const data = await getHashtagPosts(tag, null);

        if (!cancelled) {
          setPosts(data.posts);
          setNextCursor(data.nextCursor);
          setError('');
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

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [tag]);

  async function loadMore() {
    if (!nextCursor || loading) return;

    setLoading(true);

    try {
      const data = await getHashtagPosts(tag, nextCursor);

      setPosts((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>#{tag}</h2>

      {error && <p className="error">{error}</p>}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}

      {!loading && posts.length === 0 && !error && (
        <p className="muted center">
          No posts yet.
        </p>
      )}

      {loading && (
        <p className="center">
          Loading...
        </p>
      )}

      {nextCursor && !loading && (
        <button
          className="load-more"
          onClick={loadMore}
        >
          Load more
        </button>
      )}
    </div>
  );
}