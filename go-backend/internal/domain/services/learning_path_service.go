package services

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"github.com/google/uuid"
	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
	"sical-go-backend/pkg/logger"
)

// LearningPathService 学习路径服务
type LearningPathService struct {
	pathRepo      repositories.LearningPathRepository
	goalRepo      repositories.LearningGoalRepository
	knowledgeRepo repositories.KnowledgePointRepository
}

// NewLearningPathService 创建学习路径服务
func NewLearningPathService(
	pathRepo repositories.LearningPathRepository,
	goalRepo repositories.LearningGoalRepository,
	knowledgeRepo repositories.KnowledgePointRepository,
) *LearningPathService {
	return &LearningPathService{
		pathRepo:      pathRepo,
		goalRepo:      goalRepo,
		knowledgeRepo: knowledgeRepo,
	}
}

// PathGenerationRequest 路径生成请求
type PathGenerationRequest struct {
	GoalID     uuid.UUID `json:"goal_id"`
	Difficulty string    `json:"difficulty"`
	TimeLimit  int       `json:"time_limit"` // 时间限制(小时)
	FocusAreas []string  `json:"focus_areas"` // 重点关注领域
}

// PathStep 路径步骤
type PathStep struct {
	Title             string   `json:"title"`
	Description       string   `json:"description"`
	Order             int      `json:"order"`
	EstimatedDuration int      `json:"estimated_duration"`
	KnowledgePointIDs []string `json:"knowledge_point_ids"`
	Prerequisites     []string `json:"prerequisites"`
}

// GeneratedPath 生成的学习路径
type GeneratedPath struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Steps       []PathStep `json:"steps"`
	TotalTime   int        `json:"total_time"`
	Difficulty  string     `json:"difficulty"`
}

// GenerateLearningPath 生成学习路径
func (s *LearningPathService) GenerateLearningPath(ctx context.Context, req *PathGenerationRequest) (*GeneratedPath, error) {
	// 1. 获取学习目标
	goal, err := s.goalRepo.GetByID(ctx, req.GoalID)
	if err != nil {
		return nil, fmt.Errorf("获取学习目标失败: %w", err)
	}

	// 2. 根据目标类别和难度获取相关知识点
	knowledgePoints, err := s.getRelevantKnowledgePoints(ctx, goal.Category, req.Difficulty, req.FocusAreas)
	if err != nil {
		return nil, fmt.Errorf("获取相关知识点失败: %w", err)
	}

	// 3. 分析知识点依赖关系
	orderedPoints := s.analyzeKnowledgeDependencies(knowledgePoints)

	// 4. 生成学习路径步骤
	steps := s.generatePathSteps(orderedPoints, req.TimeLimit)

	// 5. 计算总时间
	totalTime := s.calculateTotalTime(steps)

	generatedPath := &GeneratedPath{
		Title:       fmt.Sprintf("%s - 学习路径", goal.Title),
		Description: fmt.Sprintf("基于目标'%s'生成的个性化学习路径", goal.Title),
		Steps:       steps,
		TotalTime:   totalTime,
		Difficulty:  req.Difficulty,
	}

	logger.Info("学习路径生成完成", 
		logger.String("goal_id", req.GoalID.String()),
		logger.Int("steps_count", len(steps)),
		logger.Int("total_time", totalTime))

	return generatedPath, nil
}

// CreateLearningPath 创建学习路径
func (s *LearningPathService) CreateLearningPath(ctx context.Context, goalID uuid.UUID, generatedPath *GeneratedPath) ([]*entities.LearningPath, error) {
	var paths []*entities.LearningPath

	for _, step := range generatedPath.Steps {
		path := &entities.LearningPath{
			GoalID:            goalID,
			Title:             step.Title,
			Description:       step.Description,
			Order:             step.Order,
			EstimatedDuration: step.EstimatedDuration,
			Status:            "pending",
		}

		// 创建路径
		if err := s.pathRepo.Create(ctx, path); err != nil {
			return nil, fmt.Errorf("创建学习路径失败: %w", err)
		}

		// 关联知识点
		if err := s.associateKnowledgePoints(ctx, path, step.KnowledgePointIDs); err != nil {
			logger.Error("关联知识点失败", logger.String("error", err.Error()))
			// 继续处理，不中断整个流程
		}

		paths = append(paths, path)
	}

	logger.Info("学习路径创建完成", 
		logger.String("goal_id", goalID.String()),
		logger.Int("paths_count", len(paths)))

	return paths, nil
}

// GetLearningPaths 获取学习路径列表
func (s *LearningPathService) GetLearningPaths(ctx context.Context, goalID uuid.UUID) ([]*entities.LearningPath, error) {
	return s.pathRepo.GetByGoalID(ctx, goalID)
}

// GetLearningPath 获取单个学习路径
func (s *LearningPathService) GetLearningPath(ctx context.Context, id uuid.UUID) (*entities.LearningPath, error) {
	return s.pathRepo.GetByID(ctx, id)
}

// UpdateLearningPathStatus 更新学习路径状态
func (s *LearningPathService) UpdateLearningPathStatus(ctx context.Context, id uuid.UUID, status string) error {
	// 验证状态值
	validStatuses := []string{"pending", "in_progress", "completed"}
	if !s.isValidStatus(status, validStatuses) {
		return fmt.Errorf("无效的状态值: %s", status)
	}

	return s.pathRepo.UpdateStatus(ctx, id, status)
}

// DeleteLearningPath 删除学习路径
func (s *LearningPathService) DeleteLearningPath(ctx context.Context, id uuid.UUID) error {
	return s.pathRepo.Delete(ctx, id)
}

// getRelevantKnowledgePoints 获取相关知识点
func (s *LearningPathService) getRelevantKnowledgePoints(ctx context.Context, category, difficulty string, focusAreas []string) ([]*entities.KnowledgePoint, error) {
	// 根据类别获取知识点
	categoryPoints, err := s.knowledgeRepo.GetByCategory(ctx, category)
	if err != nil {
		return nil, err
	}

	// 根据难度过滤
	difficultyPoints, err := s.knowledgeRepo.GetByDifficulty(ctx, difficulty)
	if err != nil {
		return nil, err
	}

	// 合并并去重
	pointMap := make(map[uuid.UUID]*entities.KnowledgePoint)
	for _, point := range categoryPoints {
		pointMap[point.ID] = point
	}
	for _, point := range difficultyPoints {
		if _, exists := pointMap[point.ID]; exists {
			// 如果类别和难度都匹配，优先级更高
			if point.Category == category && point.Difficulty == difficulty {
				pointMap[point.ID] = point
			}
		} else {
			pointMap[point.ID] = point
		}
	}

	// 根据关注领域进一步筛选
	var relevantPoints []*entities.KnowledgePoint
	for _, point := range pointMap {
		if s.isRelevantToFocusAreas(point, focusAreas) {
			relevantPoints = append(relevantPoints, point)
		}
	}

	return relevantPoints, nil
}

// analyzeKnowledgeDependencies 分析知识点依赖关系
func (s *LearningPathService) analyzeKnowledgeDependencies(points []*entities.KnowledgePoint) []*entities.KnowledgePoint {
	// 简化的依赖分析：根据难度和前置条件排序
	type pointWithScore struct {
		point *entities.KnowledgePoint
		score int
	}

	var scoredPoints []pointWithScore
	for _, point := range points {
		score := s.calculateDependencyScore(point)
		scoredPoints = append(scoredPoints, pointWithScore{point: point, score: score})
	}

	// 按分数排序（分数低的先学）
	sort.Slice(scoredPoints, func(i, j int) bool {
		return scoredPoints[i].score < scoredPoints[j].score
	})

	var orderedPoints []*entities.KnowledgePoint
	for _, sp := range scoredPoints {
		orderedPoints = append(orderedPoints, sp.point)
	}

	return orderedPoints
}

// generatePathSteps 生成路径步骤
func (s *LearningPathService) generatePathSteps(points []*entities.KnowledgePoint, timeLimit int) []PathStep {
	var steps []PathStep
	totalTime := 0

	for i, point := range points {
		// 估算学习时间（基于难度）
		estimatedTime := s.estimateStudyTime(point)
		
		// 检查时间限制
		if timeLimit > 0 && totalTime+estimatedTime > timeLimit {
			break
		}

		step := PathStep{
			Title:             point.Title,
			Description:       point.Description,
			Order:             i + 1,
			EstimatedDuration: estimatedTime,
			KnowledgePointIDs: []string{point.ID.String()},
			Prerequisites:     s.parsePrerequisites(point.Prerequisites),
		}

		steps = append(steps, step)
		totalTime += estimatedTime
	}

	return steps
}

// calculateTotalTime 计算总时间
func (s *LearningPathService) calculateTotalTime(steps []PathStep) int {
	total := 0
	for _, step := range steps {
		total += step.EstimatedDuration
	}
	return total
}

// associateKnowledgePoints 关联知识点
func (s *LearningPathService) associateKnowledgePoints(ctx context.Context, path *entities.LearningPath, knowledgePointIDs []string) error {
	// 这里需要实现多对多关系的关联
	// 由于GORM的限制，这里简化处理
	// 在实际项目中，可能需要手动处理关联表
	return nil
}

// isRelevantToFocusAreas 检查是否与关注领域相关
func (s *LearningPathService) isRelevantToFocusAreas(point *entities.KnowledgePoint, focusAreas []string) bool {
	if len(focusAreas) == 0 {
		return true // 没有指定关注领域，所有知识点都相关
	}

	for _, area := range focusAreas {
		if strings.Contains(strings.ToLower(point.Title), strings.ToLower(area)) ||
			strings.Contains(strings.ToLower(point.Description), strings.ToLower(area)) ||
			strings.Contains(strings.ToLower(point.Category), strings.ToLower(area)) {
			return true
		}
	}

	return false
}

// calculateDependencyScore 计算依赖分数
func (s *LearningPathService) calculateDependencyScore(point *entities.KnowledgePoint) int {
	score := 0

	// 根据难度评分
	switch point.Difficulty {
	case "beginner":
		score += 1
	case "intermediate":
		score += 2
	case "advanced":
		score += 3
	}

	// 根据前置条件数量评分
	var prerequisites []string
	if point.Prerequisites != "" {
		json.Unmarshal([]byte(point.Prerequisites), &prerequisites)
		score += len(prerequisites)
	}

	return score
}

// estimateStudyTime 估算学习时间
func (s *LearningPathService) estimateStudyTime(point *entities.KnowledgePoint) int {
	// 基于难度的基础时间估算
	baseTime := map[string]int{
		"beginner":     2, // 2小时
		"intermediate": 4, // 4小时
		"advanced":     6, // 6小时
	}

	if time, exists := baseTime[point.Difficulty]; exists {
		return time
	}
	return 3 // 默认3小时
}

// parsePrerequisites 解析前置条件
func (s *LearningPathService) parsePrerequisites(prerequisitesJSON string) []string {
	if prerequisitesJSON == "" {
		return []string{}
	}

	var prerequisites []string
	if err := json.Unmarshal([]byte(prerequisitesJSON), &prerequisites); err != nil {
		return []string{}
	}

	return prerequisites
}

// isValidStatus 验证状态值
func (s *LearningPathService) isValidStatus(status string, validStatuses []string) bool {
	for _, validStatus := range validStatuses {
		if status == validStatus {
			return true
		}
	}
	return false
}