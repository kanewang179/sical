package errors

import (
	"errors"
	"fmt"
)

// ErrorType 错误类型
type ErrorType string

const (
	// 业务错误类型
	ErrorTypeValidation   ErrorType = "validation_error"
	ErrorTypeNotFound     ErrorType = "not_found_error"
	ErrorTypeUnauthorized ErrorType = "unauthorized_error"
	ErrorTypeForbidden    ErrorType = "forbidden_error"
	ErrorTypeConflict     ErrorType = "conflict_error"
	ErrorTypeBusiness     ErrorType = "business_error"

	// 系统错误类型
	ErrorTypeDatabase ErrorType = "database_error"
	ErrorTypeCache    ErrorType = "cache_error"
	ErrorTypeExternal ErrorType = "external_error"
	ErrorTypeInternal ErrorType = "internal_error"
)

// AppError 应用错误结构
type AppError struct {
	Type    ErrorType         `json:"type"`
	Code    int               `json:"code"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
	Cause   error             `json:"-"`
}

// Error 实现error接口
func (e *AppError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %s (caused by: %v)", e.Type, e.Message, e.Cause)
	}
	return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

// Unwrap 实现errors.Unwrap接口
func (e *AppError) Unwrap() error {
	return e.Cause
}

// WithCause 添加原因错误
func (e *AppError) WithCause(cause error) *AppError {
	e.Cause = cause
	return e
}

// WithDetails 添加详细信息
func (e *AppError) WithDetails(details map[string]string) *AppError {
	e.Details = details
	return e
}

// WithDetail 添加单个详细信息
func (e *AppError) WithDetail(key, value string) *AppError {
	if e.Details == nil {
		e.Details = make(map[string]string)
	}
	e.Details[key] = value
	return e
}

// New 创建新的应用错误
func New(errorType ErrorType, code int, message string) *AppError {
	return &AppError{
		Type:    errorType,
		Code:    code,
		Message: message,
	}
}

// Wrap 包装错误
func Wrap(err error, errorType ErrorType, code int, message string) *AppError {
	return &AppError{
		Type:    errorType,
		Code:    code,
		Message: message,
		Cause:   err,
	}
}

// 预定义的常用错误
var (
	// 验证错误
	ErrValidationFailed = New(ErrorTypeValidation, 422, "Validation failed")
	ErrInvalidInput     = New(ErrorTypeValidation, 400, "Invalid input")
	ErrMissingField     = New(ErrorTypeValidation, 400, "Missing required field")

	// 认证授权错误
	ErrUnauthorized     = New(ErrorTypeUnauthorized, 401, "Unauthorized")
	ErrInvalidToken     = New(ErrorTypeUnauthorized, 401, "Invalid token")
	ErrTokenExpired     = New(ErrorTypeUnauthorized, 401, "Token expired")
	ErrForbidden        = New(ErrorTypeForbidden, 403, "Forbidden")
	ErrInsufficientRole = New(ErrorTypeForbidden, 403, "Insufficient role")

	// 资源错误
	ErrNotFound      = New(ErrorTypeNotFound, 404, "Resource not found")
	ErrUserNotFound  = New(ErrorTypeNotFound, 404, "User not found")
	ErrAlreadyExists = New(ErrorTypeConflict, 409, "Resource already exists")
	ErrUserExists    = New(ErrorTypeConflict, 409, "User already exists")

	// 业务逻辑错误
	ErrBusinessLogic    = New(ErrorTypeBusiness, 400, "Business logic error")
	ErrInvalidOperation = New(ErrorTypeBusiness, 400, "Invalid operation")
	ErrOperationFailed  = New(ErrorTypeBusiness, 400, "Operation failed")

	// 系统错误
	ErrDatabase        = New(ErrorTypeDatabase, 500, "Database error")
	ErrCache           = New(ErrorTypeCache, 500, "Cache error")
	ErrExternalService = New(ErrorTypeExternal, 502, "External service error")
	ErrInternalServer  = New(ErrorTypeInternal, 500, "Internal server error")
)

// IsAppError 检查是否为应用错误
func IsAppError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr)
}

// AsAppError 转换为应用错误
func AsAppError(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}

// GetErrorType 获取错误类型
func GetErrorType(err error) ErrorType {
	if appErr, ok := AsAppError(err); ok {
		return appErr.Type
	}
	return ErrorTypeInternal
}

// GetErrorCode 获取错误代码
func GetErrorCode(err error) int {
	if appErr, ok := AsAppError(err); ok {
		return appErr.Code
	}
	return 500
}

// GetErrorMessage 获取错误消息
func GetErrorMessage(err error) string {
	if appErr, ok := AsAppError(err); ok {
		return appErr.Message
	}
	return err.Error()
}

// GetErrorDetails 获取错误详情
func GetErrorDetails(err error) map[string]string {
	if appErr, ok := AsAppError(err); ok {
		return appErr.Details
	}
	return nil
}