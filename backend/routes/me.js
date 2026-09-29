const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateProfile } = require('../lib/validate');
const { privateUser } = require('../lib/serialize');
const { listBookmarks } = require('./bookmarks');

const router = express.Router();
router.use(requireAuth);

// GET /me — the logged-in user's full profile (includes email)
router.get('/', async (req, res, next) => {
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: privateUser(user) });
  } catch (err) {
    next(err);
  }
});

// PUT /me — update bio, homeCity, avatarUrl
router.put('/', async (req, res, next) => {
  try {
    const { data, errors } = validateProfile(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Invalid input', errors });

    const columns = { bio: 'bio', homeCity: 'home_city', avatarUrl: 'avatar_url' };
    const sets = [];
    const params = [];
    for (const [key, col] of Object.entries(columns)) {
      if (data[key] !== undefined) {
        sets.push(`${col} = ?`);
        params.push(data[key]);
      }
    }
    if (sets.length) {
      await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, [...params, req.user.id]);
    }

    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: privateUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /me/bookmarks — private
router.get('/bookmarks', async (req, res, next) => {
  try {
    res.json({ spots: await listBookmarks(req.user.id) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
