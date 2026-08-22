import db from '../config/database.js';
import bcrypt from 'bcryptjs';

export function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding initial data...');

  const passwordHash = bcrypt.hashSync('Password123!', 10);

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, profile_image, language, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'Alex Traveler',
    'alex@globetrotter.com',
    passwordHash,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'English',
    'user'
  );

  insertUser.run(
    'Admin User',
    'admin@globetrotter.com',
    passwordHash,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'English',
    'admin'
  );

  // 2. Cities
  const cities = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      description: 'The City of Light boasts world-class art, culinary magic, iconic landmarks, and romantic charm.',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$$',
      popularity: 98
    },
    {
      name: 'London',
      country: 'United Kingdom',
      region: 'Europe',
      description: 'Dynamic capital blending royal history, vibrant theatre, diverse cuisine, and iconic red buses.',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$$',
      popularity: 96
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      description: 'Eternal city of ancient gladiators, Renaissance marvels, cozy trattorias, and espresso bars.',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$',
      popularity: 95
    },
    {
      name: 'Zurich',
      country: 'Switzerland',
      region: 'Europe',
      description: 'Pristine lakeside hub offering alpine views, luxury boutique shopping, and decadent Swiss chocolate.',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$$$',
      popularity: 92
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      description: 'Futuristic metropolis where neon skyscrapers meet tranquil Shinto shrines and legendary sushi bars.',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$$',
      popularity: 99
    },
    {
      name: 'Singapore',
      country: 'Singapore',
      region: 'Asia',
      description: 'Garden city with supertrees, hawker food havens, luxury marina views, and futuristic architecture.',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$$',
      popularity: 94
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      description: 'Oasis of luxury featuring record-breaking skyscrapers, desert safaris, and high-end shopping malls.',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$$$',
      popularity: 97
    },
    {
      name: 'New York',
      country: 'United States',
      region: 'North America',
      description: 'The city that never sleeps: Broadway theatre, iconic skyline, Central Park, and endless culture.',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$$$$',
      popularity: 97
    },
    {
      name: 'Mumbai',
      country: 'India',
      region: 'Asia',
      description: 'City of Dreams, Bollywood glamour, colonial sea views, and legendary street food markets.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$',
      popularity: 90
    },
    {
      name: 'Delhi',
      country: 'India',
      region: 'Asia',
      description: 'Historic heartland showcasing Mughal forts, bustling bazaars, tranquil gardens, and rich heritage.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$',
      popularity: 88
    },
    {
      name: 'Ahmedabad',
      country: 'India',
      region: 'Asia',
      description: 'India’s first UNESCO World Heritage City, famous for Sabarmati Ashram, stepwells, and street food.',
      image: 'https://images.unsplash.com/photo-1609946850383-74b7794931a7?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$',
      popularity: 85
    },
    {
      name: 'Bangkok',
      country: 'Thailand',
      region: 'Asia',
      description: 'Vibrant Thai capital known for ornate shrines, floating markets, rooftop bars, and street dining.',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80',
      cost_index: '$',
      popularity: 93
    }
  ];

  const insertCity = db.prepare(`
    INSERT INTO cities (name, country, region, description, image, cost_index, popularity)
    VALUES (@name, @country, @region, @description, @image, @cost_index, @popularity)
  `);

  const cityMap = {};
  for (const c of cities) {
    const info = insertCity.run(c);
    cityMap[c.name] = info.lastInsertRowid;
  }

  // 3. Activities
  const activities = [
    // Paris
    { city: 'Paris', name: 'Eiffel Tower Summit Access', category: 'Sightseeing', duration: 120, estimated_cost: 30, rating: 4.8, description: 'Ascend to the top of Paris for breathtaking panoramic views of the entire city.' },
    { city: 'Paris', name: 'Louvre Museum Guided Tour', category: 'Culture', duration: 180, estimated_cost: 45, rating: 4.9, description: 'Explore world-famous masterpieces like the Mona Lisa and Venus de Milo with an expert guide.' },
    { city: 'Paris', name: 'Seine River Sunset Dinner Cruise', category: 'Food', duration: 150, estimated_cost: 85, rating: 4.7, description: 'Gourmet 3-course French dining while floating past illuminated monuments.' },
    { city: 'Paris', name: 'Montmartre & Sacré-Cœur Stroll', category: 'Culture', duration: 90, estimated_cost: 0, rating: 4.6, description: 'Wander artist cobblestone alleys and enjoy scenic hilltop city views.' },

    // London
    { city: 'London', name: 'Tower of London & Crown Jewels', category: 'Culture', duration: 150, estimated_cost: 35, rating: 4.7, description: 'Discover 900 years of royal history, medieval armor, and sparkling crown jewels.' },
    { city: 'London', name: 'West End Theatre Show', category: 'Entertainment', duration: 160, estimated_cost: 65, rating: 4.8, description: 'Catch an award-winning musical or play in London’s iconic theatre district.' },
    { city: 'London', name: 'Borough Market Food Tour', category: 'Food', duration: 90, estimated_cost: 25, rating: 4.9, description: 'Sample artisanal cheeses, gourmet pastries, and hot street food.' },

    // Rome
    { city: 'Rome', name: 'Colosseum & Roman Forum VIP Access', category: 'Sightseeing', duration: 180, estimated_cost: 50, rating: 4.9, description: 'Walk through ancient gladiatorial arenas and ruins of Roman emperors.' },
    { city: 'Rome', name: 'Vatican Museums & Sistine Chapel', category: 'Culture', duration: 210, estimated_cost: 40, rating: 4.9, description: 'Marvel at Michelangelo’s famous ceiling frescoes and sacred art collections.' },
    { city: 'Rome', name: 'Traditional Pasta Making Class', category: 'Food', duration: 120, estimated_cost: 60, rating: 4.8, description: 'Hand-make fresh fettuccine and tiramisu under the guidance of an Italian chef.' },

    // Zurich
    { city: 'Zurich', name: 'Lake Zurich Scenic Steamboat Cruise', category: 'Nature', duration: 90, estimated_cost: 30, rating: 4.7, description: 'Glide across crystal-clear alpine waters surrounded by snow-capped peaks.' },
    { city: 'Zurich', name: 'Lindt Home of Chocolate Tasting', category: 'Food', duration: 120, estimated_cost: 20, rating: 4.8, description: 'Marvel at the world’s largest chocolate fountain and indulge in unlimited tastings.' },

    // Tokyo
    { city: 'Tokyo', name: 'Senso-ji Temple & Asakusa Walking', category: 'Culture', duration: 90, estimated_cost: 0, rating: 4.8, description: 'Immerse in Tokyo’s oldest Buddhist temple and traditional Nakamise shopping street.' },
    { city: 'Tokyo', name: 'Shibuya Crossing & Rooftop Observatory', category: 'Sightseeing', duration: 60, estimated_cost: 18, rating: 4.9, description: 'Experience the world’s busiest pedestrian intersection from high above.' },
    { city: 'Tokyo', name: 'Tsukiji Outer Market Omakase Sushi', category: 'Food', duration: 90, estimated_cost: 70, rating: 4.9, description: 'Taste ultra-fresh sashimi and wagyu skewers prepared right before your eyes.' },

    // Singapore
    { city: 'Singapore', name: 'Gardens by the Bay Supertree Light Show', category: 'Nature', duration: 120, estimated_cost: 22, rating: 4.9, description: 'Witness futuristic vertical gardens illuminated in sync with classical symphonies.' },
    { city: 'Singapore', name: 'Marina Bay Sands Skypark Deck', category: 'Sightseeing', duration: 60, estimated_cost: 26, rating: 4.7, description: '360-degree skyline views 57 levels above Singapore harbor.' },

    // Dubai
    { city: 'Dubai', name: 'Burj Khalifa 124th & 125th Floor', category: 'Sightseeing', duration: 90, estimated_cost: 45, rating: 4.8, description: 'Stand atop the world’s tallest building overlooking the Arabian Gulf.' },
    { city: 'Dubai', name: '4x4 Desert Safari & Bedouin BBQ', category: 'Adventure', duration: 300, estimated_cost: 75, rating: 4.9, description: 'Dune bashing, camel rides, falconry, henna painting, and starlit BBQ banquet.' },

    // New York
    { city: 'New York', name: 'Statue of Liberty & Ellis Island', category: 'Sightseeing', duration: 180, estimated_cost: 25, rating: 4.7, description: 'Ferry trip to America’s legendary monument of freedom and immigrant history.' },
    { city: 'New York', name: 'Central Park Bike & Picnic', category: 'Nature', duration: 120, estimated_cost: 20, rating: 4.8, description: 'Cycle past Bethesda Terrace, Strawberry Fields, and scenic lakes.' },

    // Mumbai
    { city: 'Mumbai', name: 'Gateway of India & Taj Mahal Palace', category: 'Sightseeing', duration: 60, estimated_cost: 0, rating: 4.8, description: 'Iconic waterfront monument overlooking the Arabian Sea.' },
    { city: 'Mumbai', name: 'Marine Drive Sunset & Street Food Tour', category: 'Food', duration: 120, estimated_cost: 15, rating: 4.7, description: 'Enjoy pav bhaji and bhel puri along the Queen’s Necklace shoreline.' },

    // Delhi
    { city: 'Delhi', name: 'Red Fort & Chandni Chowk Rickshaw Ride', category: 'Culture', duration: 150, estimated_cost: 10, rating: 4.7, description: 'Thrilling rickshaw maze through spice markets and Mughal ramparts.' },
    { city: 'Delhi', name: 'Qutub Minar Complex Exploration', category: 'Culture', duration: 90, estimated_cost: 8, rating: 4.6, description: 'Marvel at the 73-meter medieval minaret and ancient iron pillar.' },

    // Ahmedabad
    { city: 'Ahmedabad', name: 'Sabarmati Ashram Peace Stroll', category: 'Culture', duration: 90, estimated_cost: 0, rating: 4.9, description: 'Historical headquarters of Mahatma Gandhi set beside the peaceful river.' },
    { city: 'Ahmedabad', name: 'Adalaj Stepwell Architectural Tour', category: 'Sightseeing', duration: 75, estimated_cost: 5, rating: 4.8, description: 'Intricately carved 5-story subterranean stepwell dating back to 1498.' },
    { city: 'Ahmedabad', name: 'Manek Chowk Night Food Market', category: 'Nightlife', duration: 120, estimated_cost: 12, rating: 4.8, description: 'Bustling night square transforming into a food paradise featuring chocolate sandwiches and kulfi.' },

    // Bangkok
    { city: 'Bangkok', name: 'Grand Palace & Emerald Buddha', category: 'Culture', duration: 150, estimated_cost: 16, rating: 4.8, description: 'Spectacular complex of golden pagodas and sacred Thai temples.' },
    { city: 'Bangkok', name: 'Chao Phraya River Longtail Boat Tour', category: 'Adventure', duration: 90, estimated_cost: 20, rating: 4.7, description: 'Navigate canal ways (klongs) seeing traditional stilt houses and floating temples.' }
  ];

  const insertActivity = db.prepare(`
    INSERT INTO activities (city_id, name, description, category, duration, estimated_cost, rating, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const act of activities) {
    const cityId = cityMap[act.city];
    if (cityId) {
      insertActivity.run(
        cityId,
        act.name,
        act.description,
        act.category,
        act.duration,
        act.estimated_cost,
        act.rating,
        `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80`
      );
    }
  }

  // 4. Sample Trip for Alex Traveler
  const insertTrip = db.prepare(`
    INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public, share_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tripInfo = insertTrip.run(
    1, // Alex
    'Grand Europe Adventure 2026',
    'Exploring the highlights of France, Switzerland, and Italy with art, cuisine, and mountain views.',
    '2026-09-10',
    '2026-09-22',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    2500,
    1,
    'europe-adventure-token-2026'
  );

  const tripId = tripInfo.lastInsertRowid;

  // Add Stops
  const insertStop = db.prepare(`
    INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, position)
    VALUES (?, ?, ?, ?, ?)
  `);

  const stopParis = insertStop.run(tripId, cityMap['Paris'], '2026-09-10', '2026-09-14', 1).lastInsertRowid;
  const stopZurich = insertStop.run(tripId, cityMap['Zurich'], '2026-09-14', '2026-09-18', 2).lastInsertRowid;
  const stopRome = insertStop.run(tripId, cityMap['Rome'], '2026-09-18', '2026-09-22', 3).lastInsertRowid;

  // Add Itinerary Activities
  const insertItineraryAct = db.prepare(`
    INSERT INTO itinerary_activities (trip_stop_id, activity_id, title, date, start_time, duration, cost, notes, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Paris itinerary
  insertItineraryAct.run(stopParis, 1, 'Eiffel Tower Summit Access', '2026-09-10', '10:00', 120, 30, 'Pre-booked elevator ticket', 1);
  insertItineraryAct.run(stopParis, 3, 'Seine River Sunset Dinner Cruise', '2026-09-10', '19:00', 150, 85, 'Smart casual dress code', 2);
  insertItineraryAct.run(stopParis, 2, 'Louvre Museum Guided Tour', '2026-09-11', '09:30', 180, 45, 'Mona Lisa morning slot', 1);

  // Zurich itinerary
  insertItineraryAct.run(stopZurich, 11, 'Lindt Home of Chocolate Tasting', '2026-09-15', '11:00', 120, 20, 'Chocolate fountain photo spot', 1);
  insertItineraryAct.run(stopZurich, 10, 'Lake Zurich Scenic Steamboat Cruise', '2026-09-16', '14:00', 90, 30, 'Take upper deck seats', 1);

  // Rome itinerary
  insertItineraryAct.run(stopRome, 8, 'Colosseum & Roman Forum VIP Access', '2026-09-19', '09:00', 180, 50, 'Wear comfortable walking shoes', 1);
  insertItineraryAct.run(stopRome, 10, 'Traditional Pasta Making Class', '2026-09-20', '17:00', 120, 60, 'Wine & tiramisu included', 1);

  // Expenses for Trip
  const insertExpense = db.prepare(`
    INSERT INTO expenses (trip_id, category, amount, description, date)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertExpense.run(tripId, 'transport', 450, 'Flight Paris to Zurich & Train to Rome', '2026-09-10');
  insertExpense.run(tripId, 'accommodation', 900, 'Boutique hotels & Airbnb stays', '2026-09-10');
  insertExpense.run(tripId, 'meals', 400, 'Estimated food allowance', '2026-09-10');
  insertExpense.run(tripId, 'other', 100, 'Travel insurance & SIM cards', '2026-09-10');

  // Saved Destinations
  const insertSaved = db.prepare(`
    INSERT INTO saved_destinations (user_id, city_id)
    VALUES (?, ?)
  `);
  insertSaved.run(1, cityMap['Tokyo']);
  insertSaved.run(1, cityMap['Paris']);
  insertSaved.run(1, cityMap['Ahmedabad']);

  console.log('Seed completed successfully!');
}
