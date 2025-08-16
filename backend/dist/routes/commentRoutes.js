"use strict";
const express = require('express');
const router = express.Router({ mergeParams: true });
const { getComments, getComment, addComment, updateComment, deleteComment, likeComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
// 公开路由
router.get('/', getComments);
router.get('/:id', getComment);
// 需要认证的路由
router.post('/', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);
module.exports = router;
//# sourceMappingURL=commentRoutes.js.map