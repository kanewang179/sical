"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKnowledge = exports.updateKnowledge = exports.createKnowledge = exports.getKnowledge = exports.getKnowledges = void 0;
const Knowledge_1 = __importDefault(require("../models/Knowledge"));
const errorResponse_1 = __importDefault(require("../utils/errorResponse"));
const async_1 = __importDefault(require("../middleware/async"));
// @desc    获取所有知识点
// @route   GET /api/v1/knowledges
// @access  Public
exports.getKnowledges = (0, async_1.default)(async (req, res, next) => {
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Knowledge_1.default.countDocuments();
    const query = Knowledge_1.default.find().skip(startIndex).limit(limit);
    // 排序
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query.sort(sortBy);
    }
    else {
        query.sort('-createdAt');
    }
    // 执行查询
    const knowledges = await query;
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
        count: knowledges.length,
        pagination,
        data: knowledges
    });
});
// @desc    获取单个知识点
// @route   GET /api/v1/knowledges/:id
// @access  Public
exports.getKnowledge = (0, async_1.default)(async (req, res, next) => {
    const knowledge = await Knowledge_1.default.findById(req.params.id).populate('comments');
    if (!knowledge) {
        return next(new errorResponse_1.default(`未找到ID为${req.params.id}的知识点`, 404));
    }
    // 更新浏览量
    knowledge.views += 1;
    await knowledge.save();
    res.status(200).json({
        success: true,
        data: knowledge
    });
});
// @desc    创建知识点
// @route   POST /api/v1/knowledges
// @access  Private/Admin
exports.createKnowledge = (0, async_1.default)(async (req, res, next) => {
    // 添加创建者
    req.body.createdBy = req.user.id;
    const knowledge = await Knowledge_1.default.create(req.body);
    res.status(201).json({
        success: true,
        data: knowledge
    });
});
// @desc    更新知识点
// @route   PUT /api/v1/knowledges/:id
// @access  Private/Admin
exports.updateKnowledge = (0, async_1.default)(async (req, res, next) => {
    let knowledge = await Knowledge_1.default.findById(req.params.id);
    if (!knowledge) {
        return next(new errorResponse_1.default(`未找到ID为${req.params.id}的知识点`, 404));
    }
    knowledge = await Knowledge_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: knowledge
    });
});
// @desc    删除知识点
// @route   DELETE /api/v1/knowledges/:id
// @access  Private/Admin
exports.deleteKnowledge = (0, async_1.default)(async (req, res, next) => {
    const knowledge = await Knowledge_1.default.findById(req.params.id);
    if (!knowledge) {
        return next(new errorResponse_1.default(`未找到ID为${req.params.id}的知识点`, 404));
    }
    await knowledge.deleteOne();
    res.status(200).json({
        success: true,
        data: {}
    });
});
// @desc    按类别获取知识点
// @route   GET /api/v1/knowledges/category/:category
// @access  Public
exports.getKnowledgesByCategory = (0, async_1.default)(async (req, res, next) => {
    const knowledges = await Knowledge_1.default.find({ category: req.params.category });
    res.status(200).json({
        success: true,
        count: knowledges.length,
        data: knowledges
    });
});
// @desc    搜索知识点
// @route   GET /api/v1/knowledges/search
// @access  Public
exports.searchKnowledge = (0, async_1.default)(async (req, res, next) => {
    const { q } = req.query;
    if (!q) {
        return next(new errorResponse_1.default('请提供搜索关键词', 400));
    }
    const knowledges = await Knowledge_1.default.find({
        $text: { $search: q }
    }).sort({
        score: { $meta: 'textScore' }
    });
    res.status(200).json({
        success: true,
        count: knowledges.length,
        data: knowledges
    });
});
// @desc    评价知识点
// @route   POST /api/v1/knowledges/:id/rate
// @access  Private
exports.rateKnowledge = (0, async_1.default)(async (req, res, next) => {
    const { rating } = req.body;
    // 验证评分
    if (!rating || rating < 1 || rating > 5) {
        return next(new errorResponse_1.default('请提供1-5之间的评分', 400));
    }
    const knowledge = await Knowledge_1.default.findById(req.params.id);
    if (!knowledge) {
        return next(new errorResponse_1.default(`未找到ID为${req.params.id}的知识点`, 404));
    }
    // 计算新的平均评分
    const newRatingsCount = knowledge.ratingsCount + 1;
    const newAverageRating = (knowledge.averageRating * knowledge.ratingsCount + rating) / newRatingsCount;
    knowledge.averageRating = newAverageRating;
    knowledge.ratingsCount = newRatingsCount;
    await knowledge.save();
    res.status(200).json({
        success: true,
        data: knowledge
    });
});
//# sourceMappingURL=knowledgeController.js.map