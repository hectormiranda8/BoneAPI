import express from 'express';
import crypto from 'crypto';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { validatePhotoUpload } from '../middleware/validation.js';
import {
  getDefaultPhotos,
  getUserPhotos,
  addPhoto,
  findPhotoById,
  deletePhoto,
  updatePhoto,
  getPhotoLikeCount,
  isPhotoLikedByUser,
  addLike,
  removeLike,
  getUserLikes
} from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/photos
 * Get all default/public puppy photos
 * Public endpoint - optional authentication
 * Includes like counts and sorted by popularity
 */
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const photos = await getDefaultPhotos();
    const userId = req.user?.id;

    // Add like counts and isLiked status
    const photosWithLikes = await Promise.all(
      photos.map(async (photo) => {
        const likeCount = await getPhotoLikeCount(photo.id);
        const isLiked = userId ? await isPhotoLikedByUser(photo.id, userId) : false;
        const { userId: photoUserId, ...publicPhoto } = photo;
        return {
          ...publicPhoto,
          likeCount,
          isLiked
        };
      })
    );

    // Sort by like count (most popular first)
    const sortedPhotos = photosWithLikes.sort((a, b) => b.likeCount - a.likeCount);

    res.json({
      success: true,
      photos: sortedPhotos
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
 * GET /api/photos/liked
 * Get photos liked by authenticated user
 * Protected endpoint - requires authentication
 */
router.get('/liked', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userLikes = await getUserLikes(userId);
    const photos = await getDefaultPhotos();

    // Get photos that user has liked
    const likedPhotos = await Promise.all(
      userLikes.map(async (like) => {
        const photo = photos.find(p => p.id === like.photoId);
        if (!photo) return null;

        const likeCount = await getPhotoLikeCount(photo.id);
        const { userId: photoUserId, ...publicPhoto } = photo;

        return {
          ...publicPhoto,
          likeCount,
          isLiked: true
        };
      })
    );

    // Filter out null values (photos that were deleted)
    const validLikedPhotos = likedPhotos.filter(photo => photo !== null);

    res.json({
      success: true,
      photos: validLikedPhotos
    });
  } catch (error) {
    console.error('Error fetching liked photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch liked photos',
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

/**
 * POST /api/photos/:id/like
 * Like a photo
 * Protected endpoint - requires authentication
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user.id;

    // Check if photo exists
    const photo = await findPhotoById(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        statusCode: 404
      });
    }

    // Add like
    const like = await addLike(userId, photoId);

    if (!like) {
      return res.status(409).json({
        success: false,
        error: 'Photo already liked',
        statusCode: 409
      });
    }

    const likeCount = await getPhotoLikeCount(photoId);

    res.status(201).json({
      success: true,
      message: 'Photo liked successfully',
      likeCount
    });
  } catch (error) {
    console.error('Error liking photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like photo',
      statusCode: 500
    });
  }
});

/**
 * DELETE /api/photos/:id/like
 * Unlike a photo
 * Protected endpoint - requires authentication
 */
router.delete('/:id/like', authMiddleware, async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user.id;

    // Remove like
    const removed = await removeLike(userId, photoId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Like not found',
        statusCode: 404
      });
    }

    const likeCount = await getPhotoLikeCount(photoId);

    res.json({
      success: true,
      message: 'Photo unliked successfully',
      likeCount
    });
  } catch (error) {
    console.error('Error unliking photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike photo',
      statusCode: 500
    });
  }
});

/**
 * PATCH /api/photos/:id/visibility
 * Toggle photo visibility (public/private)
 * Protected endpoint - requires authentication
 */
router.patch('/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user.id;

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

    // Check if photo belongs to authenticated user
    if (photo.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to modify this photo',
        statusCode: 403
      });
    }

    // Toggle isDefault (public/private)
    const updatedPhoto = await updatePhoto(photoId, {
      isDefault: !photo.isDefault
    });

    if (!updatedPhoto) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update photo visibility',
        statusCode: 500
      });
    }

    res.json({
      success: true,
      message: 'Photo visibility updated successfully',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Error updating photo visibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update photo visibility',
      statusCode: 500
    });
  }
});

export default router;
