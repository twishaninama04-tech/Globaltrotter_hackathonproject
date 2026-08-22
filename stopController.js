import db from '../config/database.js';

export function addStop(req, res) {
  try {
    const userId = req.user.id;
    const { trip_id, city_id, arrival_date, departure_date, position } = req.body;

    if (!trip_id || !city_id || !arrival_date || !departure_date) {
      return res.status(400).json({ error: 'Trip, city, arrival date, and departure date are required.' });
    }

    const trip = db.prepare('SELECT user_id FROM trips WHERE id = ?').get(trip_id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }
    if (trip.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this trip.' });
    }

    if (new Date(departure_date) < new Date(arrival_date)) {
      return res.status(400).json({ error: 'Departure date cannot be before arrival date.' });
    }

    const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) as maxPos FROM trip_stops WHERE trip_id = ?').get(trip_id).maxPos;
    const pos = position !== undefined ? position : maxPos + 1;

    const info = db.prepare(`
      INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, position)
      VALUES (?, ?, ?, ?, ?)
    `).run(trip_id, city_id, arrival_date, departure_date, pos);

    const newStop = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country as city_country, c.image as city_image
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.id = ?
    `).get(info.lastInsertRowid);

    return res.status(201).json({ message: 'Stop added successfully!', stop: { ...newStop, activities: [] } });
  } catch (err) {
    console.error('addStop error:', err);
    return res.status(500).json({ error: 'Failed to add stop to trip.' });
  }
}

export function updateStop(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { arrival_date, departure_date, position } = req.body;

    const stop = db.prepare(`
      SELECT ts.*, t.user_id 
      FROM trip_stops ts 
      JOIN trips t ON ts.trip_id = t.id 
      WHERE ts.id = ?
    `).get(id);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found.' });
    }
    if (stop.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    db.prepare(`
      UPDATE trip_stops
      SET arrival_date = ?, departure_date = ?, position = ?
      WHERE id = ?
    `).run(
      arrival_date || stop.arrival_date,
      departure_date || stop.departure_date,
      position !== undefined ? position : stop.position,
      id
    );

    return res.json({ message: 'Stop updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update stop.' });
  }
}

export function deleteStop(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const stop = db.prepare(`
      SELECT ts.*, t.user_id 
      FROM trip_stops ts 
      JOIN trips t ON ts.trip_id = t.id 
      WHERE ts.id = ?
    `).get(id);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found.' });
    }
    if (stop.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    db.prepare('DELETE FROM trip_stops WHERE id = ?').run(id);
    return res.json({ message: 'Stop removed from trip.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete stop.' });
  }
}

export function reorderStops(req, res) {
  try {
    const userId = req.user.id;
    const { trip_id, stop_ids } = req.body; // Array of stop IDs in order

    const trip = db.prepare('SELECT user_id FROM trips WHERE id = ?').get(trip_id);
    if (!trip || trip.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const stmt = db.prepare('UPDATE trip_stops SET position = ? WHERE id = ? AND trip_id = ?');
    const updateMany = db.transaction((ids) => {
      ids.forEach((id, index) => {
        stmt.run(index + 1, id, trip_id);
      });
    });

    updateMany(stop_ids);
    return res.json({ message: 'Stops reordered successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reorder stops.' });
  }
}
