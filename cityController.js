import db from '../config/database.js';

export function getCities(req, res) {
  try {
    const { search, region, cost_index, sort } = req.query;

    let query = 'SELECT * FROM cities WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR country LIKE ? OR description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (region && region !== 'All') {
      query += ' AND region = ?';
      params.push(region);
    }

    if (cost_index && cost_index !== 'All') {
      query += ' AND cost_index = ?';
      params.push(cost_index);
    }

    if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      query += ' ORDER BY popularity DESC, name ASC';
    }

    const cities = db.prepare(query).all(...params);
    return res.json(cities);
  } catch (err) {
    console.error('getCities error:', err);
    return res.status(500).json({ error: 'Failed to retrieve cities.' });
  }
}

export function getCityById(req, res) {
  try {
    const { id } = req.params;
    const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(id);
    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }

    const activities = db.prepare('SELECT * FROM activities WHERE city_id = ? ORDER BY rating DESC').all(id);

    return res.json({
      ...city,
      activities
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve city details.' });
  }
}
