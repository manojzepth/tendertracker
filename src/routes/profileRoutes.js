import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Import protect middleware
import { getMe } from '../controllers/profileController.js'; // Import getMe controller

const router = express.Router();

// Define GET /me route, protected by 'protect' middleware
router.get('/me', protect, getMe);

export default router;
