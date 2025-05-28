import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig.js'; // Import JWT config

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, jwtConfig.secret); // Use secret from config

      // Attach user to request object (the payload of the JWT)
      // Assuming your JWT payload has a 'userId' and 'email' field, or a 'user' object.
      // Adjust based on how you structured the payload in loginUser.
      // For example, if payload was { userId: ..., email: ... }
      req.user = { id: decoded.userId, email: decoded.email }; 
      // If payload was { user: { id: ..., email: ... } } then req.user = decoded.user;

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token is not valid.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired.' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }
};
