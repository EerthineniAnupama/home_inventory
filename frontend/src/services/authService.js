import api from './api';

// Each function returns response.data directly so callers don't
// have to unwrap `.data` everywhere - keeps AuthContext clean.

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data; // { token, user }
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { token, user }
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data; // { id, name, email, createdAt }
}

export async function updateProfile({ name, email }) {
  // NOTE: backend route is PUT /api/auth/me (confirm with backend teammate
  // if this ever changes to /api/auth/profile)
  const { data } = await api.put('/auth/me', { name, email });
  return data;
}