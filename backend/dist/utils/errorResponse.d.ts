/**
 * 自定义错误响应类
 * 扩展Error类，添加状态码
 */
declare class ErrorResponse extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export default ErrorResponse;
//# sourceMappingURL=errorResponse.d.ts.map