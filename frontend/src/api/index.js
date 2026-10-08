import { request } from './client.js';

export const register = (data) => request('/auth/register', { method: 'POST', body: data });
export const login = (data) => request('/auth/login', { method: 'POST', body: data });
export const getMe = () => request('/users/me');

export const getFeed = (cursor) =>
  request(`/feed?limit=5${cursor ? `&cursor=${cursor}` : ''}`);

export const getProfile = (id) => request(`/users/${id}`);
export const getUserPosts = (id, cursor) =>
  request(`/users/${id}/posts?limit=9${cursor ? `&cursor=${cursor}` : ''}`);

export const followUser = (id) => request(`/follow/${id}`, { method: 'POST' });
export const unfollowUser = (id) => request(`/follow/${id}`, { method: 'DELETE' });

export const createPost = (formData) =>
  request('/posts', { method: 'POST', body: formData, isForm: true });

export const getPost = (id) =>
  request(`/posts/${id}`);

export const likePost = (id) => request(`/posts/${id}/like`, { method: 'POST' });
export const unlikePost = (id) => request(`/posts/${id}/like`, { method: 'DELETE' });

export const getComments = (id, cursor) =>
  request(`/posts/${id}/comments?limit=5${cursor ? `&cursor=${cursor}` : ''}`);
export const addComment = (id, text) =>
  request(`/posts/${id}/comments`, { method: 'POST', body: { text } });
export const deleteComment = (id) =>
  request(`/comments/${id}`, { method: 'DELETE' });

export const deletePost = (id) => request(`/posts/${id}`, { method: 'DELETE' });

export const searchUsers = (q) =>
    request(`/search/users?q=${encodeURIComponent(q)}`);

export const getHashtagPosts = (tag, cursor) =>
    request(
        `/search/hashtags/${encodeURIComponent(tag)}?limit=5${
            cursor ? `&cursor=${cursor}` : ''
        }`
    );
