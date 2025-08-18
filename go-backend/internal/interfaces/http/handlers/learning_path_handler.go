package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/services"
	"sical-go-backend/pkg/logger"
)

// LearningPathHandler 学习路径处理器
type LearningPathHandler struct {
	pathService *services.LearningPathService
}

// NewLearningPathHandler 创建学习路径处理器
func NewLearningPathHandler(pathService *services.LearningPathService) *LearningPathHandler {
	return &LearningPathHandler{
		pathService: pathService,
	}
}

// GeneratePathRequest 生成路径请求
type GeneratePathRequest struct {
	GoalID     string   `json:"goal_id" binding:"required"`
	Difficulty string   `json:"difficulty" binding:"required,oneof=beginner intermediate advanced"`
	TimeLimit  int      `json:"time_limit,omitempty"`
	FocusAreas []string `json:"focus_areas,omitempty"`
}

// CreatePathRequest 创建路径请求
type CreatePathRequest struct {
	GoalID            string `json:"goal_id" binding:"required"`
	Title             string `json:"title" binding:"required,min=1,max=255"`
	Description       string `json:"description"`
	Order             int    `json:"order" binding:"required,min=1"`
	EstimatedDuration int    `json:"estimated_duration" binding:"required,min=1"`
}

// UpdatePathRequest 更新路径请求
type UpdatePathRequest struct {
	Title             *string `json:"title,omitempty"`
	Description       *string `json:"description,omitempty"`
	Order             *int    `json:"order,omitempty"`
	EstimatedDuration *int    `json:"estimated_duration,omitempty"`
	Status            *string `json:"status,omitempty"`
}

// UpdateStatusRequest 更新状态请求
type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending in_progress completed"`
}

// PathResponse 路径响应
type PathResponse struct {
	ID                string                   `json:"id"`
	GoalID            string                   `json:"goal_id"`
	Title             string                   `json:"title"`
	Description       string                   `json:"description"`
	Order             int                      `json:"order"`
	EstimatedDuration int                      `json:"estimated_duration"`
	Status            string                   `json:"status"`
	CreatedAt         time.Time                `json:"created_at"`
	UpdatedAt         time.Time                `json:"updated_at"`
	KnowledgePoints   []KnowledgePointResponse `json:"knowledge_points,omitempty"`
}

// KnowledgePointResponse 知识点响应
type KnowledgePointResponse struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Difficulty  string `json:"difficulty"`
}

// GeneratedPathResponse 生成路径响应
type GeneratedPathResponse struct {
	Title       string                `json:"title"`
	Description string                `json:"description"`
	Steps       []PathStepResponse    `json:"steps"`
	TotalTime   int                   `json:"total_time"`
	Difficulty  string                `json:"difficulty"`
}

// PathStepResponse 路径步骤响应
type PathStepResponse struct {
	Title             string   `json:"title"`
	Description       string   `json:"description"`
	Order             int      `json:"order"`
	EstimatedDuration int      `json:"estimated_duration"`
	KnowledgePointIDs []string `json:"knowledge_point_ids"`
	Prerequisites     []string `json:"prerequisites"`
}

// GenerateLearningPath 生成学习路径
func (h *LearningPathHandler) GenerateLearningPath(c *gin.Context) {
	var req GeneratePathRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("绑定请求参数失败", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	// 解析目标ID
	goalID, err := uuid.Parse(req.GoalID)
	if err != nil {
		logger.Error("目标ID格式无效", logger.String("goal_id", req.GoalID))
		c.JSON(http.StatusBadRequest, gin.H{"error": "目标ID格式无效"})
		return
	}

	// 构建生成请求
	generateReq := &services.PathGenerationRequest{
		GoalID:     goalID,
		Difficulty: req.Difficulty,
		TimeLimit:  req.TimeLimit,
		FocusAreas: req.FocusAreas,
	}

	// 生成学习路径
	generatedPath, err := h.pathService.GenerateLearningPath(c.Request.Context(), generateReq)
	if err != nil {
		logger.Error("生成学习路径失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成学习路径失败"})
		return
	}

	// 转换响应
	response := h.convertToGeneratedPathResponse(generatedPath)

	logger.Info("学习路径生成成功", logger.String("goal_id", req.GoalID))
	c.JSON(http.StatusOK, gin.H{"data": response})
}

// CreateLearningPath 创建学习路径
func (h *LearningPathHandler) CreateLearningPath(c *gin.Context) {
	var req CreatePathRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("绑定请求参数失败", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	// 解析目标ID
	goalID, err := uuid.Parse(req.GoalID)
	if err != nil {
		logger.Error("目标ID格式无效", logger.String("goal_id", req.GoalID))
		c.JSON(http.StatusBadRequest, gin.H{"error": "目标ID格式无效"})
		return
	}

	// 构建生成路径（单步）
	generatedPath := &services.GeneratedPath{
		Title:       req.Title,
		Description: req.Description,
		Steps: []services.PathStep{
			{
				Title:             req.Title,
				Description:       req.Description,
				Order:             req.Order,
				EstimatedDuration: req.EstimatedDuration,
				KnowledgePointIDs: []string{}, // 暂时为空
				Prerequisites:     []string{}, // 暂时为空
			},
		},
		TotalTime:  req.EstimatedDuration,
		Difficulty: "intermediate", // 默认中等难度
	}

	// 创建学习路径
	paths, err := h.pathService.CreateLearningPath(c.Request.Context(), goalID, generatedPath)
	if err != nil {
		logger.Error("创建学习路径失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建学习路径失败"})
		return
	}

	if len(paths) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建学习路径失败"})
		return
	}

	// 转换响应
	response := h.convertToPathResponse(paths[0])

	logger.Info("学习路径创建成功", logger.String("path_id", paths[0].ID.String()))
	c.JSON(http.StatusCreated, gin.H{"data": response})
}

// GetLearningPaths 获取学习路径列表
func (h *LearningPathHandler) GetLearningPaths(c *gin.Context) {
	goalIDStr := c.Query("goal_id")
	if goalIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少目标ID参数"})
		return
	}

	goalID, err := uuid.Parse(goalIDStr)
	if err != nil {
		logger.Error("目标ID格式无效", logger.String("goal_id", goalIDStr))
		c.JSON(http.StatusBadRequest, gin.H{"error": "目标ID格式无效"})
		return
	}

	paths, err := h.pathService.GetLearningPaths(c.Request.Context(), goalID)
	if err != nil {
		logger.Error("获取学习路径列表失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取学习路径列表失败"})
		return
	}

	// 转换响应
	var responses []PathResponse
	for _, path := range paths {
		responses = append(responses, h.convertToPathResponse(path))
	}

	c.JSON(http.StatusOK, gin.H{
		"data": responses,
		"count": len(responses),
	})
}

// GetLearningPath 获取单个学习路径
func (h *LearningPathHandler) GetLearningPath(c *gin.Context) {
	pathIDStr := c.Param("id")
	pathID, err := uuid.Parse(pathIDStr)
	if err != nil {
		logger.Error("路径ID格式无效", logger.String("path_id", pathIDStr))
		c.JSON(http.StatusBadRequest, gin.H{"error": "路径ID格式无效"})
		return
	}

	path, err := h.pathService.GetLearningPath(c.Request.Context(), pathID)
	if err != nil {
		logger.Error("获取学习路径失败", logger.String("error", err.Error()))
		c.JSON(http.StatusNotFound, gin.H{"error": "学习路径不存在"})
		return
	}

	// 转换响应
	response := h.convertToPathResponse(path)

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// UpdateLearningPathStatus 更新学习路径状态
func (h *LearningPathHandler) UpdateLearningPathStatus(c *gin.Context) {
	pathIDStr := c.Param("id")
	pathID, err := uuid.Parse(pathIDStr)
	if err != nil {
		logger.Error("路径ID格式无效", logger.String("path_id", pathIDStr))
		c.JSON(http.StatusBadRequest, gin.H{"error": "路径ID格式无效"})
		return
	}

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("绑定请求参数失败", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if err := h.pathService.UpdateLearningPathStatus(c.Request.Context(), pathID, req.Status); err != nil {
		logger.Error("更新学习路径状态失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新学习路径状态失败"})
		return
	}

	logger.Info("学习路径状态更新成功", 
		logger.String("path_id", pathID.String()),
		logger.String("status", req.Status))
	c.JSON(http.StatusOK, gin.H{"message": "状态更新成功"})
}

// DeleteLearningPath 删除学习路径
func (h *LearningPathHandler) DeleteLearningPath(c *gin.Context) {
	pathIDStr := c.Param("id")
	pathID, err := uuid.Parse(pathIDStr)
	if err != nil {
		logger.Error("路径ID格式无效", logger.String("path_id", pathIDStr))
		c.JSON(http.StatusBadRequest, gin.H{"error": "路径ID格式无效"})
		return
	}

	if err := h.pathService.DeleteLearningPath(c.Request.Context(), pathID); err != nil {
		logger.Error("删除学习路径失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除学习路径失败"})
		return
	}

	logger.Info("学习路径删除成功", logger.String("path_id", pathID.String()))
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// convertToPathResponse 转换为路径响应
func (h *LearningPathHandler) convertToPathResponse(path *entities.LearningPath) PathResponse {
	response := PathResponse{
		ID:                path.ID.String(),
		GoalID:            path.GoalID.String(),
		Title:             path.Title,
		Description:       path.Description,
		Order:             path.Order,
		EstimatedDuration: path.EstimatedDuration,
		Status:            path.Status,
		CreatedAt:         path.CreatedAt,
		UpdatedAt:         path.UpdatedAt,
	}

	// 转换知识点
	for _, kp := range path.KnowledgePoints {
		response.KnowledgePoints = append(response.KnowledgePoints, KnowledgePointResponse{
			ID:          kp.ID.String(),
			Title:       kp.Title,
			Description: kp.Description,
			Category:    kp.Category,
			Difficulty:  kp.Difficulty,
		})
	}

	return response
}

// convertToGeneratedPathResponse 转换为生成路径响应
func (h *LearningPathHandler) convertToGeneratedPathResponse(path *services.GeneratedPath) GeneratedPathResponse {
	response := GeneratedPathResponse{
		Title:       path.Title,
		Description: path.Description,
		TotalTime:   path.TotalTime,
		Difficulty:  path.Difficulty,
	}

	// 转换步骤
	for _, step := range path.Steps {
		response.Steps = append(response.Steps, PathStepResponse{
			Title:             step.Title,
			Description:       step.Description,
			Order:             step.Order,
			EstimatedDuration: step.EstimatedDuration,
			KnowledgePointIDs: step.KnowledgePointIDs,
			Prerequisites:     step.Prerequisites,
		})
	}

	return response
}