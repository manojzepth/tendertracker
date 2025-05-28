import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig.js'; // Import JWT config
import pool from '../config/dbConfig.js'; // Import DB pool

// Basic email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // User Existence Check
    const existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User Creation
    const newUserResult = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at, updated_at',
      [email, hashedPassword]
    );
    const newUser = newUserResult.rows[0];

    res.status(201).json({
      message: 'User registered successfully. Please login.',
      user: {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      }
    });

  } catch (error) {
    console.error('Error during registration:', error);
    // Check for specific PostgreSQL errors if needed, e.g., unique constraint violation
    // if (error.code === '23505' && error.constraint === 'users_email_key') {
    //   return res.status(409).json({ message: 'User already exists with this email.' });
    // }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // User Retrieval
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Login failed. Invalid credentials.' });
    }
    const user = userResult.rows[0];

    // Password Comparison
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Login failed. Invalid credentials.' });
    }

    // JWT Generation
    const payload = {
      userId: user.id, // Use actual user ID from DB
      email: user.email,
    };

    jwt.sign(
      payload,
      jwtConfig.secret, // Use secret from config
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          return res.status(500).json({ message: 'Error generating token.' });
        }
        res.status(200).json({
          message: 'Login successful.',
          token: token,
          user: {
            id: user.id,
            email: user.email
          }
        });
      }
    );

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
