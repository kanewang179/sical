package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"sical-go-backend/internal/domain/services"
	"sical-go-backend/internal/infrastructure/repositories"
	"sical-go-backend/internal/interfaces/http/handlers"
)

// SetupLearningPathRoutes 设置学习路径路由
func SetupLearningPathRoutes(router *gin.Engine, db *gorm.DB) {
	// 初始化仓储层
	learningGoalRepo := repositories.NewLearningGoalRepository(db)
	learningPathRepo := repositories.NewLearningPathRepository(db)
	knowledgePointRepo := repositories.NewKnowledgePointRepository(db)

	// 初始化服务层
	pathService := services.NewLearningPathService(
		learningPathRepo,
		learningGoalRepo,
		knowledgePointRepo,
	)

	// 初始化处理器
	pathHandler := handlers.NewLearningPathHandler(pathService)

	// 学习路径路由组
	pathGroup := router.Group("/api/v1/learning-paths")
	// TODO: 添加认证中间件
	{
		// 生成学习路径
		pathGroup.POST("/generate", pathHandler.GenerateLearningPath)
		
		// 创建学习路径
		pathGroup.POST("/", pathHandler.CreateLearningPath)
		
		// 获取学习路径列表（按目标ID）
		pathGroup.GET("/", pathHandler.GetLearningPaths)
		
		// 获取单个学习路径
		pathGroup.GET("/:id", pathHandler.GetLearningPath)
		
		// 更新学习路径状态
		pathGroup.PATCH("/:id/status", pathHandler.UpdateLearningPathStatus)
		
		// 删除学习路径
		pathGroup.DELETE("/:id", pathHandler.DeleteLearningPath)
	}
}