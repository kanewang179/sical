"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const async_1 = __importDefault(require("./async"));
const errorResponse_1 = __importDefault(require("../utils/errorResponse"));
const User_1 = __importDefault(require("../models/User"));
/**
 * 保护路由，需要用户登录
 */
exports.protect = (0, async_1.default)(async (req, res, next) => {
    let token;
    // 从请求头或Cookie中获取令牌
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        // 从Bearer令牌中提取
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.token) {
        // 从Cookie中获取
        token = req.cookies.token;
    }
    // 确保令牌存在
    if (!token) {
        return next(new errorResponse_1.default('未授权访问', 401));
    }
    try {
        // 验证令牌
        const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET']);
        // 将用户信息添加到请求对象
        req.user = await User_1.default.findById(decoded.id);
        next();
    }
    catch (err) {
        return next(new errorResponse_1.default('未授权访问', 401));
    }
});
/**
 * 授权特定角色访问
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new errorResponse_1.default(`用户角色 ${req.user.role} 未被授权访问此资源`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map