import db from '../config/database.js';
import bcrypt from 'bcryptjs';

export function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, language, profile_image, currentPassword, newPassword } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let password_hash = user.password_hash;
    if (newPassword) {
      if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password_hash)) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
      password_hash = bcrypt.hashSync(newPassword, 10);
    }

    db.prepare(`
      UPDATE users 
      SET name = ?, language = ?, profile_image = ?, password_hash = ?
      WHERE id = ?
    `).run(
      name || user.name,
      language || user.language,
      profile_image || user.profile_image,
      password_hash,
      userId
    );

    const updated = db.prepare('SELECT id, name, email, profile_image, language, role, created_at FROM users WHERE id = ?').get(userId);
    return res.json({ message: 'Profile updated successfully!', user: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

export function getSavedDestinations(req, res) {
  try {
    const userId = req.user.id;
    const saved = db.prepare(`
      SELECT c.* 
      FROM saved_destinations sd 
      JOIN cities c ON sd.city_id = c.id 
      WHERE sd.user_id = ?
      ORDER BY sd.created_at DESC
    `).all(userId);

    return res.json(saved);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch saved destinations.' });
  }
}

export function toggleSaveDestination(req, res) {
  try {
    const userId = req.user.id;
    const { city_id } = req.body;

    if (!city_id) {
      return res.status(400).json({ error: 'City ID is required.' });
    }

    const existing = db.prepare('SELECT id FROM saved_destinations WHERE user_id = ? AND city_id = ?').get(userId, city_id);

    if (existing) {
      db.prepare('DELETE FROM saved_destinations WHERE id = ?').run(existing.id);
      return res.json({ message: 'Destination removed from saved list.', saved: false });
    } else {
      db.prepare('INSERT INTO saved_destinations (user_id, city_id) VALUES (?, ?)').run(userId, city_id);
      return res.json({ message: 'Destination saved to profile!', saved: true });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle saved destination.' });
  }
}

export function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete account.' });
  }
}
