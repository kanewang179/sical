import { Request, Response, NextFunction } from 'express';
/**
 * @desc    注册用户
 * @route   POST /api/users/register
 * @access  公开
 */
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    用户登录
 * @route   POST /api/users/login
 * @access  公开
 */
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    获取当前登录用户
 * @route   GET /api/users/me
 * @access  私有
 */
export declare const getMe: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    更新用户资料
 * @route   PUT /api/users/update-profile
 * @access  私有
 */
export declare const updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    更新密码
 * @route   PUT /api/users/update-password
 * @access  私有
 */
export declare const updatePassword: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    忘记密码
 * @route   POST /api/users/forgot-password
 * @access  公开
 */
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    重置密码
 * @route   PUT /api/users/reset-password/:resetToken
 * @access  公开
 */
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    获取用户学习进度
 * @route   GET /api/users/learning-progress
 * @access  私有
 */
export declare const getUserLearningProgress: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * @desc    更新学习进度
 * @route   PUT /api/users/learning-progress/:knowledgeId
 * @access  私有
 */
export declare const updateLearningProgress: (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=userController.d.ts.map