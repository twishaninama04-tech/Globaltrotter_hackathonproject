import db from '../config/database.js';
import crypto from 'crypto';

export function toggleShare(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { is_public } = req.body;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }
    if (trip.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    let share_token = trip.share_token;
    if (!share_token) {
      share_token = crypto.randomBytes(12).toString('hex');
    }

    const publicVal = is_public ? 1 : 0;
    db.prepare('UPDATE trips SET is_public = ?, share_token = ? WHERE id = ?').run(publicVal, share_token, id);

    return res.json({
      message: publicVal ? 'Public sharing enabled!' : 'Public sharing disabled.',
      is_public: publicVal === 1,
      share_token
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update share setting.' });
  }
}

export function getSharedTrip(req, res) {
  try {
    const { token } = req.params;
    const trip = db.prepare('SELECT t.*, u.name as traveler_name, u.profile_image as traveler_image FROM trips t JOIN users u ON t.user_id = u.id WHERE t.share_token = ?').get(token);

    if (!trip || !trip.is_public) {
      return res.status(404).json({ error: 'Shared itinerary not found or private.' });
    }

    // Fetch stops & activities
    const stops = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country as city_country, c.image as city_image, c.cost_index
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.position ASC, ts.arrival_date ASC
    `).all(trip.id);

    const stopsWithActivities = stops.map(stop => {
      const activities = db.prepare(`
        SELECT ia.*, a.name as act_name, a.category, a.image as act_image, a.rating
        FROM itinerary_activities ia
        LEFT JOIN activities a ON ia.activity_id = a.id
        WHERE ia.trip_stop_id = ?
        ORDER BY ia.date ASC, ia.start_time ASC, ia.position ASC
      `).all(stop.id);

      return {
        ...stop,
        activities
      };
    });

    const expenses = db.prepare('SELECT category, amount, description, date FROM expenses WHERE trip_id = ?').all(trip.id);

    return res.json({
      ...trip,
      stops: stopsWithActivities,
      expenses
    });
  } catch (err) {
    console.error('getSharedTrip error:', err);
    return res.status(500).json({ error: 'Failed to retrieve shared trip.' });
  }
}

export function copySharedTrip(req, res) {
  try {
    const userId = req.user.id;
    const { token } = req.params;

    const originalTrip = db.prepare('SELECT * FROM trips WHERE share_token = ? AND is_public = 1').get(token);
    if (!originalTrip) {
      return res.status(404).json({ error: 'Shared trip not found or no longer public.' });
    }

    const newShareToken = crypto.randomBytes(12).toString('hex');
    const newTripName = `${originalTrip.name} (Copy)`;

    const newTripInfo = db.prepare(`
      INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public, share_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      userId,
      newTripName,
      originalTrip.description,
      originalTrip.start_date,
      originalTrip.end_date,
      originalTrip.cover_image,
      originalTrip.budget,
      newShareToken
    );

    const newTripId = newTripInfo.lastInsertRowid;

    // Copy stops
    const stops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ?').all(originalTrip.id);
    for (const stop of stops) {
      const newStopInfo = db.prepare(`
        INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, position)
        VALUES (?, ?, ?, ?, ?)
      `).run(newTripId, stop.city_id, stop.arrival_date, stop.departure_date, stop.position);

      const newStopId = newStopInfo.lastInsertRowid;

      // Copy itinerary activities for this stop
      const activities = db.prepare('SELECT * FROM itinerary_activities WHERE trip_stop_id = ?').all(stop.id);
      for (const act of activities) {
        db.prepare(`
          INSERT INTO itinerary_activities (trip_stop_id, activity_id, title, date, start_time, duration, cost, notes, position)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newStopId, act.activity_id, act.title, act.date, act.start_time, act.duration, act.cost, act.notes, act.position);
      }
    }

    // Copy expenses
    const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ?').all(originalTrip.id);
    for (const exp of expenses) {
      db.prepare(`
        INSERT INTO expenses (trip_id, category, amount, description, date)
        VALUES (?, ?, ?, ?, ?)
      `).run(newTripId, exp.category, exp.amount, exp.description, exp.date);
    }

    return res.status(201).json({
      message: 'Trip copied successfully to your account!',
      newTripId
    });
  } catch (err) {
    console.error('copySharedTrip error:', err);
    return res.status(500).json({ error: 'Failed to copy trip.' });
  }
}
