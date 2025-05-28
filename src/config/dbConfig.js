// src/config/dbConfig.js
import pkg from 'pg';
const { Pool } = pkg;

// IMPORTANT:
// These are placeholder database connection parameters for local development.
// You MUST update these with your actual local PostgreSQL credentials and desired database name.
// Consider using environment variables for these settings in a production environment.

const dbConfigParams = {
  user: process.env.DB_USER || 'postgres', // Default: 'postgres'
  host: process.env.DB_HOST || 'localhost',   // Default: 'localhost'
  database: process.env.DB_NAME || 'app_db',    // Choose a database name, e.g., 'app_db'
  password: process.env.DB_PASSWORD || 'your_local_postgres_password', // Replace with your local DB password
  port: process.env.DB_PORT || 5432,        // Default PostgreSQL port
};

const pool = new Pool(dbConfigParams);

// Optional: Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client for initial connection test:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release the client back to the pool
    if (err) {
      return console.error('Error executing query for initial connection test:', err.stack);
    }
    console.log('Database connected successfully:', result.rows[0].now);
  });
});

// Export the pool for querying
export default pool;

// For reference, you can also export the config if needed elsewhere, though often just the pool is sufficient.
// export { dbConfigParams };
