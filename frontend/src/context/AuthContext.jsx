import { useEffect, useState } from 'react';
import * as api from '../api/index.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem('token'))
  );

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      try {
        const currentUser = await api.getMe();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem('token');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  async function register(username, email, password) {
    const data = await api.register({ username, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
