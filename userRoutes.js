import express from 'express';
import { updateProfile, getSavedDestinations, toggleSaveDestination, deleteAccount } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.put('/profile', updateProfile);
router.get('/saved', getSavedDestinations);
router.post('/saved', toggleSaveDestination);
router.delete('/account', deleteAccount);

export default router;
