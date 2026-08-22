import express from 'express';
import { addItineraryActivity, updateItineraryActivity, deleteItineraryActivity } from '../controllers/itineraryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', addItineraryActivity);
router.put('/:id', updateItineraryActivity);
router.delete('/:id', deleteItineraryActivity);

export default router;
