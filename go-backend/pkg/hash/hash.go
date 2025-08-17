package hash

import (
	"golang.org/x/crypto/bcrypt"
)

// BcryptHasher bcrypt密码哈希器
type BcryptHasher struct {
	cost int
}

// NewBcryptHasher 创建bcrypt哈希器
func NewBcryptHasher(cost int) *BcryptHasher {
	if cost < bcrypt.MinCost || cost > bcrypt.MaxCost {
		cost = bcrypt.DefaultCost
	}
	return &BcryptHasher{cost: cost}
}

// HashPassword 哈希密码
func (h *BcryptHasher) HashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

// CheckPassword 验证密码
func (h *BcryptHasher) CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// DefaultHasher 默认哈希器实例
var DefaultHasher = NewBcryptHasher(bcrypt.DefaultCost)

// HashPassword 使用默认哈希器哈希密码
func HashPassword(password string) (string, error) {
	return DefaultHasher.HashPassword(password)
}

// CheckPassword 使用默认哈希器验证密码
func CheckPassword(hashedPassword, password string) error {
	return DefaultHasher.CheckPassword(hashedPassword, password)
}