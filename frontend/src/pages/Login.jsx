import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser's default page reload
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Log in</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required
      />
      <input
        type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} required
      />
      <button disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      <p>No account? <Link to="/register">Register</Link></p>
    </form>
  );
}