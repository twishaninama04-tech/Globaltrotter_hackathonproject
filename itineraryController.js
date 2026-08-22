import db from '../config/database.js';

export function addItineraryActivity(req, res) {
  try {
    const userId = req.user.id;
    const { trip_stop_id, activity_id, title, date, start_time, duration, cost, notes } = req.body;

    if (!trip_stop_id || !date) {
      return res.status(400).json({ error: 'Trip stop ID and date are required.' });
    }

    const stop = db.prepare(`
      SELECT ts.*, t.user_id 
      FROM trip_stops ts 
      JOIN trips t ON ts.trip_id = t.id 
      WHERE ts.id = ?
    `).get(trip_stop_id);

    if (!stop) {
      return res.status(404).json({ error: 'Trip stop not found.' });
    }
    if (stop.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify itinerary.' });
    }

    let actName = title;
    let actDuration = duration || 60;
    let actCost = cost !== undefined ? parseFloat(cost) : 0;

    if (activity_id) {
      const actObj = db.prepare('SELECT * FROM activities WHERE id = ?').get(activity_id);
      if (actObj) {
        if (!actName) actName = actObj.name;
        if (!duration) actDuration = actObj.duration;
        if (cost === undefined) actCost = actObj.estimated_cost;
      }
    }

    const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) as maxPos FROM itinerary_activities WHERE trip_stop_id = ? AND date = ?').get(trip_stop_id, date).maxPos;

    const info = db.prepare(`
      INSERT INTO itinerary_activities (trip_stop_id, activity_id, title, date, start_time, duration, cost, notes, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trip_stop_id,
      activity_id || null,
      actName || 'New Activity',
      date,
      start_time || '09:00',
      actDuration,
      actCost,
      notes || '',
      maxPos + 1
    );

    const newItem = db.prepare(`
      SELECT ia.*, a.name as act_name, a.category, a.image as act_image, a.rating
      FROM itinerary_activities ia
      LEFT JOIN activities a ON ia.activity_id = a.id
      WHERE ia.id = ?
    `).get(info.lastInsertRowid);

    return res.status(201).json({ message: 'Activity added to itinerary!', item: newItem });
  } catch (err) {
    console.error('addItineraryActivity error:', err);
    return res.status(500).json({ error: 'Failed to schedule activity.' });
  }
}

export function updateItineraryActivity(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, date, start_time, duration, cost, notes } = req.body;

    const item = db.prepare(`
      SELECT ia.*, t.user_id 
      FROM itinerary_activities ia
      JOIN trip_stops ts ON ia.trip_stop_id = ts.id
      JOIN trips t ON ts.trip_id = t.id
      WHERE ia.id = ?
    `).get(id);

    if (!item) {
      return res.status(404).json({ error: 'Itinerary item not found.' });
    }
    if (item.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    db.prepare(`
      UPDATE itinerary_activities
      SET title = ?, date = ?, start_time = ?, duration = ?, cost = ?, notes = ?
      WHERE id = ?
    `).run(
      title !== undefined ? title : item.title,
      date || item.date,
      start_time || item.start_time,
      duration !== undefined ? parseInt(duration, 10) : item.duration,
      cost !== undefined ? parseFloat(cost) : item.cost,
      notes !== undefined ? notes : item.notes,
      id
    );

    const updated = db.prepare(`
      SELECT ia.*, a.name as act_name, a.category, a.image as act_image, a.rating
      FROM itinerary_activities ia
      LEFT JOIN activities a ON ia.activity_id = a.id
      WHERE ia.id = ?
    `).get(id);

    return res.json({ message: 'Activity updated successfully!', item: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update itinerary item.' });
  }
}

export function deleteItineraryActivity(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const item = db.prepare(`
      SELECT ia.*, t.user_id 
      FROM itinerary_activities ia
      JOIN trip_stops ts ON ia.trip_stop_id = ts.id
      JOIN trips t ON ts.trip_id = t.id
      WHERE ia.id = ?
    `).get(id);

    if (!item) {
      return res.status(404).json({ error: 'Itinerary item not found.' });
    }
    if (item.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    db.prepare('DELETE FROM itinerary_activities WHERE id = ?').run(id);
    return res.json({ message: 'Activity removed from itinerary.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete activity.' });
  }
}
