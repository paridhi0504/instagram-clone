import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container center">
      <h2>404</h2>
      <p className="muted">This page doesn't exist.</p>
      <Link to="/">Go home</Link>
    </div>
  );
}