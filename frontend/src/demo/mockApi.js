// In-browser stand-in for the backend, used only by `npm run build:demo`.
// Mirrors the real API's responses and validation so the pages behave the same.
// Data lives in localStorage (per browser) and falls back to memory if storage is blocked.
import { CATEGORIES } from '../constants.js';
import { SEED_USERS, SEED_SPOTS } from './seed.js';

const DB_KEY = 'citypins_demo_db';
const TOKEN_KEY = 'citypins_demo_token';
const memory = {};

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory[key] ?? null;
  }
}
function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    if (value === null) delete memory[key];
    else memory[key] = value;
  }
}

function freshDb() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return {
    users: SEED_USERS.map((u, i) => ({ ...u, createdAt: new Date(now - (60 - i) * day).toISOString() })),
    spots: SEED_SPOTS.map((s, i) => ({ ...s, id: `spot-${i + 1}`, createdAt: new Date(now - (i + 1) * 0.7 * day).toISOString() })),
    bookmarks: [
      { userId: 'u-maya', spotId: 'spot-1', createdAt: new Date(now).toISOString() },
      { userId: 'u-jun', spotId: 'spot-1', createdAt: new Date(now).toISOString() },
      { userId: 'u-maya', spotId: 'spot-4', createdAt: new Date(now).toISOString() },
      { userId: 'u-demo', spotId: 'spot-6', createdAt: new Date(now).toISOString() },
    ],
  };
}

function load() {
  try {
    const raw = read(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to a fresh copy
  }
  const db = freshDb();
  save(db);
  return db;
}
function save(db) {
  write(DB_KEY, JSON.stringify(db));
}

export function resetDemo() {
  write(DB_KEY, null);
  write(TOKEN_KEY, null);
}

export function getToken() {
  return read(TOKEN_KEY);
}
export function setToken(token) {
  write(TOKEN_KEY, token || null);
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

function currentUser(db) {
  const token = getToken();
  return token ? db.users.find((u) => u.id === token) : null;
}
function requireUser(db) {
  const user = currentUser(db);
  if (!user) throw new ApiError('Login required', 401);
  return user;
}

const publicUser = ({ id, username, bio, homeCity, avatarUrl, createdAt }) => ({ id, username, bio, homeCity, avatarUrl, createdAt });
const privateUser = (u) => ({ ...publicUser(u), email: u.email });

function serializeSpot(db, s) {
  const viewer = currentUser(db);
  return {
    ...s,
    username: db.users.find((u) => u.id === s.userId)?.username,
    bookmarkCount: db.bookmarks.filter((b) => b.spotId === s.id).length,
    bookmarked: Boolean(viewer && db.bookmarks.some((b) => b.spotId === s.id && b.userId === viewer.id)),
  };
}

function validateSpot(body, partial) {
  const limits = { city: 100, country: 100, name: 120, description: 500, mapUrl: 2000, category: 50 };
  const data = {};
  const errors = {};
  for (const [key, max] of Object.entries(limits)) {
    if (partial && body[key] === undefined) continue;
    const value = str(body[key]);
    if (!value) errors[key] = 'Required';
    else if (value.length > max) errors[key] = `Must be ${max} characters or fewer`;
    else data[key] = value;
  }
  if (data.category && !CATEGORIES.includes(data.category)) {
    errors.category = 'Invalid category';
    delete data.category;
  }
  if (Object.keys(errors).length) throw new ApiError('Invalid input', 400, errors);
  return data;
}

function sameText(a, b) {
  return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
}

function run(fn) {
  try {
    return delay(fn(load()));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) setToken(null);
    return delay().then(() => {
      throw err;
    });
  }
}

export const api = {
  register: (body) =>
    run((db) => {
      const username = str(body.username);
      const email = str(body.email).toLowerCase();
      const password = typeof body.password === 'string' ? body.password : '';
      const errors = {};
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) errors.username = '3–30 letters, numbers or underscores';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
      if (password.length < 8) errors.password = 'At least 8 characters';
      if (Object.keys(errors).length) throw new ApiError('Invalid input', 400, errors);
      if (db.users.some((u) => sameText(u.username, username))) errors.username = 'Username is taken';
      if (db.users.some((u) => u.email === email)) errors.email = 'Email is already registered';
      if (Object.keys(errors).length) throw new ApiError('Account already exists', 409, errors);

      const user = { id: uid(), username, email, password, bio: null, homeCity: null, avatarUrl: null, createdAt: new Date().toISOString() };
      db.users.push(user);
      save(db);
      return { token: user.id, user: privateUser(user) };
    }),

  login: ({ login, password }) =>
    run((db) => {
      const value = str(login);
      const user = db.users.find((u) => u.email === value.toLowerCase() || u.username === value);
      if (!user || user.password !== password) throw new ApiError('Invalid credentials', 401);
      return { token: user.id, user: privateUser(user) };
    }),

  me: () => run((db) => ({ user: privateUser(requireUser(db)) })),

  updateMe: (body) =>
    run((db) => {
      const user = requireUser(db);
      const errors = {};
      if (body.bio !== undefined && str(body.bio).length > 200) errors.bio = 'Must be 200 characters or fewer';
      if (body.homeCity !== undefined && str(body.homeCity).length > 100) errors.homeCity = 'Must be 100 characters or fewer';
      if (body.avatarUrl && !/^https?:\/\/\S+$/i.test(str(body.avatarUrl))) errors.avatarUrl = 'Must be a valid http(s) URL';
      if (Object.keys(errors).length) throw new ApiError('Invalid input', 400, errors);
      for (const key of ['bio', 'homeCity', 'avatarUrl']) {
        if (body[key] !== undefined) user[key] = str(body[key]) || null;
      }
      save(db);
      return { user: privateUser(user) };
    }),

  myBookmarks: () =>
    run((db) => {
      const user = requireUser(db);
      const mine = db.bookmarks.filter((b) => b.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { spots: mine.map((b) => db.spots.find((s) => s.id === b.spotId)).filter(Boolean).map((s) => serializeSpot(db, s)) };
    }),

  listSpots: (params = {}) =>
    run((db) => {
      const city = str(params.city);
      const category = str(params.category);
      const q = str(params.q).toLowerCase();
      const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
      const offset = Math.max(Number(params.offset) || 0, 0);
      let list = db.spots.filter(
        (s) =>
          (!city || sameText(s.city, city)) &&
          (!category || category === 'All' || s.category === category) &&
          (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      );
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (params.sort === 'oldest') list.reverse();
      return { spots: list.slice(offset, offset + limit).map((s) => serializeSpot(db, s)), total: list.length, limit, offset };
    }),

  listCities: () =>
    run((db) => {
      const counts = new Map();
      for (const s of db.spots) {
        const key = `${s.city}|${s.country}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      const cities = [...counts].map(([key, count]) => {
        const [city, country] = key.split('|');
        return { city, country, count };
      });
      cities.sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
      return { cities };
    }),

  getSpot: (id) =>
    run((db) => {
      const spot = db.spots.find((s) => s.id === id);
      if (!spot) throw new ApiError('Spot not found', 404);
      return { spot: serializeSpot(db, spot) };
    }),

  createSpot: (body) =>
    run((db) => {
      const user = requireUser(db);
      const data = validateSpot(body, false);
      const spot = { id: uid(), userId: user.id, ...data, createdAt: new Date().toISOString() };
      db.spots.push(spot);
      save(db);
      return { spot: serializeSpot(db, spot) };
    }),

  updateSpot: (id, body) =>
    run((db) => {
      const user = requireUser(db);
      const spot = db.spots.find((s) => s.id === id);
      if (!spot) throw new ApiError('Spot not found', 404);
      if (spot.userId !== user.id) throw new ApiError('Not your spot', 403);
      Object.assign(spot, validateSpot(body, true));
      save(db);
      return { spot: serializeSpot(db, spot) };
    }),

  deleteSpot: (id) =>
    run((db) => {
      const user = requireUser(db);
      const spot = db.spots.find((s) => s.id === id);
      if (!spot) throw new ApiError('Spot not found', 404);
      if (spot.userId !== user.id) throw new ApiError('Not your spot', 403);
      db.spots = db.spots.filter((s) => s.id !== id);
      db.bookmarks = db.bookmarks.filter((b) => b.spotId !== id);
      save(db);
      return null;
    }),

  bookmark: (spotId) =>
    run((db) => {
      const user = requireUser(db);
      if (!db.spots.some((s) => s.id === spotId)) throw new ApiError('Spot not found', 404);
      if (!db.bookmarks.some((b) => b.userId === user.id && b.spotId === spotId)) {
        db.bookmarks.push({ userId: user.id, spotId, createdAt: new Date().toISOString() });
        save(db);
      }
      return { bookmarked: true };
    }),

  unbookmark: (spotId) =>
    run((db) => {
      const user = requireUser(db);
      db.bookmarks = db.bookmarks.filter((b) => !(b.userId === user.id && b.spotId === spotId));
      save(db);
      return { bookmarked: false };
    }),

  getUser: (username) =>
    run((db) => {
      const user = db.users.find((u) => u.username === username);
      if (!user) throw new ApiError('User not found', 404);
      return { user: { ...publicUser(user), spotCount: db.spots.filter((s) => s.userId === user.id).length } };
    }),

  getUserSpots: (username) =>
    run((db) => {
      const user = db.users.find((u) => u.username === username);
      if (!user) throw new ApiError('User not found', 404);
      const list = db.spots.filter((s) => s.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { spots: list.map((s) => serializeSpot(db, s)) };
    }),
};
