const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const TOKEN_KEY = 'citypins_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) setToken(null);
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.errors);
  }
  return data;
}

function qs(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export const api = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),

  me: () => request('GET', '/me'),
  updateMe: (body) => request('PUT', '/me', body),
  myBookmarks: () => request('GET', '/me/bookmarks'),

  listSpots: (params = {}) => request('GET', `/spots${qs(params)}`),
  listCities: () => request('GET', '/spots/cities'),
  getSpot: (id) => request('GET', `/spots/${encodeURIComponent(id)}`),
  createSpot: (body) => request('POST', '/spots', body),
  updateSpot: (id, body) => request('PUT', `/spots/${encodeURIComponent(id)}`, body),
  deleteSpot: (id) => request('DELETE', `/spots/${encodeURIComponent(id)}`),

  bookmark: (spotId) => request('POST', `/bookmarks/${encodeURIComponent(spotId)}`),
  unbookmark: (spotId) => request('DELETE', `/bookmarks/${encodeURIComponent(spotId)}`),

  getUser: (username) => request('GET', `/users/${encodeURIComponent(username)}`),
  getUserSpots: (username) => request('GET', `/users/${encodeURIComponent(username)}/spots`),
};
