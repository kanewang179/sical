"use strict";
const Comment = require('../models/Comment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// @desc    获取评论
// @route   GET /api/v1/knowledges/:knowledgeId/comments
// @route   GET /api/v1/learningpaths/:learningPathId/comments
// @route   GET /api/v1/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.knowledgeId) {
        // 获取知识点的评论
        query = Comment.find({ knowledge: req.params.knowledgeId, parentComment: null });
    }
    else if (req.params.learningPathId) {
        // 获取学习路径的评论
        query = Comment.find({ learningPath: req.params.learningPathId, parentComment: null });
    }
    else {
        return next(new ErrorResponse('请指定知识点或学习路径ID', 400));
    }
    // 添加用户信息和回复
    query = query.populate({
        path: 'user',
        select: 'username avatar'
    }).populate({
        path: 'replies',
        populate: {
            path: 'user',
            select: 'username avatar'
        }
    });
    // 排序
    query = query.sort('-createdAt');
    const comments = await query;
    res.status(200).json({
        success: true,
        count: comments.length,
        data: comments
    });
});
// @desc    获取单个评论
// @route   GET /api/v1/comments/:id
// @access  Public
exports.getComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id)
        .populate({
        path: 'user',
        select: 'username avatar'
    })
        .populate({
        path: 'replies',
        populate: {
            path: 'user',
            select: 'username avatar'
        }
    });
    if (!comment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评论`, 404));
    }
    res.status(200).json({
        success: true,
        data: comment
    });
});
// @desc    添加评论
// @route   POST /api/v1/knowledges/:knowledgeId/comments
// @route   POST /api/v1/learningpaths/:learningPathId/comments
// @route   POST /api/v1/comments/:parentId/reply
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    if (!content) {
        return next(new ErrorResponse('请提供评论内容', 400));
    }
    const commentData = {
        content,
        user: req.user.id
    };
    // 处理回复评论
    if (req.params.parentId) {
        const parentComment = await Comment.findById(req.params.parentId);
        if (!parentComment) {
            return next(new ErrorResponse(`未找到ID为${req.params.parentId}的评论`, 404));
        }
        commentData.parentComment = req.params.parentId;
        // 继承父评论的关联
        if (parentComment.knowledge) {
            commentData.knowledge = parentComment.knowledge;
        }
        else if (parentComment.learningPath) {
            commentData.learningPath = parentComment.learningPath;
        }
    }
    // 处理知识点或学习路径的评论
    else if (req.params.knowledgeId) {
        commentData.knowledge = req.params.knowledgeId;
    }
    else if (req.params.learningPathId) {
        commentData.learningPath = req.params.learningPathId;
    }
    else {
        return next(new ErrorResponse('请指定知识点、学习路径ID或父评论ID', 400));
    }
    const comment = await Comment.create(commentData);
    // 获取完整的评论信息，包括用户信息
    const populatedComment = await Comment.findById(comment._id).populate({
        path: 'user',
        select: 'username avatar'
    });
    res.status(201).json({
        success: true,
        data: populatedComment
    });
});
// @desc    更新评论
// @route   PUT /api/v1/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    if (!content) {
        return next(new ErrorResponse('请提供评论内容', 400));
    }
    let comment = await Comment.findById(req.params.id);
    if (!comment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评论`, 404));
    }
    // 确保用户是评论的作者
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('您没有权限更新此评论', 403));
    }
    comment.content = content;
    comment.isEdited = true;
    await comment.save();
    comment = await Comment.findById(req.params.id).populate({
        path: 'user',
        select: 'username avatar'
    });
    res.status(200).json({
        success: true,
        data: comment
    });
});
// @desc    删除评论
// @route   DELETE /api/v1/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评论`, 404));
    }
    // 确保用户是评论的作者或管理员
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('您没有权限删除此评论', 403));
    }
    await comment.deleteOne();
    // 如果是父评论，删除所有回复
    if (!comment.parentComment) {
        await Comment.deleteMany({ parentComment: req.params.id });
    }
    res.status(200).json({
        success: true,
        data: {}
    });
});
// @desc    点赞评论
// @route   POST /api/v1/comments/:id/like
// @access  Private
exports.likeComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评论`, 404));
    }
    // 检查用户是否已经点赞
    const alreadyLiked = comment.likes.includes(req.user.id);
    if (alreadyLiked) {
        // 取消点赞
        comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
    }
    else {
        // 添加点赞
        comment.likes.push(req.user.id);
    }
    await comment.save();
    res.status(200).json({
        success: true,
        data: comment
    });
});
//# sourceMappingURL=commentController.js.map