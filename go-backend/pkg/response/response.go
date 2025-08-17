package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response 通用响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
}

// ErrorInfo 错误信息结构
type ErrorInfo struct {
	Type    string            `json:"type"`
	Details map[string]string `json:"details,omitempty"`
}

// PaginationResponse 分页响应结构
type PaginationResponse struct {
	Code    int                `json:"code"`
	Message string             `json:"message"`
	Data    interface{}        `json:"data"`
	Meta    *PaginationMeta    `json:"meta"`
}

// PaginationMeta 分页元数据
type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	PerPage     int   `json:"per_page"`
	Total       int64 `json:"total"`
	TotalPages  int   `json:"total_pages"`
	HasNext     bool  `json:"has_next"`
	HasPrev     bool  `json:"has_prev"`
}

// 响应状态码常量
const (
	// 成功响应
	CodeSuccess = 200

	// 客户端错误
	CodeBadRequest          = 400
	CodeUnauthorized        = 401
	CodeForbidden           = 403
	CodeNotFound            = 404
	CodeMethodNotAllowed    = 405
	CodeConflict            = 409
	CodeValidationFailed    = 422
	CodeTooManyRequests     = 429

	// 服务器错误
	CodeInternalServerError = 500
	CodeBadGateway          = 502
	CodeServiceUnavailable  = 503
	CodeGatewayTimeout      = 504
)

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    CodeSuccess,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMessage 带消息的成功响应
func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    CodeSuccess,
		Message: message,
		Data:    data,
	})
}

// Error 错误响应
func Error(c *gin.Context, httpCode, code int, message string) {
	c.JSON(httpCode, Response{
		Code:    code,
		Message: message,
	})
}

// ErrorWithDetails 带详细信息的错误响应
func ErrorWithDetails(c *gin.Context, httpCode, code int, message, errorType string, details map[string]string) {
	c.JSON(httpCode, Response{
		Code:    code,
		Message: message,
		Error: &ErrorInfo{
			Type:    errorType,
			Details: details,
		},
	})
}

// Created 201创建成功响应
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Code:    http.StatusCreated,
		Message: "created",
		Data:    data,
	})
}

// BadRequest 400错误响应
func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, CodeBadRequest, message)
}

// Unauthorized 401错误响应
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, CodeUnauthorized, message)
}

// Forbidden 403错误响应
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, CodeForbidden, message)
}

// NotFound 404错误响应
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, CodeNotFound, message)
}

// Conflict 409冲突错误响应
func Conflict(c *gin.Context, message string) {
	Error(c, http.StatusConflict, CodeConflict, message)
}

// ValidationFailed 422验证失败响应
func ValidationFailed(c *gin.Context, details map[string]string) {
	ErrorWithDetails(c, http.StatusUnprocessableEntity, CodeValidationFailed, "Validation failed", "validation_error", details)
}

// InternalServerError 500错误响应
func InternalServerError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, CodeInternalServerError, message)
}

// Pagination 分页响应
func Pagination(c *gin.Context, data interface{}, meta *PaginationMeta) {
	c.JSON(http.StatusOK, PaginationResponse{
		Code:    CodeSuccess,
		Message: "success",
		Data:    data,
		Meta:    meta,
	})
}

// NewPaginationMeta 创建分页元数据
func NewPaginationMeta(currentPage, perPage int, total int64) *PaginationMeta {
	totalPages := int((total + int64(perPage) - 1) / int64(perPage))
	if totalPages == 0 {
		totalPages = 1
	}

	return &PaginationMeta{
		CurrentPage: currentPage,
		PerPage:     perPage,
		Total:       total,
		TotalPages:  totalPages,
		HasNext:     currentPage < totalPages,
		HasPrev:     currentPage > 1,
	}
}