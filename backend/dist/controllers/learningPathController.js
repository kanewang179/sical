"use strict";
const LearningPath = require('../models/LearningPath');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// @desc    获取所有学习路径
// @route   GET /api/v1/learningpaths
// @access  Public
exports.getLearningPaths = asyncHandler(async (req, res, next) => {
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await LearningPath.countDocuments({ isPublished: true });
    const query = LearningPath.find({ isPublished: true })
        .skip(startIndex)
        .limit(limit);
    // 排序
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query.sort(sortBy);
    }
    else {
        query.sort('-createdAt');
    }
    // 筛选
    if (req.query.category) {
        query.where('category').equals(req.query.category);
    }
    if (req.query.difficulty) {
        query.where('difficulty').equals(req.query.difficulty);
    }
    // 执行查询
    const learningPaths = await query;
    // 分页结果
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    res.status(200).json({
        success: true,
        count: learningPaths.length,
        pagination,
        data: learningPaths
    });
});
// @desc    获取单个学习路径
// @route   GET /api/v1/learningpaths/:id
// @access  Public
exports.getLearningPath = asyncHandler(async (req, res, next) => {
    const learningPath = await LearningPath.findById(req.params.id)
        .populate({
        path: 'steps.knowledge',
        select: 'title description category difficulty'
    })
        .populate('comments');
    if (!learningPath) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404));
    }
    res.status(200).json({
        success: true,
        data: learningPath
    });
});
// @desc    创建学习路径
// @route   POST /api/v1/learningpaths
// @access  Private/Admin
exports.createLearningPath = asyncHandler(async (req, res, next) => {
    // 添加创建者
    req.body.createdBy = req.user.id;
    const learningPath = await LearningPath.create(req.body);
    res.status(201).json({
        success: true,
        data: learningPath
    });
});
// @desc    更新学习路径
// @route   PUT /api/v1/learningpaths/:id
// @access  Private/Admin
exports.updateLearningPath = asyncHandler(async (req, res, next) => {
    let learningPath = await LearningPath.findById(req.params.id);
    if (!learningPath) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404));
    }
    learningPath = await LearningPath.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: learningPath
    });
});
// @desc    删除学习路径
// @route   DELETE /api/v1/learningpaths/:id
// @access  Private/Admin
exports.deleteLearningPath = asyncHandler(async (req, res, next) => {
    const learningPath = await LearningPath.findById(req.params.id);
    if (!learningPath) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404));
    }
    await learningPath.deleteOne();
    res.status(200).json({
        success: true,
        data: {}
    });
});
// @desc    用户报名学习路径
// @route   POST /api/v1/learningpaths/:id/enroll
// @access  Private
exports.enrollLearningPath = asyncHandler(async (req, res, next) => {
    const learningPath = await LearningPath.findById(req.params.id);
    if (!learningPath) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404));
    }
    // 检查用户是否已经报名
    if (learningPath.enrolledUsers.includes(req.user.id)) {
        return next(new ErrorResponse('您已经报名了该学习路径', 400));
    }
    // 添加用户到报名列表
    learningPath.enrolledUsers.push(req.user.id);
    await learningPath.save();
    res.status(200).json({
        success: true,
        data: learningPath
    });
});
// @desc    用户完成学习路径
// @route   POST /api/v1/learningpaths/:id/complete
// @access  Private
exports.completeLearningPath = asyncHandler(async (req, res, next) => {
    const learningPath = await LearningPath.findById(req.params.id);
    if (!learningPath) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404));
    }
    // 检查用户是否已经报名
    if (!learningPath.enrolledUsers.includes(req.user.id)) {
        return next(new ErrorResponse('您尚未报名该学习路径', 400));
    }
    // 检查用户是否已经完成
    if (learningPath.completedUsers.includes(req.user.id)) {
        return next(new ErrorResponse('您已经完成了该学习路径', 400));
    }
    // 添加用户到完成列表
    learningPath.completedUsers.push(req.user.id);
    await learningPath.save();
    res.status(200).json({
        success: true,
        data: learningPath
    });
});
// @desc    获取用户报名的学习路径
// @route   GET /api/v1/learningpaths/user/enrolled
// @access  Private
exports.getUserLearningPaths = asyncHandler(async (req, res, next) => {
    const learningPaths = await LearningPath.find({
        enrolledUsers: req.user.id
    });
    res.status(200).json({
        success: true,
        count: learningPaths.length,
        data: learningPaths
    });
});
// @desc    评价学习路径
// @route   POST /api/v1/learningpaths/:id/rate
// @access  Private
exports.rateLearningPath = asyncHandler(async (req, res, next) => {
    const { rating } = req.body;
    // 验证评分
    if (!rating || rating < 1 || rating > 5) {
        return next(new ErrorResponse('请提供1-5之间的评分', 400));
    }
    const learningPath = await LearningPath.findById(req.params.id);
    if (!learningPath) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404));
    }
    // 检查用户是否已经完成学习路径
    if (!learningPath.completedUsers.includes(req.user.id)) {
        return next(new ErrorResponse('您必须完成学习路径才能评分', 400));
    }
    // 计算新的平均评分
    const newRatingsCount = learningPath.ratingsCount + 1;
    const newAverageRating = (learningPath.averageRating * learningPath.ratingsCount + rating) / newRatingsCount;
    learningPath.averageRating = newAverageRating;
    learningPath.ratingsCount = newRatingsCount;
    await learningPath.save();
    res.status(200).json({
        success: true,
        data: learningPath
    });
});
//# sourceMappingURL=learningPathController.js.map