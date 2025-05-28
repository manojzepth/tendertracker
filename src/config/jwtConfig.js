// src/config/jwtConfig.js

// IMPORTANT:
// This is a placeholder JWT secret.
// You MUST change 'YOUR_SUPER_SECRET_KEY_REPLACE_THIS' to a strong, unique secret.
// It is highly recommended to manage this secret using environment variables
// (e.g., process.env.JWT_SECRET) in a production environment.

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY_REPLACE_THIS',
};

export default jwtConfig;
