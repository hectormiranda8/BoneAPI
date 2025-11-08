import express from 'express';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateToken } from '../utils/jwt.js';
import {
  findUserByEmail,
  findUserByUsername,
  addUser
} from '../utils/db.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists by email
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists',
        statusCode: 409
      });
    }

    // Check if user already exists by username
    const existingUserByUsername = await findUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        error: 'A user with this username already exists',
        statusCode: 409
      });
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = {
      id: randomUUID(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user to database
    await addUser(newUser);

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Return success response (exclude password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Find user by email or username
    let user;
    if (email) {
      user = await findUserByEmail(email);
    } else if (username) {
      user = await findUserByUsername(username);
    }

    // If user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please check your credentials.',
        statusCode: 404
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please check your password.',
        statusCode: 401
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return success response (exclude password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side operation)
 * JWT is stateless, so actual logout is handled by removing token on client
 */
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Protected route - requires valid JWT token
 */
router.get('/me', authMiddleware, (req, res) => {
  // req.user is populated by authMiddleware
  res.status(200).json({
    success: true,
    user: req.user
  });
});

export default router;
