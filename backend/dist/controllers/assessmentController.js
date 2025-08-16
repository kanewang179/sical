"use strict";
const Assessment = require('../models/Assessment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// @desc    获取所有评估
// @route   GET /api/v1/assessments
// @access  Public
exports.getAssessments = asyncHandler(async (req, res, next) => {
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Assessment.countDocuments({ isPublished: true });
    const query = Assessment.find({ isPublished: true })
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
    if (req.query.type) {
        query.where('type').equals(req.query.type);
    }
    // 执行查询
    const assessments = await query;
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
        count: assessments.length,
        pagination,
        data: assessments
    });
});
// @desc    获取单个评估
// @route   GET /api/v1/assessments/:id
// @access  Public
exports.getAssessment = asyncHandler(async (req, res, next) => {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评估`, 404));
    }
    // 如果是公开访问，不返回正确答案
    if (!req.user || req.user.role !== 'admin') {
        const sanitizedAssessment = { ...assessment.toObject() };
        sanitizedAssessment.questions = sanitizedAssessment.questions.map(question => {
            const { correctAnswer, ...rest } = question;
            return rest;
        });
        return res.status(200).json({
            success: true,
            data: sanitizedAssessment
        });
    }
    res.status(200).json({
        success: true,
        data: assessment
    });
});
// @desc    创建评估
// @route   POST /api/v1/assessments
// @access  Private/Admin
exports.createAssessment = asyncHandler(async (req, res, next) => {
    // 添加创建者
    req.body.createdBy = req.user.id;
    const assessment = await Assessment.create(req.body);
    res.status(201).json({
        success: true,
        data: assessment
    });
});
// @desc    更新评估
// @route   PUT /api/v1/assessments/:id
// @access  Private/Admin
exports.updateAssessment = asyncHandler(async (req, res, next) => {
    let assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评估`, 404));
    }
    assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: assessment
    });
});
// @desc    删除评估
// @route   DELETE /api/v1/assessments/:id
// @access  Private/Admin
exports.deleteAssessment = asyncHandler(async (req, res, next) => {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评估`, 404));
    }
    await assessment.deleteOne();
    res.status(200).json({
        success: true,
        data: {}
    });
});
// @desc    提交评估答案
// @route   POST /api/v1/assessments/:id/submit
// @access  Private
exports.submitAssessment = asyncHandler(async (req, res, next) => {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
        return next(new ErrorResponse('请提供答案', 400));
    }
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的评估`, 404));
    }
    // 计算得分
    let totalPoints = 0;
    let earnedPoints = 0;
    const results = [];
    assessment.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = compareAnswers(question.correctAnswer, userAnswer, question.questionType);
        totalPoints += question.points;
        if (isCorrect) {
            earnedPoints += question.points;
        }
        results.push({
            questionId: question._id,
            isCorrect,
            correctAnswer: question.correctAnswer,
            userAnswer,
            explanation: question.explanation
        });
    });
    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= assessment.passingScore;
    // 更新评估统计信息
    assessment.completedCount += 1;
    assessment.averageScore =
        ((assessment.averageScore * (assessment.completedCount - 1)) + score) / assessment.completedCount;
    await assessment.save();
    // 保存用户的评估记录
    // 这里可以添加保存到用户评估历史的逻辑
    res.status(200).json({
        success: true,
        data: {
            score,
            passed,
            results
        }
    });
});
// @desc    获取用户完成的评估
// @route   GET /api/v1/assessments/user/completed
// @access  Private
exports.getUserAssessments = asyncHandler(async (req, res, next) => {
    // 这里需要从用户的评估历史中获取数据
    // 暂时返回空数组，后续可以完善
    res.status(200).json({
        success: true,
        count: 0,
        data: []
    });
});
// 辅助函数：比较答案
function compareAnswers(correctAnswer, userAnswer, questionType) {
    if (!userAnswer)
        return false;
    switch (questionType) {
        case '单选题':
            return correctAnswer === userAnswer;
        case '多选题':
            if (!Array.isArray(correctAnswer) || !Array.isArray(userAnswer)) {
                return false;
            }
            if (correctAnswer.length !== userAnswer.length) {
                return false;
            }
            return correctAnswer.every(answer => userAnswer.includes(answer));
        case '填空题':
            return correctAnswer.toLowerCase() === userAnswer.toLowerCase();
        case '判断题':
            return correctAnswer === userAnswer;
        case '简答题':
            // 简答题需要人工评分，这里暂时返回false
            return false;
        default:
            return false;
    }
}
//# sourceMappingURL=assessmentController.js.map