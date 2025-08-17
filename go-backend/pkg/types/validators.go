package types

import (
	"fmt"
	"net/mail"
	"net/url"
	"regexp"
	"strings"
	"unicode"
)

// StringValidator 字符串验证器
type StringValidator struct {
	MinLength int
	MaxLength int
	Pattern   *regexp.Regexp
	Required  bool
	TrimSpace bool
}

// NewStringValidator 创建字符串验证器
func NewStringValidator(minLen, maxLen int, pattern string, required bool) (*StringValidator, error) {
	var regex *regexp.Regexp
	var err error
	
	if pattern != "" {
		regex, err = regexp.Compile(pattern)
		if err != nil {
			return nil, fmt.Errorf("invalid regex pattern: %w", err)
		}
	}
	
	return &StringValidator{
		MinLength: minLen,
		MaxLength: maxLen,
		Pattern:   regex,
		Required:  required,
		TrimSpace: true,
	}, nil
}

// Validate 验证字符串
func (v *StringValidator) Validate(value string) error {
	if v.TrimSpace {
		value = strings.TrimSpace(value)
	}
	
	if v.Required && value == "" {
		return fmt.Errorf("value is required")
	}
	
	if len(value) < v.MinLength {
		return fmt.Errorf("value length %d is less than minimum %d", len(value), v.MinLength)
	}
	
	if v.MaxLength > 0 && len(value) > v.MaxLength {
		return fmt.Errorf("value length %d exceeds maximum %d", len(value), v.MaxLength)
	}
	
	if v.Pattern != nil && !v.Pattern.MatchString(value) {
		return fmt.Errorf("value does not match required pattern")
	}
	
	return nil
}

// EmailValidator 邮箱验证器
type EmailValidator struct {
	Required bool
}

// NewEmailValidator 创建邮箱验证器
func NewEmailValidator(required bool) *EmailValidator {
	return &EmailValidator{Required: required}
}

// Validate 验证邮箱
func (v *EmailValidator) Validate(value string) error {
	value = strings.TrimSpace(value)
	
	if v.Required && value == "" {
		return fmt.Errorf("email is required")
	}
	
	if value == "" {
		return nil // 非必需且为空
	}
	
	_, err := mail.ParseAddress(value)
	if err != nil {
		return fmt.Errorf("invalid email format: %w", err)
	}
	
	return nil
}

// URLValidator URL验证器
type URLValidator struct {
	Required bool
	Schemes  []string
}

// NewURLValidator 创建URL验证器
func NewURLValidator(required bool, schemes []string) *URLValidator {
	if len(schemes) == 0 {
		schemes = []string{"http", "https"}
	}
	return &URLValidator{
		Required: required,
		Schemes:  schemes,
	}
}

// Validate 验证URL
func (v *URLValidator) Validate(value string) error {
	value = strings.TrimSpace(value)
	
	if v.Required && value == "" {
		return fmt.Errorf("URL is required")
	}
	
	if value == "" {
		return nil // 非必需且为空
	}
	
	parsedURL, err := url.Parse(value)
	if err != nil {
		return fmt.Errorf("invalid URL format: %w", err)
	}
	
	if parsedURL.Scheme == "" {
		return fmt.Errorf("URL scheme is required")
	}
	
	schemeValid := false
	for _, scheme := range v.Schemes {
		if parsedURL.Scheme == scheme {
			schemeValid = true
			break
		}
	}
	
	if !schemeValid {
		return fmt.Errorf("URL scheme %s is not allowed, allowed schemes: %v", parsedURL.Scheme, v.Schemes)
	}
	
	return nil
}

// NumericValidator 数值验证器
type NumericValidator[T Numeric] struct {
	Min      *T
	Max      *T
	Required bool
}

// NewNumericValidator 创建数值验证器
func NewNumericValidator[T Numeric](min, max *T, required bool) *NumericValidator[T] {
	return &NumericValidator[T]{
		Min:      min,
		Max:      max,
		Required: required,
	}
}

// Validate 验证数值
func (v *NumericValidator[T]) Validate(value T) error {
	var zero T
	if v.Required && value == zero {
		return fmt.Errorf("value is required")
	}
	
	if v.Min != nil && value < *v.Min {
		return fmt.Errorf("value %v is less than minimum %v", value, *v.Min)
	}
	
	if v.Max != nil && value > *v.Max {
		return fmt.Errorf("value %v exceeds maximum %v", value, *v.Max)
	}
	
	return nil
}

// SliceValidator 切片验证器
type SliceValidator[T any] struct {
	MinLength     int
	MaxLength     int
	ItemValidator Validator[T]
	Required      bool
}

// NewSliceValidator 创建切片验证器
func NewSliceValidator[T any](minLen, maxLen int, itemValidator Validator[T], required bool) *SliceValidator[T] {
	return &SliceValidator[T]{
		MinLength:     minLen,
		MaxLength:     maxLen,
		ItemValidator: itemValidator,
		Required:      required,
	}
}

// Validate 验证切片
func (v *SliceValidator[T]) Validate(value []T) error {
	if v.Required && len(value) == 0 {
		return fmt.Errorf("slice is required")
	}
	
	if len(value) < v.MinLength {
		return fmt.Errorf("slice length %d is less than minimum %d", len(value), v.MinLength)
	}
	
	if v.MaxLength > 0 && len(value) > v.MaxLength {
		return fmt.Errorf("slice length %d exceeds maximum %d", len(value), v.MaxLength)
	}
	
	if v.ItemValidator != nil {
		for i, item := range value {
			if err := v.ItemValidator.Validate(item); err != nil {
				return fmt.Errorf("item at index %d validation failed: %w", i, err)
			}
		}
	}
	
	return nil
}

// PasswordValidator 密码验证器
type PasswordValidator struct {
	MinLength        int
	MaxLength        int
	RequireUppercase bool
	RequireLowercase bool
	RequireDigits    bool
	RequireSymbols   bool
	ForbiddenWords   []string
}

// NewPasswordValidator 创建密码验证器
func NewPasswordValidator(minLen, maxLen int) *PasswordValidator {
	return &PasswordValidator{
		MinLength:        minLen,
		MaxLength:        maxLen,
		RequireUppercase: true,
		RequireLowercase: true,
		RequireDigits:    true,
		RequireSymbols:   true,
		ForbiddenWords:   []string{"password", "123456", "admin", "user"},
	}
}

// Validate 验证密码
func (v *PasswordValidator) Validate(value string) error {
	if len(value) < v.MinLength {
		return fmt.Errorf("password length %d is less than minimum %d", len(value), v.MinLength)
	}
	
	if v.MaxLength > 0 && len(value) > v.MaxLength {
		return fmt.Errorf("password length %d exceeds maximum %d", len(value), v.MaxLength)
	}
	
	hasUpper := false
	hasLower := false
	hasDigit := false
	hasSymbol := false
	
	for _, char := range value {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSymbol = true
		}
	}
	
	if v.RequireUppercase && !hasUpper {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}
	
	if v.RequireLowercase && !hasLower {
		return fmt.Errorf("password must contain at least one lowercase letter")
	}
	
	if v.RequireDigits && !hasDigit {
		return fmt.Errorf("password must contain at least one digit")
	}
	
	if v.RequireSymbols && !hasSymbol {
		return fmt.Errorf("password must contain at least one symbol")
	}
	
	// 检查禁用词
	lowerValue := strings.ToLower(value)
	for _, forbidden := range v.ForbiddenWords {
		if strings.Contains(lowerValue, strings.ToLower(forbidden)) {
			return fmt.Errorf("password contains forbidden word: %s", forbidden)
		}
	}
	
	return nil
}

// EnumValidator 枚举验证器
type EnumValidator[T StrictEnum] struct {
	Required bool
}

// NewEnumValidator 创建枚举验证器
func NewEnumValidator[T StrictEnum](required bool) *EnumValidator[T] {
	return &EnumValidator[T]{Required: required}
}

// Validate 验证枚举
func (v *EnumValidator[T]) Validate(value T) error {
	if v.Required && !value.IsValid() {
		return fmt.Errorf("enum value is required")
	}
	
	if !value.IsValid() {
		return fmt.Errorf("invalid enum value: %s, valid values: %v", value.String(), value.Values())
	}
	
	return nil
}

// IDValidator ID验证器
type IDValidator[T any] struct {
	Required bool
}

// NewIDValidator 创建ID验证器
func NewIDValidator[T any](required bool) *IDValidator[T] {
	return &IDValidator[T]{Required: required}
}

// Validate 验证ID
func (v *IDValidator[T]) Validate(value StrictID[T]) error {
	if v.Required && value.IsZero() {
		return fmt.Errorf("ID is required")
	}
	
	return nil
}

// TimestampValidator 时间戳验证器
type TimestampValidator struct {
	Required  bool
	AfterNow  bool
	BeforeNow bool
}

// NewTimestampValidator 创建时间戳验证器
func NewTimestampValidator(required, afterNow, beforeNow bool) *TimestampValidator {
	return &TimestampValidator{
		Required:  required,
		AfterNow:  afterNow,
		BeforeNow: beforeNow,
	}
}

// Validate 验证时间戳
func (v *TimestampValidator) Validate(value StrictTimestamp) error {
	if v.Required && value.IsZero() {
		return fmt.Errorf("timestamp is required")
	}
	
	if value.IsZero() {
		return nil // 非必需且为零值
	}
	
	now := Now()
	
	if v.AfterNow && !value.After(now) {
		return fmt.Errorf("timestamp must be after now")
	}
	
	if v.BeforeNow && !value.Before(now) {
		return fmt.Errorf("timestamp must be before now")
	}
	
	return nil
}

// CompositeValidator 复合验证器
type CompositeValidator[T any] struct {
	validators []Validator[T]
	stopOnFirst bool
}

// NewCompositeValidator 创建复合验证器
func NewCompositeValidator[T any](stopOnFirst bool, validators ...Validator[T]) *CompositeValidator[T] {
	return &CompositeValidator[T]{
		validators:  validators,
		stopOnFirst: stopOnFirst,
	}
}

// Validate 验证值
func (v *CompositeValidator[T]) Validate(value T) error {
	var errors []error
	
	for _, validator := range v.validators {
		if err := validator.Validate(value); err != nil {
			if v.stopOnFirst {
				return err
			}
			errors = append(errors, err)
		}
	}
	
	if len(errors) > 0 {
		errorMsgs := make([]string, len(errors))
		for i, err := range errors {
			errorMsgs[i] = err.Error()
		}
		return fmt.Errorf("validation failed: %s", strings.Join(errorMsgs, "; "))
	}
	
	return nil
}

// ConditionalValidator 条件验证器
type ConditionalValidator[T any] struct {
	condition func(T) bool
	validator Validator[T]
}

// NewConditionalValidator 创建条件验证器
func NewConditionalValidator[T any](condition func(T) bool, validator Validator[T]) *ConditionalValidator[T] {
	return &ConditionalValidator[T]{
		condition: condition,
		validator: validator,
	}
}

// Validate 验证值
func (v *ConditionalValidator[T]) Validate(value T) error {
	if v.condition(value) {
		return v.validator.Validate(value)
	}
	return nil
}