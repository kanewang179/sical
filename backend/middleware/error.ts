import ErrorResponse from '../utils/errorResponse';
import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.log(err.stack);

  // Mongoose 错误处理
  // 错误的 ObjectId
  if (err.name === 'CastError') {
    const message = `未找到ID为${err.value}的资源`;
    error = new ErrorResponse(message, 404);
  }

  // 重复键值错误
  if (err.code === 11000) {
    const message = '输入的值已存在';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message);
    error = new ErrorResponse(message.join(', '), 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器错误'
  });
};

export default errorHandler;