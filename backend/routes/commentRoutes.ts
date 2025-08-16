import express from 'express';
const router = express.Router({ mergeParams: true });
import {
  getComments,
  getComment,
  addComment,
  updateComment,
  deleteComment,
  likeComment
} from '../controllers/commentController';

import { protect } from '../middleware/auth';

// 公开路由
router.get('/', getComments);
router.get('/:id', getComment);

// 需要认证的路由
router.post('/', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

export default router;