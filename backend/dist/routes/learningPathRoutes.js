"use strict";
const express = require('express');
const router = express.Router();
const { getLearningPaths, getLearningPath, createLearningPath, updateLearningPath, deleteLearningPath, enrollLearningPath, completeLearningPath, getUserLearningPaths, rateLearningPath } = require('../controllers/learningPathController');
const { protect, authorize } = require('../middleware/auth');
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
module.exports = router;
//# sourceMappingURL=learningPathRoutes.js.map