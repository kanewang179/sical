package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
	"sical-go-backend/pkg/logger"
)

// KnowledgePointHandler 知识点处理器
type KnowledgePointHandler struct {
	knowledgePointRepo repositories.KnowledgePointRepository
}

// NewKnowledgePointHandler 创建知识点处理器
func NewKnowledgePointHandler(knowledgePointRepo repositories.KnowledgePointRepository) *KnowledgePointHandler {
	return &KnowledgePointHandler{
		knowledgePointRepo: knowledgePointRepo,
	}
}

// CreateKnowledgePointRequest 创建知识点请求
type CreateKnowledgePointRequest struct {
	Title         string `json:"title" binding:"required,min=1,max=255"`
	Description   string `json:"description"`
	Content       string `json:"content" binding:"required"`
	Category      string `json:"category" binding:"required"`
	Difficulty    string `json:"difficulty" binding:"required,oneof=beginner intermediate advanced"`
	Resources     string `json:"resources"`
	Prerequisites string `json:"prerequisites"`
}

// UpdateKnowledgePointRequest 更新知识点请求
type UpdateKnowledgePointRequest struct {
	Title         *string `json:"title,omitempty"`
	Description   *string `json:"description,omitempty"`
	Content       *string `json:"content,omitempty"`
	Category      *string `json:"category,omitempty"`
	Difficulty    *string `json:"difficulty,omitempty"`
	Resources     *string `json:"resources,omitempty"`
	Prerequisites *string `json:"prerequisites,omitempty"`
}

// KnowledgePointDetailResponse 知识点详细响应
type KnowledgePointDetailResponse struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Content       string    `json:"content"`
	Category      string    `json:"category"`
	Difficulty    string    `json:"difficulty"`
	Resources     string    `json:"resources"`
	Prerequisites string    `json:"prerequisites"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// CreateKnowledgePoint 创建知识点
func (h *KnowledgePointHandler) CreateKnowledgePoint(c *gin.Context) {
	var req CreateKnowledgePointRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("绑定请求参数失败", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	// 创建知识点实体
	knowledgePoint := &entities.KnowledgePoint{
		ID:            uuid.New(),
		Title:         req.Title,
		Description:   req.Description,
		Content:       req.Content,
		Category:      req.Category,
		Difficulty:    req.Difficulty,
		Resources:     req.Resources,
		Prerequisites: req.Prerequisites,
	}

	// 保存到数据库
	if err := h.knowledgePointRepo.Create(c.Request.Context(), knowledgePoint); err != nil {
		logger.Error("创建知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建知识点失败"})
		return
	}

	// 转换响应
	response := h.convertToKnowledgePointDetailResponse(knowledgePoint)

	logger.Info("知识点创建成功", logger.String("knowledge_point_id", knowledgePoint.ID.String()))
	c.JSON(http.StatusCreated, gin.H{"data": response})
}

// GetKnowledgePoint 获取单个知识点
func (h *KnowledgePointHandler) GetKnowledgePoint(c *gin.Context) {
	knowledgePointIDStr := c.Param("id")
	knowledgePointID, err := uuid.Parse(knowledgePointIDStr)
	if err != nil {
		logger.Error("知识点ID格式无效", logger.String("knowledge_point_id", knowledgePointIDStr))
		c.JSON(http.StatusBadRequest, gin.H{"error": "知识点ID格式无效"})
		return
	}

	knowledgePoint, err := h.knowledgePointRepo.GetByID(c.Request.Context(), knowledgePointID)
	if err != nil {
		logger.Error("获取知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusNotFound, gin.H{"error": "知识点不存在"})
		return
	}

	// 转换响应
	response := h.convertToKnowledgePointDetailResponse(knowledgePoint)

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// GetKnowledgePointsByCategory 按分类获取知识点
func (h *KnowledgePointHandler) GetKnowledgePointsByCategory(c *gin.Context) {
	category := c.Query("category")
	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少分类参数"})
		return
	}

	knowledgePoints, err := h.knowledgePointRepo.GetByCategory(c.Request.Context(), category)
	if err != nil {
		logger.Error("按分类获取知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取知识点失败"})
		return
	}

	// 转换响应
	var responses []KnowledgePointDetailResponse
	for _, kp := range knowledgePoints {
		responses = append(responses, h.convertToKnowledgePointDetailResponse(kp))
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  responses,
		"count": len(responses),
	})
}

// GetKnowledgePointsByDifficulty 按难度获取知识点
func (h *KnowledgePointHandler) GetKnowledgePointsByDifficulty(c *gin.Context) {
	difficulty := c.Query("difficulty")
	if difficulty == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少难度参数"})
		return
	}

	// 验证难度值
	if difficulty != "beginner" && difficulty != "intermediate" && difficulty != "advanced" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的难度值"})
		return
	}

	knowledgePoints, err := h.knowledgePointRepo.GetByDifficulty(c.Request.Context(), difficulty)
	if err != nil {
		logger.Error("按难度获取知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取知识点失败"})
		return
	}

	// 转换响应
	var responses []KnowledgePointDetailResponse
	for _, kp := range knowledgePoints {
		responses = append(responses, h.convertToKnowledgePointDetailResponse(kp))
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  responses,
		"count": len(responses),
	})
}

// SearchKnowledgePoints 搜索知识点
func (h *KnowledgePointHandler) SearchKnowledgePoints(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少搜索关键词"})
		return
	}

	// 获取分页参数
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	knowledgePoints, err := h.knowledgePointRepo.Search(c.Request.Context(), query)
	if err != nil {
		logger.Error("搜索知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "搜索知识点失败"})
		return
	}

	// 转换响应
	var responses []KnowledgePointDetailResponse
	for _, kp := range knowledgePoints {
		responses = append(responses, h.convertToKnowledgePointDetailResponse(kp))
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   responses,
		"count":  len(responses),
		"limit":  limit,
		"offset": offset,
	})
}

// UpdateKnowledgePoint 更新知识点
func (h *KnowledgePointHandler) UpdateKnowledgePoint(c *gin.Context) {
	knowledgePointIDStr := c.Param("id")
	knowledgePointID, err := uuid.Parse(knowledgePointIDStr)
	if err != nil {
		logger.Error("知识点ID格式无效", logger.String("knowledge_point_id", knowledgePointIDStr))
		c.JSON(http.StatusBadRequest, gin.H{"error": "知识点ID格式无效"})
		return
	}

	var req UpdateKnowledgePointRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("绑定请求参数失败", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	// 获取现有知识点
	knowledgePoint, err := h.knowledgePointRepo.GetByID(c.Request.Context(), knowledgePointID)
	if err != nil {
		logger.Error("获取知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusNotFound, gin.H{"error": "知识点不存在"})
		return
	}

	// 更新字段
	if req.Title != nil {
		knowledgePoint.Title = *req.Title
	}
	if req.Description != nil {
		knowledgePoint.Description = *req.Description
	}
	if req.Content != nil {
		knowledgePoint.Content = *req.Content
	}
	if req.Category != nil {
		knowledgePoint.Category = *req.Category
	}
	if req.Difficulty != nil {
		// 验证难度值
		if *req.Difficulty != "beginner" && *req.Difficulty != "intermediate" && *req.Difficulty != "advanced" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "无效的难度值"})
			return
		}
		knowledgePoint.Difficulty = *req.Difficulty
	}
	if req.Resources != nil {
		knowledgePoint.Resources = *req.Resources
	}
	if req.Prerequisites != nil {
		knowledgePoint.Prerequisites = *req.Prerequisites
	}

	// 保存更新
	if err := h.knowledgePointRepo.Update(c.Request.Context(), knowledgePoint); err != nil {
		logger.Error("更新知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新知识点失败"})
		return
	}

	// 转换响应
	response := h.convertToKnowledgePointDetailResponse(knowledgePoint)

	logger.Info("知识点更新成功", logger.String("knowledge_point_id", knowledgePoint.ID.String()))
	c.JSON(http.StatusOK, gin.H{"data": response})
}

// DeleteKnowledgePoint 删除知识点
func (h *KnowledgePointHandler) DeleteKnowledgePoint(c *gin.Context) {
	knowledgePointIDStr := c.Param("id")
	knowledgePointID, err := uuid.Parse(knowledgePointIDStr)
	if err != nil {
		logger.Error("知识点ID格式无效", logger.String("knowledge_point_id", knowledgePointIDStr))
		c.JSON(http.StatusBadRequest, gin.H{"error": "知识点ID格式无效"})
		return
	}

	if err := h.knowledgePointRepo.Delete(c.Request.Context(), knowledgePointID); err != nil {
		logger.Error("删除知识点失败", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除知识点失败"})
		return
	}

	logger.Info("知识点删除成功", logger.String("knowledge_point_id", knowledgePointID.String()))
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// convertToKnowledgePointDetailResponse 转换为知识点详细响应
func (h *KnowledgePointHandler) convertToKnowledgePointDetailResponse(kp *entities.KnowledgePoint) KnowledgePointDetailResponse {
	return KnowledgePointDetailResponse{
		ID:            kp.ID.String(),
		Title:         kp.Title,
		Description:   kp.Description,
		Content:       kp.Content,
		Category:      kp.Category,
		Difficulty:    kp.Difficulty,
		Resources:     kp.Resources,
		Prerequisites: kp.Prerequisites,
		CreatedAt:     kp.CreatedAt,
		UpdatedAt:     kp.UpdatedAt,
	}
}