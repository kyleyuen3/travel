const express = require('express');
const pool = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { publicUser, spot: serializeSpot } = require('../lib/serialize');
const { SPOT_SELECT } = require('../lib/spotQueries');

const router = express.Router();

async function findUser(username) {
  const [[row]] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return row;
}

// GET /users/:username — public profile (no email, no bookmarks)
router.get('/:username', async (req, res, next) => {
  try {
    const user = await findUser(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [[{ spotCount }]] = await pool.query('SELECT COUNT(*) AS spotCount FROM spots WHERE user_id = ?', [
      user.id,
    ]);
    res.json({ user: { ...publicUser(user), spotCount: Number(spotCount) } });
  } catch (err) {
    next(err);
  }
});

// GET /users/:username/spots — spots this user posted
router.get('/:username/spots', optionalAuth, async (req, res, next) => {
  try {
    const user = await findUser(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [rows] = await pool.query(`${SPOT_SELECT} WHERE s.user_id = ? ORDER BY s.created_at DESC`, [
      req.user?.id ?? null,
      user.id,
    ]);
    res.json({ spots: rows.map(serializeSpot) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
