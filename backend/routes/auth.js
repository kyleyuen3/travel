const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const pool = require('../db');
const { signToken } = require('../middleware/auth');
const { USERNAME_RE, EMAIL_RE, str } = require('../lib/validate');
const { privateUser } = require('../lib/serialize');

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const username = str(req.body.username);
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    const errors = {};
    if (!USERNAME_RE.test(username)) errors.username = '3–30 letters, numbers or underscores';
    if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email';
    if (password.length < 8) errors.password = 'At least 8 characters';
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Invalid input', errors });

    const [existing] = await pool.query(
      'SELECT username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length) {
      const taken = {};
      for (const row of existing) {
        if (row.username.toLowerCase() === username.toLowerCase()) taken.username = 'Username is taken';
        if (row.email === email) taken.email = 'Email is already registered';
      }
      return res.status(409).json({ error: 'Account already exists', errors: taken });
    }

    const id = uuid();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, username, email, passwordHash]
    );

    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.status(201).json({ token: signToken(user), user: privateUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login  — accepts email or username in `login` (or `email`)
router.post('/login', async (req, res, next) => {
  try {
    const login = str(req.body.login || req.body.email);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!login || !password) return res.status(400).json({ error: 'Email/username and password required' });

    const [[user]] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [login.toLowerCase(), login]
    );
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user), user: privateUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
