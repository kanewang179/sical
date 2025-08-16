import User from '../models/User';
import asyncHandler from '../middleware/async';
import ErrorResponse from '../utils/errorResponse';
import sendEmail from '../utils/sendEmail';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

// 扩展Request接口以包含用户信息
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * @desc    注册用户
 * @route   POST /api/users/register
 * @access  公开
 */
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  // 创建用户
  const user = await User.create({
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
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // 验证邮箱和密码
  if (!email || !password) {
    return next(new ErrorResponse('请提供邮箱和密码', 400));
  }

  // 检查用户
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('无效的凭据', 401));
  }

  // 检查密码
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('无效的凭据', 401));
  }

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    获取当前登录用户
 * @route   GET /api/users/me
 * @access  私有
 */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id);

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
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
    bio: req.body.bio
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
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
export const updatePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id).select('+password');

  // 检查当前密码
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('密码不正确', 401));
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
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('没有使用该邮箱的用户', 404));
  }

  // 获取重置令牌
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 创建哈希令牌并设置到数据库
  (user as any).resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 设置过期时间 - 10分钟
  (user as any).resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // 创建重置URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/users/reset-password/${resetToken}`;

  const message = `您收到此邮件是因为您（或其他人）请求重置密码。请点击以下链接重置密码：\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: '密码重置令牌',
      message
    });

    res.status(200).json({ success: true, data: '邮件已发送' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('邮件无法发送', 500));
  }
});

/**
 * @desc    重置密码
 * @route   PUT /api/users/reset-password/:resetToken
 * @access  公开
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // 获取哈希令牌
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update((req.params as any).resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('无效的令牌', 400));
  }

  // 设置新密码
  user.password = req.body.password;
  (user as any).resetPasswordToken = undefined;
  (user as any).resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    获取用户学习进度
 * @route   GET /api/users/learning-progress
 * @access  私有
 */
export const getUserLearningProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'learningProgress.knowledgeId',
      select: 'title category'
    });

  res.status(200).json({
    success: true,
    data: (user as any).learningProgress
  });
});

/**
 * @desc    更新学习进度
 * @route   PUT /api/users/learning-progress/:knowledgeId
 * @access  私有
 */
export const updateLearningProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { progress } = req.body;
  const knowledgeId = (req.params as any).knowledgeId;

  // 查找用户
  const user = await User.findById(req.user.id);

  // 查找是否已有该知识点的进度记录
  const userProgress = (user as any).learningProgress;
  const progressIndex = userProgress.findIndex(
    (item: any) => item.knowledgeId.toString() === knowledgeId
  );

  // 如果已有记录，更新进度
  if (progressIndex > -1) {
    userProgress[progressIndex].progress = progress;
    userProgress[progressIndex].lastAccessed = Date.now();
  } else {
    // 如果没有记录，添加新记录
    userProgress.push({
      knowledgeId,
      progress,
      lastAccessed: Date.now()
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: (user as any).learningProgress
  });
});

// 生成令牌并发送响应
const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  // 创建令牌
  const token = user.getSignedJwtToken();

  const jwtExpire = (process.env as any).JWT_EXPIRE;
  const options: any = {
    expires: new Date(
      Date.now() + parseInt(jwtExpire) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if ((process.env as any).NODE_ENV === 'production') {
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