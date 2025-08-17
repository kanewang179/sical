package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Claims JWT声明结构
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	TokenID  string `json:"token_id"`
	jwt.RegisteredClaims
}

// TokenPair token对
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

// JWTManager JWT管理器
type JWTManager struct {
	secret            []byte
	issuer            string
	accessExpiration  time.Duration
	refreshExpiration time.Duration
}

// NewJWTManager 创建JWT管理器
func NewJWTManager(secret, issuer string, accessExpiration, refreshExpiration time.Duration) *JWTManager {
	return &JWTManager{
		secret:            []byte(secret),
		issuer:            issuer,
		accessExpiration:  accessExpiration,
		refreshExpiration: refreshExpiration,
	}
}

// GenerateTokenPair 生成token对
func (j *JWTManager) GenerateTokenPair(userID uint, username, email, role string) (*TokenPair, error) {
	// 生成访问token
	accessToken, err := j.generateToken(userID, username, email, role, j.accessExpiration)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// 生成刷新token
	refreshToken, err := j.generateToken(userID, username, email, role, j.refreshExpiration)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int64(j.accessExpiration.Seconds()),
	}, nil
}

// generateToken 生成token
func (j *JWTManager) generateToken(userID uint, username, email, role string, expiration time.Duration) (string, error) {
	now := time.Now()
	tokenID := uuid.New().String()

	claims := &Claims{
		UserID:   userID,
		Username: username,
		Email:    email,
		Role:     role,
		TokenID:  tokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			Subject:   fmt.Sprintf("%d", userID),
			Audience:  []string{"sical-go-backend"},
			ExpiresAt: jwt.NewNumericDate(now.Add(expiration)),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        tokenID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(j.secret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken 验证token
func (j *JWTManager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证签名方法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return j.secret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// 验证issuer
	if claims.Issuer != j.issuer {
		return nil, fmt.Errorf("invalid issuer")
	}

	return claims, nil
}

// RefreshToken 刷新token
func (j *JWTManager) RefreshToken(refreshTokenString string) (*TokenPair, error) {
	// 验证刷新token
	claims, err := j.ValidateToken(refreshTokenString)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// 生成新的token对
	return j.GenerateTokenPair(claims.UserID, claims.Username, claims.Email, claims.Role)
}

// ExtractTokenFromHeader 从Authorization头中提取token
func ExtractTokenFromHeader(authHeader string) string {
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		return authHeader[7:]
	}
	return ""
}

// GetUserIDFromClaims 从claims中获取用户ID
func GetUserIDFromClaims(claims *Claims) uint {
	if claims == nil {
		return 0
	}
	return claims.UserID
}

// GetUsernameFromClaims 从claims中获取用户名
func GetUsernameFromClaims(claims *Claims) string {
	if claims == nil {
		return ""
	}
	return claims.Username
}

// GetRoleFromClaims 从claims中获取角色
func GetRoleFromClaims(claims *Claims) string {
	if claims == nil {
		return ""
	}
	return claims.Role
}

// GetTokenIDFromClaims 从claims中获取token ID
func GetTokenIDFromClaims(claims *Claims) string {
	if claims == nil {
		return ""
	}
	return claims.TokenID
}

// IsTokenExpired 检查token是否过期
func IsTokenExpired(claims *Claims) bool {
	if claims == nil || claims.ExpiresAt == nil {
		return true
	}
	return claims.ExpiresAt.Time.Before(time.Now())
}