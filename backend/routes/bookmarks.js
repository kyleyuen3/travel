const express = require('express');
const { v4: uuid } = require('uuid');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { spot: serializeSpot } = require('../lib/serialize');
const { SPOT_SELECT } = require('../lib/spotQueries');

const router = express.Router();
router.use(requireAuth);

async function listBookmarks(userId) {
  const [rows] = await pool.query(
    `${SPOT_SELECT}
     JOIN bookmarks mine ON mine.spot_id = s.id AND mine.user_id = ?
     ORDER BY mine.created_at DESC`,
    [userId, userId]
  );
  return rows.map(serializeSpot);
}

// GET /bookmarks — the current user's saved spots
router.get('/', async (req, res, next) => {
  try {
    res.json({ spots: await listBookmarks(req.user.id) });
  } catch (err) {
    next(err);
  }
});

// POST /bookmarks/:spotId
router.post('/:spotId', async (req, res, next) => {
  try {
    const [[spot]] = await pool.query('SELECT id FROM spots WHERE id = ?', [req.params.spotId]);
    if (!spot) return res.status(404).json({ error: 'Spot not found' });

    // INSERT IGNORE + the unique(user_id, spot_id) constraint makes this idempotent
    await pool.query('INSERT IGNORE INTO bookmarks (id, user_id, spot_id) VALUES (?, ?, ?)', [
      uuid(),
      req.user.id,
      spot.id,
    ]);
    res.status(201).json({ bookmarked: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /bookmarks/:spotId
router.delete('/:spotId', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND spot_id = ?', [req.user.id, req.params.spotId]);
    res.json({ bookmarked: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.listBookmarks = listBookmarks;
