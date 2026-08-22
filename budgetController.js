import db from '../config/database.js';

export function getTripBudget(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }
    if (trip.user_id !== userId && !trip.is_public) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Get itinerary activities costs
    const activities = db.prepare(`
      SELECT ia.*, ts.arrival_date, ts.departure_date
      FROM itinerary_activities ia
      JOIN trip_stops ts ON ia.trip_stop_id = ts.id
      WHERE ts.trip_id = ?
    `).all(id);

    // Get expenses
    const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date ASC').all(id);

    // Breakdown calculation
    const actTotal = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
    const transportTotal = expenses.filter(e => e.category === 'transport').reduce((sum, e) => sum + (e.amount || 0), 0);
    const stayTotal = expenses.filter(e => e.category === 'accommodation').reduce((sum, e) => sum + (e.amount || 0), 0);
    const mealsTotal = expenses.filter(e => e.category === 'meals').reduce((sum, e) => sum + (e.amount || 0), 0);
    const otherTotal = expenses.filter(e => e.category === 'other').reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalSpending = actTotal + transportTotal + stayTotal + mealsTotal + otherTotal;

    // Daily spending map
    const dailyMap = {};
    activities.forEach(a => {
      if (a.date) {
        dailyMap[a.date] = (dailyMap[a.date] || 0) + (a.cost || 0);
      }
    });
    expenses.forEach(e => {
      if (e.date) {
        dailyMap[e.date] = (dailyMap[e.date] || 0) + (e.amount || 0);
      }
    });

    const dailySpendingArray = Object.keys(dailyMap).sort().map(date => ({
      date,
      amount: dailyMap[date]
    }));

    // Daily budget target calculation (total budget divided by trip total days)
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
    const dailyBudget = trip.budget > 0 ? (trip.budget / totalDays) : 0;

    let highestSpendingDay = null;
    let highestAmount = 0;
    const overBudgetDays = [];

    dailySpendingArray.forEach(item => {
      if (item.amount > highestAmount) {
        highestAmount = item.amount;
        highestSpendingDay = item;
      }
      if (dailyBudget > 0 && item.amount > dailyBudget) {
        overBudgetDays.push({
          date: item.date,
          amount: item.amount,
          exceededBy: item.amount - dailyBudget
        });
      }
    });

    const avgCostPerDay = totalDays > 0 ? (totalSpending / totalDays) : 0;
    const remainingBudget = (trip.budget || 0) - totalSpending;
    const isOverBudget = totalSpending > (trip.budget || 0) && trip.budget > 0;

    return res.json({
      tripId: trip.id,
      tripName: trip.name,
      plannedBudget: trip.budget || 0,
      totalSpending,
      remainingBudget,
      isOverBudget,
      overBudgetAmount: isOverBudget ? totalSpending - trip.budget : 0,
      dailyBudget: Math.round(dailyBudget * 100) / 100,
      totalDays,
      avgCostPerDay: Math.round(avgCostPerDay * 100) / 100,
      highestSpendingDay,
      overBudgetDays,
      breakdown: [
        { category: 'Activities', amount: actTotal, color: '#3B82F6' },
        { category: 'Transport', amount: transportTotal, color: '#10B981' },
        { category: 'Stay', amount: stayTotal, color: '#F59E0B' },
        { category: 'Meals', amount: mealsTotal, color: '#EF4444' },
        { category: 'Other', amount: otherTotal, color: '#8B5CF6' }
      ],
      dailySpending: dailySpendingArray,
      expenses
    });
  } catch (err) {
    console.error('getTripBudget error:', err);
    return res.status(500).json({ error: 'Failed to calculate trip budget.' });
  }
}

export function addExpense(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params; // trip_id
    const { category, amount, description, date } = req.body;

    const trip = db.prepare('SELECT user_id FROM trips WHERE id = ?').get(id);
    if (!trip || trip.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (!category || !amount) {
      return res.status(400).json({ error: 'Category and amount are required.' });
    }

    const info = db.prepare(`
      INSERT INTO expenses (trip_id, category, amount, description, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, category, parseFloat(amount), description || '', date || new Date().toISOString().split('T')[0]);

    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ message: 'Expense added successfully!', expense: newExpense });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add expense.' });
  }
}

export function deleteExpense(req, res) {
  try {
    const userId = req.user.id;
    const { expenseId } = req.params;

    const expense = db.prepare(`
      SELECT e.*, t.user_id 
      FROM expenses e 
      JOIN trips t ON e.trip_id = t.id 
      WHERE e.id = ?
    `).get(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }
    if (expense.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(expenseId);
    return res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete expense.' });
  }
}
