import db from '../config/database.js';

export function getAnalytics(req, res) {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalTrips = db.prepare('SELECT COUNT(*) as count FROM trips').get().count;
    const totalCities = db.prepare('SELECT COUNT(*) as count FROM cities').get().count;
    const totalActivities = db.prepare('SELECT COUNT(*) as count FROM activities').get().count;
    
    // Most popular cities in trips
    const popularCities = db.prepare(`
      SELECT c.name, c.country, COUNT(ts.id) as trip_count, c.image
      FROM cities c
      LEFT JOIN trip_stops ts ON c.id = ts.city_id
      GROUP BY c.id
      ORDER BY trip_count DESC, c.popularity DESC
      LIMIT 6
    `).all();

    // Activity categories count
    const categoryDistribution = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM activities
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // Recent trips table for admin
    const recentTrips = db.prepare(`
      SELECT t.id, t.name, t.start_date, t.end_date, t.budget, u.name as user_name, u.email as user_email, t.created_at
      FROM trips t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `).all();

    // User growth stats
    const totalBudgetSum = db.prepare('SELECT COALESCE(SUM(budget), 0) as sum FROM trips').get().sum;

    return res.json({
      stats: {
        totalUsers,
        totalTrips,
        totalCities,
        totalActivities,
        totalBudgetSum
      },
      popularCities,
      categoryDistribution,
      recentTrips
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin analytics.' });
  }
}
