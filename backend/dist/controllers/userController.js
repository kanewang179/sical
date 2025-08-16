"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLearningProgress = exports.getUserLearningProgress = exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const async_1 = __importDefault(require("../middleware/async"));
const errorResponse_1 = __importDefault(require("../utils/errorResponse"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * @desc    注册用户
 * @route   POST /api/users/register
 * @access  公开
 */
exports.register = (0, async_1.default)(async (req, res, next) => {
    const { username, email, password } = req.body;
    // 创建用户
    const user = await User_1.default.create({
        username,
        email,
        password
    });
    sendTokenResponse(user, 201, res);
});
/**
 * @desc    用户登录
 * @route   POST /api/users/login
 * @access  公开
 */
exports.login = (0, async_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    // 验证邮箱和密码
    if (!email || !password) {
        return next(new errorResponse_1.default('请提供邮箱和密码', 400));
    }
    // 检查用户
    const user = await User_1.default.findOne({ email }).select('+password');
    if (!user) {
        return next(new errorResponse_1.default('无效的凭据', 401));
    }
    // 检查密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new errorResponse_1.default('无效的凭据', 401));
    }
    sendTokenResponse(user, 200, res);
});
/**
 * @desc    获取当前登录用户
 * @route   GET /api/users/me
 * @access  私有
 */
exports.getMe = (0, async_1.default)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
});
/**
 * @desc    更新用户资料
 * @route   PUT /api/users/update-profile
 * @access  私有
 */
exports.updateProfile = (0, async_1.default)(async (req, res, next) => {
    const fieldsToUpdate = {
        username: req.body.username,
        email: req.body.email,
        bio: req.body.bio
    };
    const user = await User_1.default.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: user
    });
});
/**
 * @desc    更新密码
 * @route   PUT /api/users/update-password
 * @access  私有
 */
exports.updatePassword = (0, async_1.default)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user.id).select('+password');
    // 检查当前密码
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new errorResponse_1.default('密码不正确', 401));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
});
/**
 * @desc    忘记密码
 * @route   POST /api/users/forgot-password
 * @access  公开
 */
exports.forgotPassword = (0, async_1.default)(async (req, res, next) => {
    const user = await User_1.default.findOne({ email: req.body.email });
    if (!user) {
        return next(new errorResponse_1.default('没有使用该邮箱的用户', 404));
    }
    // 获取重置令牌
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    // 创建哈希令牌并设置到数据库
    user.resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // 设置过期时间 - 10分钟
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    // 创建重置URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;
    const message = `您收到此邮件是因为您（或其他人）请求重置密码。请点击以下链接重置密码：\n\n${resetUrl}`;
    try {
        await (0, sendEmail_1.default)({
            email: user.email,
            subject: '密码重置令牌',
            message
        });
        res.status(200).json({ success: true, data: '邮件已发送' });
    }
    catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new errorResponse_1.default('邮件无法发送', 500));
    }
});
/**
 * @desc    重置密码
 * @route   PUT /api/users/reset-password/:resetToken
 * @access  公开
 */
exports.resetPassword = (0, async_1.default)(async (req, res, next) => {
    // 获取哈希令牌
    const resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');
    const user = await User_1.default.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new errorResponse_1.default('无效的令牌', 400));
    }
    // 设置新密码
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
});
/**
 * @desc    获取用户学习进度
 * @route   GET /api/users/learning-progress
 * @access  私有
 */
exports.getUserLearningProgress = (0, async_1.default)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user.id)
        .populate({
        path: 'learningProgress.knowledgeId',
        select: 'title category'
    });
    res.status(200).json({
        success: true,
        data: user.learningProgress
    });
});
/**
 * @desc    更新学习进度
 * @route   PUT /api/users/learning-progress/:knowledgeId
 * @access  私有
 */
exports.updateLearningProgress = (0, async_1.default)(async (req, res, next) => {
    const { progress } = req.body;
    const knowledgeId = req.params.knowledgeId;
    // 查找用户
    const user = await User_1.default.findById(req.user.id);
    // 查找是否已有该知识点的进度记录
    const progressIndex = user.learningProgress.findIndex(item => item.knowledgeId.toString() === knowledgeId);
    // 如果已有记录，更新进度
    if (progressIndex > -1) {
        user.learningProgress[progressIndex].progress = progress;
        user.learningProgress[progressIndex].lastAccessed = Date.now();
    }
    else {
        // 如果没有记录，添加新记录
        user.learningProgress.push({
            knowledgeId,
            progress,
            lastAccessed: Date.now()
        });
    }
    await user.save();
    res.status(200).json({
        success: true,
        data: user.learningProgress
    });
});
// 生成令牌并发送响应
const sendTokenResponse = (user, statusCode, res) => {
    // 创建令牌
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
        success: true,
        token
    });
};
//# sourceMappingURL=userController.js.map