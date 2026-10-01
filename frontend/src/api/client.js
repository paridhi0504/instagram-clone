const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function mediaUrl(path) {
  return path ? `${API_URL}${path}` : null;
}

export function getToken() {
  return localStorage.getItem('token');
}

export async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && token && !path.startsWith('/auth/')) {
  localStorage.removeItem('token');
  window.location.href = '/login';
  throw new Error('Session expired, please log in again');
}

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.error || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}