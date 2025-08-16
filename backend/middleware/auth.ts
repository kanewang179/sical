import jwt from 'jsonwebtoken';
import asyncHandler from './async';
import ErrorResponse from '../utils/errorResponse';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';

/**
 * 保护路由，需要用户登录
 */
export const protect = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  let token;

  // 从请求头或Cookie中获取令牌
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从Bearer令牌中提取
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // 从Cookie中获取
    token = req.cookies.token;
  }

  // 确保令牌存在
  if (!token) {
    return next(new ErrorResponse('未授权访问', 401));
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as any;

    // 将用户信息添加到请求对象
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('未授权访问', 401));
  }
});

/**
 * 授权特定角色访问
 */
export const authorize = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `用户角色 ${req.user.role} 未被授权访问此资源`,
          403
        )
      );
    }
    next();
  };
};