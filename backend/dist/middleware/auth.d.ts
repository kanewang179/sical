import { Request, Response, NextFunction } from 'express';
/**
 * 保护路由，需要用户登录
 */
export declare const protect: (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * 授权特定角色访问
 */
export declare const authorize: (...roles: string[]) => (req: any, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map