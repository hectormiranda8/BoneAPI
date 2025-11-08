import { verifyToken } from '../utils/jwt.js';
import { findUserById } from '../utils/db.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Authorization header must be in format: Bearer <token>',
        statusCode: 401
      });
    }

    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          error: 'Token has expired. Please log in again.',
          statusCode: 403
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please log in again.',
        statusCode: 401
      });
    }

    // Find user by ID from token
    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found. Token may be invalid.',
        statusCode: 401
      });
    }

    // Attach user to request object (exclude password)
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error occurred',
      statusCode: 500
    });
  }
}
