import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFollowers, getFollowing } from '../api/index.js';

export default function FollowList() {
  const { id, type } = useParams();

  const [users, setUsers] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError('');

        const fetchUsers = type === 'followers'
          ? getFollowers
          : getFollowing;

        const data = await fetchUsers(id);

        if (cancelled) return;

        setUsers(data.users);
        setNextCursor(data.nextCursor);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load users');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [id, type]);

  async function loadMore() {
    if (!nextCursor || loading) return;

    try {
      setLoading(true);
      setError('');

      const fetchUsers = type === 'followers'
        ? getFollowers
        : getFollowing;

      const data = await fetchUsers(id, nextCursor);

      setUsers((prev) => [...prev, ...data.users]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message || 'Failed to load more users');
    } finally {
      setLoading(false);
    }
  }

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <main className="container">
      <h2>{title}</h2>

      {error && <p className="error">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p className="muted">No users found.</p>
      )}

      {users.map((item) => (
        <div key={item.id} className="follow-list-item">
          <Link to={`/profile/${item.id}`}>
            {item.username}
          </Link>
        </div>
      ))}

      {loading && <p>Loading...</p>}

      {!loading && nextCursor && (
        <button onClick={loadMore}>
          Load more
        </button>
      )}
    </main>
  );
}