import { Request, Response, NextFunction } from 'express';

/**
 * 异步处理中间件
 * 用于包装异步控制器函数，统一处理错误
 */
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;