import { useEffect, useState } from 'react';
import { getFeed } from '../api/index.js';
import PostCard from '../components/PostCard.jsx';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(cursor) {
    setLoading(true);
    setError('');

    try {
      const data = await getFeed(cursor);
      setPosts((prev) => (cursor ? [...prev, ...data.posts] : data.posts));
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialFeed() {
      try {
        const data = await getFeed(null);

        if (cancelled) return;

        setPosts(data.posts);
        setNextCursor(data.nextCursor);
      } catch (err) {
        if (cancelled) return;

        setError(err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {!loading && posts.length === 0 && !error && (
        <p className="center muted">
          Nothing here yet. Upload a post or follow someone!
        </p>
      )}

      {loading && <p className="center">Loading...</p>}

      {nextCursor && !loading && (
        <button className="load-more" onClick={() => load(nextCursor)}>
          Load more
        </button>
      )}
    </div>
  );
}
