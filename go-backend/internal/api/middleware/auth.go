package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"sical-go-backend/pkg/jwt"
	"sical-go-backend/pkg/response"
)

// AuthMiddleware JWT认证中间件
type AuthMiddleware struct {
	jwtManager *jwt.JWTManager
}

// NewAuthMiddleware 创建认证中间件
func NewAuthMiddleware(jwtManager *jwt.JWTManager) *AuthMiddleware {
	return &AuthMiddleware{
		jwtManager: jwtManager,
	}
}

// RequireAuth 需要认证的中间件
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从Header中提取Token
		token := m.extractTokenFromHeader(c)
		if token == "" {
			response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "缺少访问令牌")
			c.Abort()
			return
		}

		// 验证Token
		claims, err := m.jwtManager.ValidateToken(token)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "无效的访问令牌")
			c.Abort()
			return
		}

		// 将用户信息存储到上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("user_role", claims.Role)
		c.Set("token_id", claims.TokenID)

		c.Next()
	}
}

// RequireRole 需要特定角色的中间件
func (m *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 先执行认证
		m.RequireAuth()(c)
		if c.IsAborted() {
			return
		}

		// 检查用户角色
		userRole, exists := c.Get("user_role")
		if !exists {
			response.Error(c, http.StatusForbidden, response.CodeForbidden, "用户角色信息缺失")
			c.Abort()
			return
		}

		role := userRole.(string)
		for _, requiredRole := range roles {
			if role == requiredRole {
				c.Next()
				return
			}
		}

		response.Error(c, http.StatusForbidden, response.CodeForbidden, "权限不足")
		c.Abort()
	}
}

// RequireAdmin 需要管理员权限的中间件
func (m *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return m.RequireRole("admin", "super_admin")
}

// RequireSuperAdmin 需要超级管理员权限的中间件
func (m *AuthMiddleware) RequireSuperAdmin() gin.HandlerFunc {
	return m.RequireRole("super_admin")
}

// OptionalAuth 可选认证中间件（不强制要求认证）
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从Header中提取Token
		token := m.extractTokenFromHeader(c)
		if token == "" {
			c.Next()
			return
		}

		// 验证Token
		claims, err := m.jwtManager.ValidateToken(token)
		if err != nil {
			// Token无效，但不阻止请求继续
			c.Next()
			return
		}

		// 将用户信息存储到上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("user_role", claims.Role)
		c.Set("token_id", claims.TokenID)

		c.Next()
	}
}

// extractTokenFromHeader 从请求头中提取Token
func (m *AuthMiddleware) extractTokenFromHeader(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return ""
	}

	// 检查Bearer前缀
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}

	return parts[1]
}

// GetCurrentUser 获取当前用户信息的辅助函数
func GetCurrentUser(c *gin.Context) (userID uint, username string, role string, exists bool) {
	userIDVal, userIDExists := c.Get("user_id")
	usernameVal, usernameExists := c.Get("username")
	roleVal, roleExists := c.Get("user_role")

	if !userIDExists || !usernameExists || !roleExists {
		return 0, "", "", false
	}

	return userIDVal.(uint), usernameVal.(string), roleVal.(string), true
}

// GetCurrentUserID 获取当前用户ID的辅助函数
func GetCurrentUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	return userID.(uint), true
}

// IsAuthenticated 检查是否已认证的辅助函数
func IsAuthenticated(c *gin.Context) bool {
	_, exists := c.Get("user_id")
	return exists
}

// HasRole 检查是否具有指定角色的辅助函数
func HasRole(c *gin.Context, role string) bool {
	userRole, exists := c.Get("user_role")
	if !exists {
		return false
	}
	return userRole.(string) == role
}

// HasAnyRole 检查是否具有任一指定角色的辅助函数
func HasAnyRole(c *gin.Context, roles ...string) bool {
	userRole, exists := c.Get("user_role")
	if !exists {
		return false
	}

	role := userRole.(string)
	for _, requiredRole := range roles {
		if role == requiredRole {
			return true
		}
	}
	return false
}