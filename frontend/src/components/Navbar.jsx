import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        InstaClone
      </Link>

      {user && (
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/new">+ Post</Link>

          <Link
            to={`/profile/${user.id}`}
            className="nav-profile"
          >
            {user.username}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}