import express from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import { validatePhotoUpload } from '../middleware/validation.js';
import {
  getDefaultPhotos,
  getUserPhotos,
  addPhoto,
  findPhotoById,
  deletePhoto
} from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/photos
 * Get all default/public puppy photos
 * Public endpoint - no authentication required
 */
router.get('/', async (req, res) => {
  try {
    const photos = await getDefaultPhotos();

    // Remove userId from response for security
    const publicPhotos = photos.map(({ userId, ...photo }) => photo);

    res.json({
      success: true,
      photos: publicPhotos
    });
  } catch (error) {
    console.error('Error fetching default photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch default photos',
      statusCode: 500
    });
  }
});

/**
 * GET /api/photos/my-photos
 * Get photos belonging to authenticated user
 * Protected endpoint - requires authentication
 */
router.get('/my-photos', authMiddleware, async (req, res) => {
  try {
    const photos = await getUserPhotos(req.user.id);

    res.json({
      success: true,
      photos: photos
    });
  } catch (error) {
    console.error('Error fetching user photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user photos',
      statusCode: 500
    });
  }
});

/**
 * POST /api/photos/upload
 * Upload new photo for authenticated user
 * Protected endpoint - requires authentication
 */
router.post('/upload', authMiddleware, validatePhotoUpload, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    // Create new photo object
    const newPhoto = {
      id: crypto.randomUUID(),
      title,
      description: description || '',
      imageUrl,
      userId: req.user.id,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const photo = await addPhoto(newPhoto);

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo',
      statusCode: 500
    });
  }
});

/**
 * DELETE /api/photos/:id
 * Delete user's photo
 * Protected endpoint - requires authentication
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const photoId = req.params.id;

    // Find photo by ID
    const photo = await findPhotoById(photoId);

    // Check if photo exists
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        statusCode: 404
      });
    }

    // Check if photo is a default photo
    if (photo.isDefault) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete default photos',
        statusCode: 403
      });
    }

    // Check if photo belongs to authenticated user
    if (photo.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this photo',
        statusCode: 403
      });
    }

    // Delete photo
    const deleted = await deletePhoto(photoId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete photo',
        statusCode: 500
      });
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo',
      statusCode: 500
    });
  }
});

export default router;
