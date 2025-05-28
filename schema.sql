-- schema.sql
--
-- This script creates the necessary database extensions, tables, and triggers
-- for the application.
--
-- To run this script:
-- 1. Make sure you have PostgreSQL installed and running.
-- 2. Create your database (e.g., 'app_db') if it doesn't exist:
--    CREATE DATABASE app_db;
-- 3. Connect to your database using psql:
--    psql -U your_postgres_user -d app_db
-- 4. Run this script using the \i command from within psql:
--    \i /path/to/this/schema.sql
--    (Replace your_postgres_user, app_db, and /path/to/this/schema.sql with your actual values)
--    Alternatively, from your terminal:
--    psql -U your_postgres_user -d app_db -f /path/to/this/schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on users row modification
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Optional: Add an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Grant permissions (if necessary, depending on your setup)
-- Example: GRANT ALL PRIVILEGES ON TABLE users TO your_app_user;

COMMENT ON TABLE users IS 'Stores user account information, including credentials.';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user (UUID).';
COMMENT ON COLUMN users.email IS 'User''s email address, used for login (must be unique).';
COMMENT ON COLUMN users.password_hash IS 'Hashed password for the user.';
COMMENT ON COLUMN users.created_at IS 'Timestamp of when the user account was created.';
COMMENT ON COLUMN users.updated_at IS 'Timestamp of when the user account was last updated.';

-- Create the items table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Link items to users
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to automatically update updated_at on items row modification
-- Reusing the same trigger_set_timestamp function as for the users table
CREATE TRIGGER set_items_timestamp
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Optional: Add an index on the user_id column for faster lookups of items by user
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);

COMMENT ON TABLE items IS 'Stores item information, linked to a user.';
COMMENT ON COLUMN items.id IS 'Unique identifier for the item (UUID).';
COMMENT ON COLUMN items.name IS 'Name of the item.';
COMMENT ON COLUMN items.description IS 'Detailed description of the item.';
COMMENT ON COLUMN items.user_id IS 'Foreign key referencing the user who owns this item.';
COMMENT ON COLUMN items.created_at IS 'Timestamp of when the item was created.';
COMMENT ON COLUMN items.updated_at IS 'Timestamp of when the item was last updated.';


-- End of schema.sql for users and items
-- You can verify the table structure with: \d users
-- And the trigger with: \d+ users (look for Triggers section)
-- And the function with: \df trigger_set_timestamp
-- For items: \d items and \d+ items
