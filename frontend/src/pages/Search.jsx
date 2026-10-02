import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../api/index.js';

export default function Search() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const term = q.trim();
  const isTag = term.startsWith('#');

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (isTag || term.length < 2) {
        if (!cancelled) {
          setUsers([]);
          setError('');
        }
        return;
      }

      try {
        const data = await searchUsers(term);

        if (!cancelled) {
          setUsers(data.users);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setUsers([]);
          setError(err.message);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, isTag]);

  return (
    <div className="container">
      <input
        placeholder="Search users, or type #hashtag"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />

      {error && <p className="error">{error}</p>}

      {isTag && term.length > 1 && (
        <p>
          <Link to={`/tag/${term.slice(1).toLowerCase()}`}>
            View posts tagged {term}
          </Link>
        </p>
      )}

      {users.map((u) => (
        <Link
          key={u.id}
          to={`/profile/${u.id}`}
          className="user-row"
        >
          <strong>{u.username}</strong>
        </Link>
      ))}

      {!isTag &&
        term.length >= 2 &&
        users.length === 0 &&
        !error && (
          <p className="muted center">
            No users found.
          </p>
        )}
    </div>
  );
}