package routes

import (
	"github.com/gin-gonic/gin"
	"sical-go-backend/internal/domain/services"
	"sical-go-backend/internal/infrastructure/repositories"
	"sical-go-backend/internal/interfaces/http/handlers"
	"gorm.io/gorm"
)

// SetupLearningGoalRoutes 设置学习目标相关路由
func SetupLearningGoalRoutes(router *gin.RouterGroup, db *gorm.DB) {
	// 初始化仓储层
	learningGoalRepo := repositories.NewLearningGoalRepository(db)
	goalAnalysisRepo := repositories.NewGoalAnalysisRepository(db)
	
	// 初始化服务层
	goalAnalysisService := services.NewGoalAnalysisService(
		learningGoalRepo,
		goalAnalysisRepo,
		nil, // userRepo 暂时为空
	)
	
	// 初始化处理器
	learningGoalHandler := handlers.NewLearningGoalHandler(
		goalAnalysisService,
	)
	
	// 学习目标路由组
	goals := router.Group("/goals")
	{
		goals.POST("", learningGoalHandler.CreateGoal)           // 创建学习目标
		goals.GET("/:id", learningGoalHandler.GetGoal)          // 获取单个学习目标
		goals.GET("", learningGoalHandler.ListGoals)            // 获取学习目标列表
		goals.PUT("/:id", learningGoalHandler.UpdateGoal)       // 更新学习目标
		goals.DELETE("/:id", learningGoalHandler.DeleteGoal)    // 删除学习目标
		goals.POST("/:id/analyze", learningGoalHandler.AnalyzeGoal) // 分析学习目标
	}
}