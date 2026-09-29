# 📍 CityPins

Save and share restaurants and things to do, organized by city, so you can find them from real people instead of searching Google and social media.

**Stack:** React (Vite) · Node + Express · MySQL · JWT + bcrypt

```
travel/
├── backend/            Express API
│   ├── server.js       app entry, /health, route mounting
│   ├── db.js           MySQL connection pool
│   ├── schema.sql      users / spots / bookmarks tables + indexes
│   ├── middleware/     requireAuth / optionalAuth (JWT)
│   ├── routes/         auth, spots, bookmarks, users, me
│   ├── lib/            validation, serializers, shared SQL
│   └── scripts/        db:init, db:seed
└── frontend/           React app
    └── src/
        ├── pages/      Browse, SpotDetail, SpotForm, Login, Register, Profile, Me
        └── components/ Navbar, SpotCard, BookmarkButton, ...
```

## Run it locally

You need **Node 18+** and **MySQL 8** running locally.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then set DB_PASSWORD and JWT_SECRET
npm run db:init             # creates the travel_app database and tables
npm run db:seed             # optional: demo user (demo / password123) + sample spots
npm run dev                 # http://localhost:3001
```

Check it: open http://localhost:3001/health, which should return `{ "ok": true, "db": "connected" }`.

To generate a good `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:3001
npm run dev                 # http://localhost:5173
```

## Features

- Sign up and log in (bcrypt-hashed passwords, JWT sessions)
- Browse by city with no account needed: a city search with autocomplete from existing cities, a category filter, keyword search, newest/oldest sort, and "load more" paging
- Post, edit and delete spots (only the owner can edit or delete)
- Bookmark spots with ☆ Save; bookmarks are private
- Public profile at `/users/:username` showing username, bio, home city and posted spots
- Private profile at `/me` showing saved spots, your own spots, and a profile editor
- The link field takes a Google Maps link, an Instagram/TikTok/YouTube/blog link, or a plain address, which becomes a Google Maps search link

## API

| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/health` | public | DB connectivity check |
| POST | `/auth/register` | public | `{ username, email, password }` → `{ token, user }` |
| POST | `/auth/login` | public | `{ login, password }` (login = email or username) → `{ token, user }` |
| GET | `/spots` | public | `?city=&category=&q=&sort=newest\|oldest&limit=20&offset=0` |
| GET | `/spots/cities` | public | distinct cities + counts |
| GET | `/spots/categories` | public | fixed category list |
| GET | `/spots/:id` | public | |
| POST | `/spots` | JWT | `{ name, city, country, category, description, mapUrl }` |
| PUT | `/spots/:id` | JWT, owner | any subset of the fields above |
| DELETE | `/spots/:id` | JWT, owner | |
| GET | `/bookmarks` | JWT | my saved spots |
| POST | `/bookmarks/:spotId` | JWT | idempotent |
| DELETE | `/bookmarks/:spotId` | JWT | |
| GET | `/users/:username` | public | public profile (no email) |
| GET | `/users/:username/spots` | public | |
| GET | `/me` | JWT | includes email |
| PUT | `/me` | JWT | `{ bio, homeCity, avatarUrl }` |
| GET | `/me/bookmarks` | JWT | same as `GET /bookmarks` |

Send the token as `Authorization: Bearer <token>`.

**Categories:** Restaurant · Cafe/Dessert · Bar/Nightlife · Attraction/Landmark · Nature/Viewpoint · Shopping/Market · Museum/Culture · Activity/Experience

## Deploy

**Backend and DB (Railway or Render)**
1. Create a MySQL database. On Railway, use New → Database → MySQL.
2. Create a web service from this repo with the root directory set to `backend`, the start command `npm start`, and the env vars from `.env.example`. Point the `DB_*` values at your hosted DB, and set `CORS_ORIGIN` to your Vercel URL.
3. Run `npm run db:init` once, from the service shell or locally with the hosted DB credentials.

**Frontend (Vercel)**
1. Import the repo with the root directory set to `frontend`. Vercel detects the Vite framework preset automatically.
2. Set `VITE_API_URL` to your backend URL.
3. `vercel.json` already sends every route to `index.html`, so refreshing on `/spots/123` works.
