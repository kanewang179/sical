/**
 * 自定义错误响应类
 * 扩展Error类，添加状态码
 */
class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorResponse;