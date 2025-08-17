package validator

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Validator 验证器结构
type Validator struct {
	validator *validator.Validate
}

// ValidationError 验证错误
type ValidationError struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Value   string `json:"value"`
	Message string `json:"message"`
}

// ValidationErrors 验证错误列表
type ValidationErrors []ValidationError

// Error 实现error接口
func (ve ValidationErrors) Error() string {
	var messages []string
	for _, err := range ve {
		messages = append(messages, err.Message)
	}
	return strings.Join(messages, "; ")
}

// ToMap 转换为map格式
func (ve ValidationErrors) ToMap() map[string]string {
	errors := make(map[string]string)
	for _, err := range ve {
		errors[err.Field] = err.Message
	}
	return errors
}

var (
	// 邮箱正则表达式
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	// 手机号正则表达式（中国）
	phoneRegex = regexp.MustCompile(`^1[3-9]\d{9}$`)
	// 密码强度正则表达式（至少8位，包含大小写字母和数字）
	strongPasswordRegex = regexp.MustCompile(`^[A-Za-z\d@$!%*?&]{8,}$`)
)

// New 创建新的验证器
func New() *Validator {
	v := validator.New()

	// 注册自定义验证器
	v.RegisterValidation("strong_password", validateStrongPassword)
	v.RegisterValidation("chinese_phone", validateChinesePhone)
	v.RegisterValidation("username", validateUsername)

	// 使用json标签作为字段名
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	return &Validator{
		validator: v,
	}
}

// Validate 验证结构体
func (v *Validator) Validate(s interface{}) error {
	err := v.validator.Struct(s)
	if err == nil {
		return nil
	}

	var validationErrors ValidationErrors
	for _, err := range err.(validator.ValidationErrors) {
		validationErrors = append(validationErrors, ValidationError{
			Field:   err.Field(),
			Tag:     err.Tag(),
			Value:   fmt.Sprintf("%v", err.Value()),
			Message: getErrorMessage(err),
		})
	}

	return validationErrors
}

// ValidateVar 验证单个变量
func (v *Validator) ValidateVar(field interface{}, tag string) error {
	return v.validator.Var(field, tag)
}

// getErrorMessage 获取错误消息
func getErrorMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", fe.Field())
	case "email":
		return fmt.Sprintf("%s must be a valid email address", fe.Field())
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", fe.Field(), fe.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters long", fe.Field(), fe.Param())
	case "len":
		return fmt.Sprintf("%s must be exactly %s characters long", fe.Field(), fe.Param())
	case "gte":
		return fmt.Sprintf("%s must be greater than or equal to %s", fe.Field(), fe.Param())
	case "lte":
		return fmt.Sprintf("%s must be less than or equal to %s", fe.Field(), fe.Param())
	case "gt":
		return fmt.Sprintf("%s must be greater than %s", fe.Field(), fe.Param())
	case "lt":
		return fmt.Sprintf("%s must be less than %s", fe.Field(), fe.Param())
	case "oneof":
		return fmt.Sprintf("%s must be one of [%s]", fe.Field(), fe.Param())
	case "strong_password":
		return fmt.Sprintf("%s must be at least 8 characters long and contain uppercase, lowercase letters and numbers", fe.Field())
	case "chinese_phone":
		return fmt.Sprintf("%s must be a valid Chinese phone number", fe.Field())
	case "username":
		return fmt.Sprintf("%s must be 3-20 characters long and contain only letters, numbers, and underscores", fe.Field())
	default:
		return fmt.Sprintf("%s is invalid", fe.Field())
	}
}

// 自定义验证函数

// validateStrongPassword 验证强密码
func validateStrongPassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	return strongPasswordRegex.MatchString(password)
}

// validateChinesePhone 验证中国手机号
func validateChinesePhone(fl validator.FieldLevel) bool {
	phone := fl.Field().String()
	return phoneRegex.MatchString(phone)
}

// validateUsername 验证用户名
func validateUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	if len(username) < 3 || len(username) > 20 {
		return false
	}
	// 只允许字母、数字和下划线
	for _, char := range username {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '_') {
			return false
		}
	}
	return true
}

// IsValidEmail 验证邮箱格式
func IsValidEmail(email string) bool {
	return emailRegex.MatchString(email)
}

// IsValidPhone 验证手机号格式
func IsValidPhone(phone string) bool {
	return phoneRegex.MatchString(phone)
}

// IsStrongPassword 验证密码强度
func IsStrongPassword(password string) bool {
	return strongPasswordRegex.MatchString(password)
}

// IsValidUsername 验证用户名格式
func IsValidUsername(username string) bool {
	if len(username) < 3 || len(username) > 20 {
		return false
	}
	for _, char := range username {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '_') {
			return false
		}
	}
	return true
}