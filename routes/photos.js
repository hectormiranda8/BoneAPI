import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { validatePhotoUpload } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';
import { optimizeImage, deleteFile } from '../utils/imageOptimizer.js';
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
  getUserLikes,
  getPhotoCommentCount,
  getTags,
  getPopularTags,
  getPhotosByCategory,
  getPhotosByTag,
  addOrUpdateTag
} from '../utils/db.js';

const router = express.Router();

const VALID_CATEGORIES = [
  'puppies',
  'portraits',
  'action',
  'sleeping',
  'playing',
  'nature',
  'group',
  'other'
];

const normalizeTag = (tag) => {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30);
};

/**
 * GET /api/photos
 * Get all default/public puppy photos
 * Public endpoint - optional authentication
 * Includes like counts and sorted by popularity
 */
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    let photos = await getDefaultPhotos();
    const userId = req.user?.id;
    const { getUsers } = await import('../utils/db.js');
    const users = await getUsers();

    // Filter to only approved public photos
    photos = photos.filter(p => p.isDefault === true && p.status === 'approved');

    // Add like counts, comment counts, isLiked status, and user info
    const photosWithLikes = await Promise.all(
      photos.map(async (photo) => {
        const likeCount = await getPhotoLikeCount(photo.id);
        const commentCount = await getPhotoCommentCount(photo.id);
        const isLiked = userId ? await isPhotoLikedByUser(photo.id, userId) : false;
        const photoUser = users.find(u => u.id === photo.userId);

        const { userId: photoUserId, ...publicPhoto } = photo;
        return {
          ...publicPhoto,
          likeCount,
          commentCount,
          isLiked,
          user: photoUser ? {
            id: photoUser.id,
            username: photoUser.username,
            displayName: photoUser.displayName || photoUser.username,
            avatarUrl: photoUser.avatarUrl || null
          } : null
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
    const { getUsers } = await import('../utils/db.js');
    const users = await getUsers();

    // Get photos that user has liked
    const likedPhotos = await Promise.all(
      userLikes.map(async (like) => {
        const photo = photos.find(p => p.id === like.photoId);
        if (!photo) return null;

        const likeCount = await getPhotoLikeCount(photo.id);
        const commentCount = await getPhotoCommentCount(photo.id);
        const photoUser = users.find(u => u.id === photo.userId);
        const { userId: photoUserId, ...publicPhoto } = photo;

        return {
          ...publicPhoto,
          likeCount,
          commentCount,
          isLiked: true,
          user: photoUser ? {
            id: photoUser.id,
            username: photoUser.username,
            displayName: photoUser.displayName || photoUser.username,
            avatarUrl: photoUser.avatarUrl || null
          } : null
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
 * Supports both file upload and URL
 */
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    let imageUrl;
    const { title, description, category, tags } = req.body;

    // Validate title
    if (!title || title.trim() === '') {
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'Title is required',
        statusCode: 400
      });
    }

    if (req.file) {
      // File upload - optimize and save
      const webpFilename = path.basename(req.file.filename, path.extname(req.file.filename)) + '.webp';
      const outputPath = path.join(path.dirname(req.file.path), webpFilename);

      try {
        await optimizeImage(req.file.path, outputPath);
        imageUrl = `/uploads/${webpFilename}`;

        // Delete original if not webp
        if (req.file.path !== outputPath) {
          deleteFile(req.file.path);
        }
      } catch (error) {
        // Clean up on error
        deleteFile(req.file.path);
        deleteFile(outputPath);
        throw error;
      }
    } else {
      // URL upload
      imageUrl = req.body.imageUrl;

      if (!imageUrl || imageUrl.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Image URL or file is required',
          statusCode: 400
        });
      }
    }

    // Process category
    let photoCategory = 'puppies';
    if (category && VALID_CATEGORIES.includes(category)) {
      photoCategory = category;
    }

    // Process tags
    let photoTags = [];
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
      photoTags = tagsArray
        .map(normalizeTag)
        .filter(Boolean)
        .slice(0, 10);

      // Update tag counts
      for (const tag of photoTags) {
        await addOrUpdateTag(tag);
      }
    }

    // Create new photo object
    const newPhoto = {
      id: crypto.randomUUID(),
      title,
      description: description || '',
      imageUrl,
      userId: req.user.id,
      isDefault: false,
      status: 'private',
      category: photoCategory,
      tags: photoTags,
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

    // Delete uploaded file if it exists
    if (photo.imageUrl && photo.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(path.dirname(import.meta.url.replace('file:///', '')), '../public', photo.imageUrl);
      deleteFile(filePath);
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
    const { makePublic } = req.body;

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

    let updates = {};
    let message = '';

    if (makePublic) {
      // User wants to make photo public → set to pending for approval
      updates.status = 'pending';
      updates.isDefault = false;
      updates.updatedAt = new Date().toISOString();
      message = 'Photo submitted for approval';
    } else {
      // User wants to make photo private → immediate, no approval needed
      updates.status = 'private';
      updates.isDefault = false;
      updates.updatedAt = new Date().toISOString();
      message = 'Photo is now private';
    }

    const updatedPhoto = await updatePhoto(photoId, updates);

    if (!updatedPhoto) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update photo visibility',
        statusCode: 500
      });
    }

    res.json({
      success: true,
      message,
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

/**
 * PATCH /api/photos/:id
 * Update photo metadata (title, description, category, tags)
 * Protected endpoint - requires authentication
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user.id;
    const { title, description, category, tags } = req.body;

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

    const updates = {};

    if (title !== undefined) {
      updates.title = title.substring(0, 100);
    }

    if (description !== undefined) {
      updates.description = description.substring(0, 500);
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      updates.category = category;
    }

    if (tags && Array.isArray(tags)) {
      const normalizedTags = tags
        .map(normalizeTag)
        .filter(Boolean)
        .slice(0, 10);

      updates.tags = normalizedTags;

      // Update tag counts
      for (const tag of normalizedTags) {
        await addOrUpdateTag(tag);
      }
    }

    const updatedPhoto = await updatePhoto(photoId, updates);

    if (!updatedPhoto) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update photo',
        statusCode: 500
      });
    }

    res.json({
      success: true,
      message: 'Photo updated successfully',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update photo',
      statusCode: 500
    });
  }
});

/**
 * GET /api/photos/category/:category
 * Get photos by category
 * Public endpoint - optional authentication
 */
router.get('/category/:category', optionalAuthMiddleware, async (req, res) => {
  try {
    const { category } = req.params;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        statusCode: 400
      });
    }

    const photos = await getPhotosByCategory(category);
    const userId = req.user?.id;
    const { getUsers } = await import('../utils/db.js');
    const users = await getUsers();

    // Add like counts, comment counts, isLiked status, and user info
    const photosWithLikes = await Promise.all(
      photos.map(async (photo) => {
        const likeCount = await getPhotoLikeCount(photo.id);
        const commentCount = await getPhotoCommentCount(photo.id);
        const isLiked = userId ? await isPhotoLikedByUser(photo.id, userId) : false;
        const photoUser = users.find(u => u.id === photo.userId);

        const { userId: photoUserId, ...publicPhoto } = photo;
        return {
          ...publicPhoto,
          likeCount,
          commentCount,
          isLiked,
          user: photoUser ? {
            id: photoUser.id,
            username: photoUser.username,
            displayName: photoUser.displayName || photoUser.username,
            avatarUrl: photoUser.avatarUrl || null
          } : null
        };
      })
    );

    res.json({
      success: true,
      photos: photosWithLikes
    });
  } catch (error) {
    console.error('Error fetching photos by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos',
      statusCode: 500
    });
  }
});

/**
 * GET /api/photos/tag/:tag
 * Get photos by tag
 * Public endpoint - optional authentication
 */
router.get('/tag/:tag', optionalAuthMiddleware, async (req, res) => {
  try {
    const { tag } = req.params;
    const normalizedTag = normalizeTag(tag);

    if (!normalizedTag) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tag',
        statusCode: 400
      });
    }

    const photos = await getPhotosByTag(normalizedTag);
    const userId = req.user?.id;
    const { getUsers } = await import('../utils/db.js');
    const users = await getUsers();

    // Add like counts, comment counts, isLiked status, and user info
    const photosWithLikes = await Promise.all(
      photos.map(async (photo) => {
        const likeCount = await getPhotoLikeCount(photo.id);
        const commentCount = await getPhotoCommentCount(photo.id);
        const isLiked = userId ? await isPhotoLikedByUser(photo.id, userId) : false;
        const photoUser = users.find(u => u.id === photo.userId);

        const { userId: photoUserId, ...publicPhoto } = photo;
        return {
          ...publicPhoto,
          likeCount,
          commentCount,
          isLiked,
          user: photoUser ? {
            id: photoUser.id,
            username: photoUser.username,
            displayName: photoUser.displayName || photoUser.username,
            avatarUrl: photoUser.avatarUrl || null
          } : null
        };
      })
    );

    res.json({
      success: true,
      photos: photosWithLikes
    });
  } catch (error) {
    console.error('Error fetching photos by tag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos',
      statusCode: 500
    });
  }
});

/**
 * GET /api/tags
 * Get all tags with counts
 * Public endpoint
 */
router.get('/tags', async (req, res) => {
  try {
    const tags = await getTags();

    res.json({
      success: true,
      tags: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags',
      statusCode: 500
    });
  }
});

/**
 * GET /api/tags/popular
 * Get popular tags (top 20)
 * Public endpoint
 */
router.get('/tags/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const tags = await getPopularTags(limit);

    res.json({
      success: true,
      tags: tags
    });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular tags',
      statusCode: 500
    });
  }
});

export default router;
