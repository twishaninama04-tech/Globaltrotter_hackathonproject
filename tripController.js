import db from '../config/database.js';
import crypto from 'crypto';

export function getTrips(req, res) {
  try {
    const userId = req.user.id;
    const { filter, search } = req.query;

    let query = 'SELECT * FROM trips WHERE user_id = ?';
    const params = [userId];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    const today = new Date().toISOString().split('T')[0];

    if (filter === 'Upcoming') {
      query += ' AND start_date >= ?';
      params.push(today);
    } else if (filter === 'Completed') {
      query += ' AND end_date < ?';
      params.push(today);
    }

    query += ' ORDER BY start_date ASC, created_at DESC';

    const trips = db.prepare(query).all(...params);

    // Enrich each trip with stats
    const enriched = trips.map(t => {
      const stopsCount = db.prepare('SELECT COUNT(*) as count FROM trip_stops WHERE trip_id = ?').get(t.id).count;
      
      const actStats = db.prepare(`
        SELECT COUNT(ia.id) as act_count, COALESCE(SUM(ia.cost), 0) as act_cost
        FROM itinerary_activities ia
        JOIN trip_stops ts ON ia.trip_stop_id = ts.id
        WHERE ts.trip_id = ?
      `).get(t.id);

      const expenseCost = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE trip_id = ?').get(t.id).total;

      const totalEstimatedCost = actStats.act_cost + expenseCost;

      // Status check
      let status = 'Upcoming';
      if (t.end_date < today) {
        status = 'Completed';
      } else if (t.start_date <= today && t.end_date >= today) {
        status = 'Ongoing';
      }

      return {
        ...t,
        stops_count: stopsCount,
        activities_count: actStats.act_count,
        total_cost: totalEstimatedCost,
        status
      };
    });

    return res.json(enriched);
  } catch (err) {
    console.error('getTrips error:', err);
    return res.status(500).json({ error: 'Failed to retrieve trips.' });
  }
}

export function getTripById(req, res) {
  try {
    const { id } = req.params;
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Check ownership or public access
    if (trip.user_id !== req.user?.id && !trip.is_public) {
      return res.status(403).json({ error: 'Unauthorized to view this private trip.' });
    }

    // Fetch stops with city details
    const stops = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country as city_country, c.image as city_image, c.cost_index
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.position ASC, ts.arrival_date ASC
    `).all(id);

    // Fetch itinerary activities for each stop
    const stopsWithActivities = stops.map(stop => {
      const activities = db.prepare(`
        SELECT ia.*, a.name as act_name, a.category, a.image as act_image, a.rating
        FROM itinerary_activities ia
        LEFT JOIN activities a ON ia.activity_id = a.id
        WHERE ia.trip_stop_id = ?
        ORDER BY ia.date ASC, ia.start_time ASC, ia.position ASC
      `).all(stop.id);

      const stopCost = activities.reduce((sum, act) => sum + (act.cost || 0), 0);

      return {
        ...stop,
        activities,
        estimated_city_cost: stopCost
      };
    });

    // Expenses
    const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date ASC').all(id);

    // Calculate budget breakdown
    const activityTotal = stopsWithActivities.reduce((acc, stop) => acc + stop.estimated_city_cost, 0);
    const transportTotal = expenses.filter(e => e.category === 'transport').reduce((acc, e) => acc + e.amount, 0);
    const stayTotal = expenses.filter(e => e.category === 'accommodation').reduce((acc, e) => acc + e.amount, 0);
    const mealTotal = expenses.filter(e => e.category === 'meals').reduce((acc, e) => acc + e.amount, 0);
    const otherTotal = expenses.filter(e => e.category === 'other').reduce((acc, e) => acc + e.amount, 0);

    const totalSpending = activityTotal + transportTotal + stayTotal + mealTotal + otherTotal;
    const remainingBudget = (trip.budget || 0) - totalSpending;
    const isOverBudget = totalSpending > (trip.budget || 0) && trip.budget > 0;

    return res.json({
      ...trip,
      is_owner: trip.user_id === req.user?.id,
      stops: stopsWithActivities,
      expenses,
      financials: {
        budget: trip.budget || 0,
        totalSpending,
        remainingBudget,
        isOverBudget,
        overBudgetAmount: isOverBudget ? totalSpending - trip.budget : 0,
        breakdown: {
          activities: activityTotal,
          transport: transportTotal,
          accommodation: stayTotal,
          meals: mealTotal,
          other: otherTotal
        }
      }
    });
  } catch (err) {
    console.error('getTripById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve trip details.' });
  }
}

export function createTrip(req, res) {
  try {
    const userId = req.user.id;
    const { name, description, start_date, end_date, cover_image, budget } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Trip name, start date, and end date are required.' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date cannot be before start date.' });
    }

    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
    const share_token = crypto.randomBytes(12).toString('hex');

    const info = db.prepare(`
      INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public, share_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(userId, name.trim(), description || '', start_date, end_date, defaultCover, budget || 0, share_token);

    const createdTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({
      message: 'Trip created successfully!',
      trip: createdTrip
    });
  } catch (err) {
    console.error('createTrip error:', err);
    return res.status(500).json({ error: 'Failed to create trip.' });
  }
}

export function updateTrip(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, start_date, end_date, cover_image, budget } = req.body;

    const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this trip.' });
    }

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date cannot be before start date.' });
    }

    db.prepare(`
      UPDATE trips 
      SET name = ?, description = ?, start_date = ?, end_date = ?, cover_image = ?, budget = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      start_date || existing.start_date,
      end_date || existing.end_date,
      cover_image || existing.cover_image,
      budget !== undefined ? budget : existing.budget,
      id
    );

    const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    return res.json({ message: 'Trip updated successfully!', trip: updated });
  } catch (err) {
    console.error('updateTrip error:', err);
    return res.status(500).json({ error: 'Failed to update trip.' });
  }
}

export function deleteTrip(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this trip.' });
    }

    db.prepare('DELETE FROM trips WHERE id = ?').run(id);
    return res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete trip.' });
  }
}
