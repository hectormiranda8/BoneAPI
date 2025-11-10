import express from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import { getPhotoComments, addComment, deleteComment, updateComment, findCommentById, findUserById } from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/comments/:photoId
 * Get all comments for a photo
 * Public endpoint
 */
router.get('/:photoId', async (req, res) => {
  try {
    let comments = await getPhotoComments(req.params.photoId);

    // Populate user info for each comment
    comments = await Promise.all(comments.map(async (comment) => {
      const user = await findUserById(comment.userId);
      return {
        ...comment,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
          avatarUrl: user.avatarUrl || null
        }
      };
    }));

    // Sort by newest first
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/comments/:photoId
 * Add a comment to a photo
 * Protected endpoint - requires authentication
 */
router.post('/:photoId', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment cannot be empty' });
    }

    if (content.length > 500) {
      return res.status(400).json({ success: false, error: 'Comment too long (max 500 chars)' });
    }

    const comment = {
      id: crypto.randomUUID(),
      photoId: req.params.photoId,
      userId: req.user.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addComment(comment);

    // Get user info for response
    const user = await findUserById(req.user.id);
    comment.user = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatarUrl: user.avatarUrl || null
    };

    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/comments/:commentId
 * Update a comment
 * Protected endpoint - requires authentication and ownership
 */
router.put('/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await findCommentById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment cannot be empty' });
    }

    if (content.length > 500) {
      return res.status(400).json({ success: false, error: 'Comment too long (max 500 chars)' });
    }

    const updatedComment = await updateComment(req.params.commentId, content.trim());

    res.json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/comments/:commentId
 * Delete a comment
 * Protected endpoint - requires authentication and ownership
 */
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await findCommentById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await deleteComment(req.params.commentId);

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
