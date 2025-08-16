"use strict";
const express = require('express');
const router = express.Router();
const { getAssessments, getAssessment, createAssessment, updateAssessment, deleteAssessment, submitAssessment, getUserAssessments } = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');
// 公开路由
router.get('/', getAssessments);
router.get('/:id', getAssessment);
// 需要认证的路由
router.get('/user/completed', protect, getUserAssessments);
router.post('/', protect, authorize('admin'), createAssessment);
router.put('/:id', protect, authorize('admin'), updateAssessment);
router.delete('/:id', protect, authorize('admin'), deleteAssessment);
router.post('/:id/submit', protect, submitAssessment);
module.exports = router;
//# sourceMappingURL=assessmentRoutes.js.map