import express from 'express';
const router = express.Router();
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUserLearningProgress,
  updateLearningProgress
} from '../controllers/userController';
import { protect } from '../middleware/auth';

// 公开路由
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// 需要认证的路由
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

// 学习进度相关路由
router.get('/learning-progress', protect, getUserLearningProgress);
router.put('/learning-progress/:knowledgeId', protect, updateLearningProgress);

export default router;