import express from 'express';
const router = express.Router();
import {
  getLearningPaths,
  getLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  enrollLearningPath,
  completeLearningPath,
  getUserLearningPaths,
  rateLearningPath
} from '../controllers/learningPathController';

import { protect, authorize } from '../middleware/auth';

// 公开路由
router.get('/', getLearningPaths);
router.get('/:id', getLearningPath);

// 需要认证的路由
router.get('/user/enrolled', protect, getUserLearningPaths);
router.post('/', protect, authorize('admin'), createLearningPath);
router.put('/:id', protect, authorize('admin'), updateLearningPath);
router.delete('/:id', protect, authorize('admin'), deleteLearningPath);
router.post('/:id/enroll', protect, enrollLearningPath);
router.post('/:id/complete', protect, completeLearningPath);
router.post('/:id/rate', protect, rateLearningPath);

export default router;