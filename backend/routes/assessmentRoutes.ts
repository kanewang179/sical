import express from 'express';
const router = express.Router();
import {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  submitAssessment,
  getUserAssessments
} from '../controllers/assessmentController';

import { protect, authorize } from '../middleware/auth';

// 公开路由
router.get('/', getAssessments);
router.get('/:id', getAssessment);

// 需要认证的路由
router.get('/user/completed', protect, getUserAssessments);
router.post('/', protect, authorize('admin'), createAssessment);
router.put('/:id', protect, authorize('admin'), updateAssessment);
router.delete('/:id', protect, authorize('admin'), deleteAssessment);
router.post('/:id/submit', protect, submitAssessment);

export default router;