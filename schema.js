import db from '../config/database.js';

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_image TEXT,
      language TEXT DEFAULT 'English',
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT,
      image TEXT,
      cost_index TEXT CHECK(cost_index IN ('$', '$$', '$$$', '$$$$')) DEFAULT '$$',
      popularity INTEGER DEFAULT 80
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      cover_image TEXT,
      budget REAL DEFAULT 0,
      is_public INTEGER DEFAULT 0,
      share_token TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trip_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      arrival_date TEXT NOT NULL,
      departure_date TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT CHECK(category IN ('Sightseeing', 'Food', 'Adventure', 'Shopping', 'Culture', 'Nature', 'Entertainment', 'Nightlife')) DEFAULT 'Sightseeing',
      duration INTEGER DEFAULT 60, -- in minutes
      estimated_cost REAL DEFAULT 0,
      rating REAL DEFAULT 4.5,
      image TEXT,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS itinerary_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_stop_id INTEGER NOT NULL,
      activity_id INTEGER,
      title TEXT,
      date TEXT NOT NULL,
      start_time TEXT DEFAULT '09:00',
      duration INTEGER DEFAULT 60, -- in minutes
      cost REAL DEFAULT 0,
      notes TEXT,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (trip_stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT CHECK(category IN ('transport', 'accommodation', 'activities', 'meals', 'other')) DEFAULT 'other',
      amount REAL NOT NULL,
      description TEXT,
      date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, city_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    );
  `);

  console.log('Database tables initialized successfully.');
}
