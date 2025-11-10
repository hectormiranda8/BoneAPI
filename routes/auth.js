import express from 'express';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateToken } from '../utils/jwt.js';
import { upload } from '../middleware/upload.js';
import { optimizeImage, deleteFile } from '../utils/imageOptimizer.js';
import {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  addUser,
  updateUser
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
      displayName: username,
      bio: '',
      avatarUrl: null,
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
        email: newUser.email,
        displayName: newUser.displayName,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl
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
    // If input contains '@', treat as email, otherwise as username
    let user;
    let identifier = email || username;

    if (identifier) {
      if (identifier.includes('@')) {
        user = await findUserByEmail(identifier);
      } else {
        user = await findUserByUsername(identifier);
      }
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
        email: user.email,
        displayName: user.displayName || user.username,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || null
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
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      statusCode: 500
    });
  }
});

/**
 * GET /api/auth/profile/:userId
 * Get user profile by ID (public info only)
 * Public endpoint
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await findUserById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    // Return public info only
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      statusCode: 500
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update own profile (requires auth)
 * Protected route - requires valid JWT token
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, bio } = req.body;
    const userId = req.user.id;

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    // Update user profile
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio.substring(0, 500); // Max 500 chars

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        statusCode: 500
      });
    }

    // Return updated user without password
    const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      statusCode: 500
    });
  }
});

/**
 * POST /api/auth/avatar
 * Upload avatar (requires auth)
 * Protected route - requires valid JWT token
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Avatar file is required',
        statusCode: 400
      });
    }

    const userId = req.user.id;
    const user = await findUserById(userId);

    if (!user) {
      deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    // Delete old avatar if exists
    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const oldPath = path.join('public', user.avatarUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Optimize avatar (300x300 square)
    const filename = `${userId}-${Date.now()}.webp`;
    const outputPath = path.join('public', 'uploads', 'avatars', filename);

    await optimizeImage(req.file.path, outputPath, { width: 300, height: 300, fit: 'cover' });

    // Delete original uploaded file
    deleteFile(req.file.path);

    const avatarUrl = `/uploads/avatars/${filename}`;
    const updatedUser = await updateUser(userId, { avatarUrl });

    if (!updatedUser) {
      deleteFile(outputPath);
      return res.status(500).json({
        success: false,
        error: 'Failed to update avatar',
        statusCode: 500
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar',
      statusCode: 500
    });
  }
});

export default router;
