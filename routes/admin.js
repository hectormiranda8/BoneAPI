import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import {
  getPhotos,
  getUsers,
  updatePhoto,
  updateUser,
  deletePhoto,
  deleteComment,
  findCommentById,
  getPhotoLikeCount,
  getPhotoCommentCount
} from '../utils/db.js';

const router = express.Router();

router.get('/pending-photos', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allPhotos = await getPhotos();
    const pendingPhotos = allPhotos.filter(p => p.status === 'pending');

    const { getUsers } = await import('../utils/db.js');
    const users = await getUsers();

    const photosWithDetails = await Promise.all(
      pendingPhotos.map(async (photo) => {
        const likeCount = await getPhotoLikeCount(photo.id);
        const commentCount = await getPhotoCommentCount(photo.id);
        const photoUser = users.find(u => u.id === photo.userId);

        return {
          ...photo,
          likeCount,
          commentCount,
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
      photos: photosWithDetails
    });
  } catch (error) {
    console.error('Error fetching pending photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending photos',
      statusCode: 500
    });
  }
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await getUsers();

    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.json({
      success: true,
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      statusCode: 500
    });
  }
});

router.patch('/photos/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { findPhotoById } = await import('../utils/db.js');
    const photo = await findPhotoById(id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        statusCode: 404
      });
    }

    if (photo.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Photo is not pending approval',
        statusCode: 400
      });
    }

    const updatedPhoto = await updatePhoto(id, {
      status: 'approved',
      isDefault: true,
      reviewedBy: req.user.id,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (!updatedPhoto) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        statusCode: 404
      });
    }

    res.json({
      success: true,
      message: 'Photo approved and made public',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Error approving photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve photo',
      statusCode: 500
    });
  }
});

router.patch('/photos/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { findPhotoById } = await import('../utils/db.js');
    const photo = await findPhotoById(id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        statusCode: 404
      });
    }

    if (photo.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Photo is not pending approval',
        statusCode: 400
      });
    }

    const updatedPhoto = await updatePhoto(id, {
      status: 'rejected',
      isDefault: false,
      reviewedBy: req.user.id,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason || 'No reason provided',
      updatedAt: new Date().toISOString()
    });

    if (!updatedPhoto) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        statusCode: 404
      });
    }

    res.json({
      success: true,
      message: 'Photo rejected',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Error rejecting photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject photo',
      statusCode: 500
    });
  }
});

router.patch('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isAdmin must be a boolean',
        statusCode: 400
      });
    }

    const updatedUser = await updateUser(id, { isAdmin });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role',
      statusCode: 500
    });
  }
});

router.delete('/photos/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deletePhoto(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        statusCode: 404
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

router.delete('/comments/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await findCommentById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
        statusCode: 404
      });
    }

    const deleted = await deleteComment(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete comment',
        statusCode: 500
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
      statusCode: 500
    });
  }
});

router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await getUsers();
    const photos = await getPhotos();
    const { getComments } = await import('../utils/db.js');
    const comments = await getComments();

    const pendingPhotos = photos.filter(p => p.status === 'pending');
    const approvedPhotos = photos.filter(p => p.status === 'approved' && p.isDefault);

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalPhotos: photos.length,
        pendingPhotos: pendingPhotos.length,
        approvedPhotos: approvedPhotos.length,
        totalComments: comments.length
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      statusCode: 500
    });
  }
});

export default router;
