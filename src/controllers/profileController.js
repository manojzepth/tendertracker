// src/controllers/profileController.js
import pool from '../config/dbConfig.js'; // Import DB pool for potential future use

export const getMe = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  if (!req.user || !req.user.id) {
    // This case should ideally not be reached if 'protect' middleware is correctly applied
    // and JWT always contains userId
    return res.status(401).json({ message: 'Not authorized, user data missing from token.' });
  }

  try {
    // For this example, we'll return the user information directly from req.user
    // In a real application, you might want to fetch fresh user data from the database
    // especially if roles or other sensitive info might have changed since token issuance.

    // Example of fetching fresh data (optional, commented out for this example):
    /*
    const userId = req.user.id;
    const userResult = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const currentUser = userResult.rows[0];
    */

    // For now, just send back the user data from the token (which includes id and email)
    const { id, email } = req.user; // Assuming 'id' and 'email' were in the JWT payload

    res.status(200).json({
      id: id,
      email: email,
      // Add any other non-sensitive user data you want to return
    });

  } catch (error) {
    console.error('Error in getMe controller:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};
