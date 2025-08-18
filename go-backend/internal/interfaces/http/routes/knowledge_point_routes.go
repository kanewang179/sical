package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"sical-go-backend/internal/infrastructure/repositories"
	"sical-go-backend/internal/interfaces/http/handlers"
)

// SetupKnowledgePointRoutes 设置知识点路由
func SetupKnowledgePointRoutes(router *gin.Engine, db *gorm.DB) {
	// 初始化仓储层
	knowledgePointRepo := repositories.NewKnowledgePointRepository(db)

	// 初始化处理器
	knowledgePointHandler := handlers.NewKnowledgePointHandler(knowledgePointRepo)

	// 知识点路由组
	knowledgeGroup := router.Group("/api/v1/knowledge-points")
	// TODO: 添加认证中间件
	{
		// 创建知识点
		knowledgeGroup.POST("/", knowledgePointHandler.CreateKnowledgePoint)
		
		// 获取单个知识点
		knowledgeGroup.GET("/:id", knowledgePointHandler.GetKnowledgePoint)
		
		// 按分类获取知识点
		knowledgeGroup.GET("/category", knowledgePointHandler.GetKnowledgePointsByCategory)
		
		// 按难度获取知识点
		knowledgeGroup.GET("/difficulty", knowledgePointHandler.GetKnowledgePointsByDifficulty)
		
		// 搜索知识点
		knowledgeGroup.GET("/search", knowledgePointHandler.SearchKnowledgePoints)
		
		// 更新知识点
		knowledgeGroup.PUT("/:id", knowledgePointHandler.UpdateKnowledgePoint)
		
		// 删除知识点
		knowledgeGroup.DELETE("/:id", knowledgePointHandler.DeleteKnowledgePoint)
	}
}