import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js'; // Import loginUser

const router = express.Router();

// POST /auth/register route
router.post('/register', registerUser);

// POST /auth/login route
router.post('/login', loginUser); // Use loginUser controller

export default router;
