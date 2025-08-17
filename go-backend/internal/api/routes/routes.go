package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"sical-go-backend/internal/api/handlers"
	"sical-go-backend/internal/api/middleware"
	"sical-go-backend/internal/interfaces/http/routes"
)

// Router 路由配置
type Router struct {
	userHandler    *handlers.UserHandler
	authMiddleware *middleware.AuthMiddleware
	db             *gorm.DB
}

// NewRouter 创建路由实例
func NewRouter(
	userHandler *handlers.UserHandler,
	authMiddleware *middleware.AuthMiddleware,
	db *gorm.DB,
) *Router {
	return &Router{
		userHandler:    userHandler,
		authMiddleware: authMiddleware,
		db:             db,
	}
}

// SetupRoutes 设置所有路由
func (r *Router) SetupRoutes(engine *gin.Engine) {
	// 健康检查
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "服务运行正常",
		})
	})

	// API v1 路由组
	v1 := engine.Group("/api/v1")
	{
		// 认证相关路由（无需认证）
		auth := v1.Group("/auth")
		{
			auth.POST("/register", r.userHandler.Register)
			auth.POST("/login", r.userHandler.Login)
			auth.POST("/refresh", r.userHandler.RefreshToken)
		}

		// 用户相关路由（需要认证）
		user := v1.Group("/user")
		user.Use(r.authMiddleware.RequireAuth())
		{
			user.POST("/logout", r.userHandler.Logout)
			user.GET("/profile", r.userHandler.GetProfile)
			user.PUT("/profile", r.userHandler.UpdateProfile)
			user.PUT("/password", r.userHandler.ChangePassword)
		}

		// 学习目标相关路由（需要认证）
		learning := v1.Group("/learning")
		learning.Use(r.authMiddleware.RequireAuth())
		{
			routes.SetupLearningGoalRoutes(learning, r.db)
		}

		// 管理员相关路由（需要管理员权限）
		admin := v1.Group("/admin")
		admin.Use(r.authMiddleware.RequireAdmin())
		{
			// 用户管理
			users := admin.Group("/users")
			{
				users.GET("", r.userHandler.ListUsers)
				users.GET("/:id", r.userHandler.GetUserByID)
				users.PUT("/:id/status", r.userHandler.UpdateUserStatus)
				users.PUT("/:id/role", r.userHandler.UpdateUserRole)
			}
		}
	}
}