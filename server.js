import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/schema.js';
import { seedDatabase } from './database/seed.js';

import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import stopRoutes from './routes/stopRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Seed
initDatabase();
seedDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (placed before router mounts)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'GlobeTrotter API', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api', budgetRoutes);
app.use('/api', shareRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`🌍 GlobeTrotter Backend Server running on http://localhost:${PORT}`);
});
