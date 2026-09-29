require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const authRoutes = require('./routes/auth');
const spotRoutes = require('./routes/spots');
const bookmarkRoutes = require('./routes/bookmarks');
const userRoutes = require('./routes/users');
const meRoutes = require('./routes/me');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, db: 'disconnected' });
  }
});

app.use('/auth', authRoutes);
app.use('/spots', spotRoutes);
app.use('/bookmarks', bookmarkRoutes);
app.use('/users', userRoutes);
app.use('/me', meRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Catch-all error handler so routes can just `throw` / call next(err)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = Number(process.env.PORT) || 3001;

// Create any missing tables on startup (schema.sql only uses CREATE TABLE IF NOT EXISTS),
// so a fresh hosted database works without running db:init by hand.
async function ensureSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema
    .replace(/^\s*--.*$/gm, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await pool.query(statement);
}

pool
  .query('SELECT 1')
  .then(() => console.log('DB connected'))
  .then(ensureSchema)
  .then(() => console.log('Tables ready'))
  .catch((err) => console.error('DB setup failed:', err.message));

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
