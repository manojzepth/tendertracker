// tests/auth.test.js
import request from 'supertest';
import app from '../src/index.js'; // Adjust path as necessary, assuming src/index.js exports the app
import pool from '../src/config/dbConfig.js'; // Adjust path as necessary

// IMPORTANT: Test Database Configuration Note
// For robust testing, it's crucial to use a separate test database.
// These tests currently run against the development database defined in dbConfig.js.
// In a production setup, you would configure Jest or use environment variables
// to point to a different database for testing, and implement a mechanism
// (e.g., running migrations, truncating tables) to reset this test database
// before or between test suites/tests.

describe('Auth Endpoints', () => {
  // Define test user credentials
  const testUserEmail = 'testuser@test.com';
  const testUserPassword = 'password123';
  const loginTestUserEmail = 'loginuser@test.com';
  const loginTestUserPassword = 'password123';

  beforeAll(async () => {
    // Clean up before all tests in this suite
    // Delete in reverse order of creation or due to foreign key constraints
    try {
      await pool.query("DELETE FROM items WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com')");
      await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
      
      // Pre-register a user for login tests to ensure it exists
      await request(app)
        .post('/api/auth/register')
        .send({
          email: loginTestUserEmail,
          password: loginTestUserPassword
        });
    } catch (error) {
      console.error("Error during beforeAll cleanup/setup:", error);
      // It's critical to handle errors here, or tests might run in an inconsistent state
      // For simplicity, we log it. In a real setup, you might want to throw or exit.
    }
  });

  afterAll(async () => {
    // Clean up after all tests in this suite
    try {
      await pool.query("DELETE FROM items WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com')");
      await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    } catch (error) {
      console.error("Error during afterAll cleanup:", error);
    }
    await pool.end(); // Close the database connection pool
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUserEmail, // Use a unique email for this test
          password: testUserPassword
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully. Please login.');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toEqual(testUserEmail);
    });

    it('should return 409 Conflict when trying to register with an existing email', async () => {
      // This user (loginTestUserEmail) is pre-registered in beforeAll
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: loginTestUserEmail, 
          password: testUserPassword 
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'User already exists with this email.');
    });

    it('should return 400 Bad Request when registering with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          // email: "missingemail@test.com",
          password: testUserPassword
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email and password are required.');
    });

    it('should return 400 Bad Request when registering with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: "anotheruser@test.com",
          // password: "missingpassword"
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email and password are required.');
    });

     it('should return 400 Bad Request for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalidemail', password: 'password123' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid email format.');
    });

    it('should return 400 Bad Request for password less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'shortpass@test.com', password: '123' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Password must be at least 6 characters long.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginTestUserEmail, // User pre-registered in beforeAll
          password: loginTestUserPassword
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('message', 'Login successful.');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toEqual(loginTestUserEmail);
    });

    it('should return 401 Unauthorized for login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginTestUserEmail,
          password: 'wrongpassword'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Login failed. Invalid credentials.');
    });

    it('should return 401 Unauthorized for login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nosuchuser@test.com',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Login failed. Invalid credentials.');
    });

    it('should return 400 Bad Request for login with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          // email: loginTestUserEmail,
          password: loginTestUserPassword
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email and password are required.');
    });

    it('should return 400 Bad Request for login with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginTestUserEmail,
          // password: loginTestUserPassword
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email and password are required.');
    });
  });
});
