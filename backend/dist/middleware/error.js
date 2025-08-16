"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = __importDefault(require("../utils/errorResponse"));
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // 记录错误日志
    console.log(err.stack);
    // Mongoose 错误处理
    // 错误的 ObjectId
    if (err.name === 'CastError') {
        const message = `未找到ID为${err.value}的资源`;
        error = new errorResponse_1.default(message, 404);
    }
    // 重复键值错误
    if (err.code === 11000) {
        const message = '输入的值已存在';
        error = new errorResponse_1.default(message, 400);
    }
    // Mongoose 验证错误
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new errorResponse_1.default(message.join(', '), 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || '服务器错误'
    });
};
exports.default = errorHandler;
//# sourceMappingURL=error.js.map