"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 自定义错误响应类
 * 扩展Error类，添加状态码
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.default = ErrorResponse;
//# sourceMappingURL=errorResponse.js.map