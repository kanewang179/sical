package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
	"sical-go-backend/pkg/logger"
)

// GoalAnalysisService 学习目标分析服务
type GoalAnalysisService struct {
	goalRepo     repositories.LearningGoalRepository
	analysisRepo repositories.GoalAnalysisRepository
	userRepo     repositories.UserRepository
}

// NewGoalAnalysisService 创建学习目标分析服务
func NewGoalAnalysisService(
	goalRepo repositories.LearningGoalRepository,
	analysisRepo repositories.GoalAnalysisRepository,
	userRepo repositories.UserRepository,
) *GoalAnalysisService {
	return &GoalAnalysisService{
		goalRepo:     goalRepo,
		analysisRepo: analysisRepo,
		userRepo:     userRepo,
	}
}

// AnalysisResult 分析结果结构
type AnalysisResult struct {
	SkillGaps       []string  `json:"skill_gaps"`
	Prerequisites   []string  `json:"prerequisites"`
	DifficultyLevel string    `json:"difficulty_level"`
	EstimatedTime   int       `json:"estimated_time"` // 小时
	Recommendations []string  `json:"recommendations"`
}

// Recommendation 推荐结构
type Recommendation struct {
	Type        string `json:"type"`        // learning_path, resource, skill_building
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`    // high, medium, low
	EstimatedTime int  `json:"estimated_time"`
}

// AnalyzeLearningGoal 分析学习目标
func (s *GoalAnalysisService) AnalyzeLearningGoal(ctx context.Context, goalID uuid.UUID) (*entities.GoalAnalysis, error) {
	// 获取学习目标
	goal, err := s.goalRepo.GetByID(ctx, goalID)
	if err != nil {
		return nil, fmt.Errorf("获取学习目标失败: %w", err)
	}

	// 注意：这里需要根据实际的用户ID类型进行转换
	// 暂时跳过用户信息获取，使用nil用户
	var user *entities.User = nil
	// TODO: 实现UUID到uint的转换或统一ID类型

	// 执行技能差距分析
	skillGapAnalysis, err := s.analyzeSkillGap(ctx, goal, user)
	if err != nil {
		logger.Error("技能差距分析失败", logger.String("error", err.Error()))
		return nil, err
	}

	// 执行前置条件分析
	prerequisiteAnalysis, err := s.analyzePrerequisites(ctx, goal)
	if err != nil {
		logger.Error("前置条件分析失败", logger.String("error", err.Error()))
		return nil, err
	}

	// 执行难度评估
	difficultyAnalysis, err := s.assessDifficulty(ctx, goal, user)
	if err != nil {
		logger.Error("难度评估失败", logger.String("error", err.Error()))
		return nil, err
	}

	// 生成综合分析结果
	analysisResult := &AnalysisResult{
		SkillGaps:       skillGapAnalysis.SkillGaps,
		Prerequisites:   prerequisiteAnalysis.Prerequisites,
		DifficultyLevel: difficultyAnalysis.Level,
		EstimatedTime:   difficultyAnalysis.EstimatedTime,
		Recommendations: s.generateRecommendations(skillGapAnalysis, prerequisiteAnalysis, difficultyAnalysis),
	}

	// 序列化结果
	resultJSON, err := json.Marshal(analysisResult)
	if err != nil {
		return nil, fmt.Errorf("序列化分析结果失败: %w", err)
	}

	// 生成推荐
	recommendations := s.generateDetailedRecommendations(analysisResult)
	recommendationsJSON, err := json.Marshal(recommendations)
	if err != nil {
		return nil, fmt.Errorf("序列化推荐失败: %w", err)
	}

	// 创建分析记录
	analysis := &entities.GoalAnalysis{
		GoalID:          goalID,
		AnalysisType:    "comprehensive",
		Result:          string(resultJSON),
		Recommendations: string(recommendationsJSON),
		ConfidenceScore: s.calculateConfidenceScore(analysisResult),
	}

	// 保存分析结果
	err = s.analysisRepo.Create(ctx, analysis)
	if err != nil {
		return nil, fmt.Errorf("保存分析结果失败: %w", err)
	}

	logger.Info("学习目标分析完成", logger.String("goal_id", goalID.String()), logger.Float64("confidence_score", analysis.ConfidenceScore))
	return analysis, nil
}

// SkillGapAnalysis 技能差距分析结果
type SkillGapAnalysis struct {
	SkillGaps []string `json:"skill_gaps"`
	Strengths []string `json:"strengths"`
}

// analyzeSkillGap 分析技能差距
func (s *GoalAnalysisService) analyzeSkillGap(ctx context.Context, goal *entities.LearningGoal, user *entities.User) (*SkillGapAnalysis, error) {
	// 基于目标类别和用户背景分析技能差距
	skillGaps := []string{}
	strengths := []string{}

	// 根据目标类别确定所需技能
	requiredSkills := s.getRequiredSkillsByCategory(goal.Category)

	// 模拟技能差距分析（实际应用中可能需要更复杂的算法）
	for _, skill := range requiredSkills {
		// 这里可以根据用户的学习历史、测试结果等判断是否掌握该技能
		if !s.userHasSkill(user, skill) {
			skillGaps = append(skillGaps, skill)
		} else {
			strengths = append(strengths, skill)
		}
	}

	return &SkillGapAnalysis{
		SkillGaps: skillGaps,
		Strengths: strengths,
	}, nil
}

// PrerequisiteAnalysis 前置条件分析结果
type PrerequisiteAnalysis struct {
	Prerequisites []string `json:"prerequisites"`
	Missing       []string `json:"missing"`
}

// analyzePrerequisites 分析前置条件
func (s *GoalAnalysisService) analyzePrerequisites(ctx context.Context, goal *entities.LearningGoal) (*PrerequisiteAnalysis, error) {
	// 根据目标类别和难度确定前置条件
	prerequisites := s.getPrerequisitesByCategory(goal.Category, goal.Difficulty)

	// 这里可以检查用户是否满足前置条件
	missing := []string{}
	for _, prereq := range prerequisites {
		// 模拟检查逻辑
		if !s.checkPrerequisite(prereq) {
			missing = append(missing, prereq)
		}
	}

	return &PrerequisiteAnalysis{
		Prerequisites: prerequisites,
		Missing:       missing,
	}, nil
}

// DifficultyAnalysis 难度分析结果
type DifficultyAnalysis struct {
	Level         string `json:"level"`
	EstimatedTime int    `json:"estimated_time"`
	Factors       []string `json:"factors"`
}

// assessDifficulty 评估难度
func (s *GoalAnalysisService) assessDifficulty(ctx context.Context, goal *entities.LearningGoal, user *entities.User) (*DifficultyAnalysis, error) {
	// 基于多个因素评估难度
	factors := []string{}
	estimatedTime := 0

	// 根据目标类别确定基础难度
	baseTime := s.getBaseTimeByCategory(goal.Category)
	estimatedTime += baseTime

	// 根据用户经验调整
	if s.isBeginnerUser(user) {
		estimatedTime = int(float64(estimatedTime) * 1.5)
		factors = append(factors, "初学者需要更多时间")
	}

	// 根据目标复杂度调整
	if strings.Contains(strings.ToLower(goal.Description), "advanced") {
		estimatedTime = int(float64(estimatedTime) * 1.3)
		factors = append(factors, "高级目标增加复杂度")
	}

	return &DifficultyAnalysis{
		Level:         goal.Difficulty,
		EstimatedTime: estimatedTime,
		Factors:       factors,
	}, nil
}

// generateRecommendations 生成推荐
func (s *GoalAnalysisService) generateRecommendations(skillGap *SkillGapAnalysis, prereq *PrerequisiteAnalysis, difficulty *DifficultyAnalysis) []string {
	recommendations := []string{}

	// 基于技能差距的推荐
	if len(skillGap.SkillGaps) > 0 {
		recommendations = append(recommendations, fmt.Sprintf("建议先学习以下技能: %s", strings.Join(skillGap.SkillGaps, ", ")))
	}

	// 基于前置条件的推荐
	if len(prereq.Missing) > 0 {
		recommendations = append(recommendations, fmt.Sprintf("需要先掌握前置知识: %s", strings.Join(prereq.Missing, ", ")))
	}

	// 基于难度的推荐
	if difficulty.EstimatedTime > 100 {
		recommendations = append(recommendations, "建议将目标分解为多个小目标")
	}

	return recommendations
}

// generateDetailedRecommendations 生成详细推荐
func (s *GoalAnalysisService) generateDetailedRecommendations(result *AnalysisResult) []Recommendation {
	recommendations := []Recommendation{}

	// 学习路径推荐
	if len(result.SkillGaps) > 0 {
		recommendations = append(recommendations, Recommendation{
			Type:        "learning_path",
			Title:       "技能提升路径",
			Description: fmt.Sprintf("针对 %s 等技能的系统性学习路径", strings.Join(result.SkillGaps, ", ")),
			Priority:    "high",
			EstimatedTime: result.EstimatedTime / 2,
		})
	}

	// 资源推荐
	recommendations = append(recommendations, Recommendation{
		Type:        "resource",
		Title:       "推荐学习资源",
		Description: "基于您的学习目标推荐的优质学习资源",
		Priority:    "medium",
		EstimatedTime: 10,
	})

	return recommendations
}

// calculateConfidenceScore 计算置信度分数
func (s *GoalAnalysisService) calculateConfidenceScore(result *AnalysisResult) float64 {
	// 基于分析结果的完整性和一致性计算置信度
	score := 0.8 // 基础分数

	// 如果有明确的技能差距分析，提高置信度
	if len(result.SkillGaps) > 0 {
		score += 0.1
	}

	// 如果有前置条件分析，提高置信度
	if len(result.Prerequisites) > 0 {
		score += 0.1
	}

	// 确保分数在0-1范围内
	if score > 1.0 {
		score = 1.0
	}

	return score
}

// 辅助方法
func (s *GoalAnalysisService) getRequiredSkillsByCategory(category string) []string {
	skillMap := map[string][]string{
		"programming": {"算法基础", "数据结构", "编程语言语法", "调试技能"},
		"design":      {"设计原理", "色彩理论", "排版知识", "工具使用"},
		"language":    {"语法基础", "词汇积累", "听力理解", "口语表达"},
		"business":    {"商业分析", "市场理解", "财务知识", "沟通技能"},
	}

	if skills, exists := skillMap[category]; exists {
		return skills
	}
	return []string{"基础知识", "实践技能"}
}

func (s *GoalAnalysisService) getPrerequisitesByCategory(category, difficulty string) []string {
	prereqMap := map[string]map[string][]string{
		"programming": {
			"beginner":     {"计算机基础", "逻辑思维"},
			"intermediate": {"编程基础", "算法入门", "数据结构基础"},
			"advanced":     {"扎实的编程基础", "系统设计理解", "性能优化经验"},
		},
		"design": {
			"beginner":     {"美学基础", "观察能力"},
			"intermediate": {"设计软件使用", "基础设计理论"},
			"advanced":     {"丰富的设计经验", "用户体验理解", "商业设计思维"},
		},
	}

	if categoryPrereqs, exists := prereqMap[category]; exists {
		if prereqs, exists := categoryPrereqs[difficulty]; exists {
			return prereqs
		}
	}
	return []string{"基础知识"}
}

func (s *GoalAnalysisService) getBaseTimeByCategory(category string) int {
	timeMap := map[string]int{
		"programming": 80,
		"design":      60,
		"language":    100,
		"business":    70,
	}

	if time, exists := timeMap[category]; exists {
		return time
	}
	return 50
}

func (s *GoalAnalysisService) userHasSkill(user *entities.User, skill string) bool {
	// 模拟技能检查逻辑
	// 实际应用中可能需要查询用户的学习记录、测试结果等
	return false
}

func (s *GoalAnalysisService) checkPrerequisite(prereq string) bool {
	// 模拟前置条件检查逻辑
	return false
}

func (s *GoalAnalysisService) isBeginnerUser(user *entities.User) bool {
	// 模拟用户经验判断逻辑
	// 可以基于用户注册时间、完成的学习目标数量等判断
	return true
}