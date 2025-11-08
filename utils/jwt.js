import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const TOKEN_EXPIRATION = '7d';

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's unique identifier
 * @returns {string} The generated JWT token
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Token has expired');
      expiredError.name = 'TokenExpiredError';
      throw expiredError;
    }
    throw new Error('Invalid token');
  }
}
