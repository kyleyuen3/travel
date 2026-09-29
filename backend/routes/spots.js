const express = require('express');
const { v4: uuid } = require('uuid');
const pool = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { CATEGORIES, str, validateSpot } = require('../lib/validate');
const { spot: serializeSpot } = require('../lib/serialize');
const { SPOT_SELECT } = require('../lib/spotQueries');

const router = express.Router();

// GET /spots/categories — the fixed category list (handy for dropdowns)
router.get('/categories', (req, res) => res.json({ categories: CATEGORIES }));

// GET /spots/cities — distinct cities with spot counts (for the city dropdown)
router.get('/cities', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT city, country, COUNT(*) AS count
       FROM spots GROUP BY city, country ORDER BY count DESC, city ASC LIMIT 100`
    );
    res.json({ cities: rows.map((r) => ({ city: r.city, country: r.country, count: Number(r.count) })) });
  } catch (err) {
    next(err);
  }
});

// GET /spots?city=&category=&q=&sort=newest|oldest&limit=20&offset=0
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const city = str(req.query.city);
    const category = str(req.query.category);
    const q = str(req.query.q);
    const sort = req.query.sort === 'oldest' ? 'ASC' : 'DESC';
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = [];
    const params = [];
    if (city) {
      where.push('s.city = ?'); // default collation is case-insensitive
      params.push(city);
    }
    if (category && category !== 'All') {
      where.push('s.category = ?');
      params.push(category);
    }
    if (q) {
      where.push('(s.name LIKE ? OR s.description LIKE ?)');
      const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
      params.push(like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${SPOT_SELECT} ${whereSql} ORDER BY s.created_at ${sort}, s.id LIMIT ? OFFSET ?`,
      [req.user?.id ?? null, ...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM spots s ${whereSql}`, params);

    res.json({ spots: rows.map(serializeSpot), total: Number(total), limit, offset });
  } catch (err) {
    next(err);
  }
});

// GET /spots/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const [[row]] = await pool.query(`${SPOT_SELECT} WHERE s.id = ?`, [req.user?.id ?? null, req.params.id]);
    if (!row) return res.status(404).json({ error: 'Spot not found' });
    res.json({ spot: serializeSpot(row) });
  } catch (err) {
    next(err);
  }
});

// POST /spots (logged in)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { data, errors } = validateSpot(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Invalid input', errors });

    const id = uuid();
    await pool.query(
      `INSERT INTO spots (id, user_id, city, country, category, name, description, map_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, data.city, data.country, data.category, data.name, data.description, data.mapUrl]
    );
    const [[row]] = await pool.query(`${SPOT_SELECT} WHERE s.id = ?`, [req.user.id, id]);
    res.status(201).json({ spot: serializeSpot(row) });
  } catch (err) {
    next(err);
  }
});

// PUT /spots/:id (owner only)
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const [[existing]] = await pool.query('SELECT user_id FROM spots WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Spot not found' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Not your spot' });

    const { data, errors } = validateSpot(req.body, { partial: true });
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Invalid input', errors });

    const columns = {
      city: 'city',
      country: 'country',
      category: 'category',
      name: 'name',
      description: 'description',
      mapUrl: 'map_url',
    };
    const sets = [];
    const params = [];
    for (const [key, col] of Object.entries(columns)) {
      if (data[key] !== undefined) {
        sets.push(`${col} = ?`);
        params.push(data[key]);
      }
    }
    if (sets.length) {
      await pool.query(`UPDATE spots SET ${sets.join(', ')} WHERE id = ?`, [...params, req.params.id]);
    }

    const [[row]] = await pool.query(`${SPOT_SELECT} WHERE s.id = ?`, [req.user.id, req.params.id]);
    res.json({ spot: serializeSpot(row) });
  } catch (err) {
    next(err);
  }
});

// DELETE /spots/:id (owner only)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const [[existing]] = await pool.query('SELECT user_id FROM spots WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Spot not found' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Not your spot' });

    await pool.query('DELETE FROM spots WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
