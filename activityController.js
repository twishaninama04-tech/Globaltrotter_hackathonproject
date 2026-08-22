import db from '../config/database.js';

export function getActivities(req, res) {
  try {
    const { city_id, category, search, maxCost, maxDuration } = req.query;

    let query = `
      SELECT a.*, c.name as city_name, c.country as city_country 
      FROM activities a 
      JOIN cities c ON a.city_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (city_id) {
      query += ' AND a.city_id = ?';
      params.push(city_id);
    }

    if (category && category !== 'All') {
      query += ' AND a.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (a.name LIKE ? OR a.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    if (maxCost) {
      query += ' AND a.estimated_cost <= ?';
      params.push(parseFloat(maxCost));
    }

    if (maxDuration) {
      query += ' AND a.duration <= ?';
      params.push(parseInt(maxDuration, 10));
    }

    query += ' ORDER BY a.rating DESC, a.name ASC';

    const activities = db.prepare(query).all(...params);
    return res.json(activities);
  } catch (err) {
    console.error('getActivities error:', err);
    return res.status(500).json({ error: 'Failed to retrieve activities.' });
  }
}

export function getActivityById(req, res) {
  try {
    const { id } = req.params;
    const activity = db.prepare(`
      SELECT a.*, c.name as city_name, c.country as city_country 
      FROM activities a 
      JOIN cities c ON a.city_id = c.id 
      WHERE a.id = ?
    `).get(id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found.' });
    }

    return res.json(activity);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve activity.' });
  }
}
