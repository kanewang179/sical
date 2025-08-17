package repositories

import (
	"context"

	"github.com/google/uuid"
	"sical-go-backend/internal/domain/entities"
)

// LearningGoalRepository 学习目标仓储接口
type LearningGoalRepository interface {
	// Create 创建学习目标
	Create(ctx context.Context, goal *entities.LearningGoal) error

	// GetByID 根据ID获取学习目标
	GetByID(ctx context.Context, id uuid.UUID) (*entities.LearningGoal, error)

	// GetByUserID 根据用户ID获取学习目标列表
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.LearningGoal, error)

	// Update 更新学习目标
	Update(ctx context.Context, goal *entities.LearningGoal) error

	// Delete 删除学习目标
	Delete(ctx context.Context, id uuid.UUID) error

	// GetByStatus 根据状态获取学习目标
	GetByStatus(ctx context.Context, userID uuid.UUID, status string) ([]*entities.LearningGoal, error)

	// UpdateProgress 更新学习进度
	UpdateProgress(ctx context.Context, id uuid.UUID, progress float64) error
}

// GoalAnalysisRepository 学习目标分析仓储接口
type GoalAnalysisRepository interface {
	// Create 创建分析记录
	Create(ctx context.Context, analysis *entities.GoalAnalysis) error

	// GetByID 根据ID获取分析记录
	GetByID(ctx context.Context, id uuid.UUID) (*entities.GoalAnalysis, error)

	// GetByGoalID 根据目标ID获取分析记录
	GetByGoalID(ctx context.Context, goalID uuid.UUID) ([]*entities.GoalAnalysis, error)

	// GetLatestByGoalID 获取目标的最新分析记录
	GetLatestByGoalID(ctx context.Context, goalID uuid.UUID) (*entities.GoalAnalysis, error)

	// Update 更新分析记录
	Update(ctx context.Context, analysis *entities.GoalAnalysis) error

	// Delete 删除分析记录
	Delete(ctx context.Context, id uuid.UUID) error
}

// LearningPathRepository 学习路径仓储接口
type LearningPathRepository interface {
	// Create 创建学习路径
	Create(ctx context.Context, path *entities.LearningPath) error

	// GetByID 根据ID获取学习路径
	GetByID(ctx context.Context, id uuid.UUID) (*entities.LearningPath, error)

	// GetByGoalID 根据目标ID获取学习路径
	GetByGoalID(ctx context.Context, goalID uuid.UUID) ([]*entities.LearningPath, error)

	// Update 更新学习路径
	Update(ctx context.Context, path *entities.LearningPath) error

	// Delete 删除学习路径
	Delete(ctx context.Context, id uuid.UUID) error

	// UpdateStatus 更新学习路径状态
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

// KnowledgePointRepository 知识点仓储接口
type KnowledgePointRepository interface {
	// Create 创建知识点
	Create(ctx context.Context, point *entities.KnowledgePoint) error

	// GetByID 根据ID获取知识点
	GetByID(ctx context.Context, id uuid.UUID) (*entities.KnowledgePoint, error)

	// GetByCategory 根据类别获取知识点
	GetByCategory(ctx context.Context, category string) ([]*entities.KnowledgePoint, error)

	// Search 搜索知识点
	Search(ctx context.Context, keyword string) ([]*entities.KnowledgePoint, error)

	// Update 更新知识点
	Update(ctx context.Context, point *entities.KnowledgePoint) error

	// Delete 删除知识点
	Delete(ctx context.Context, id uuid.UUID) error

	// GetByDifficulty 根据难度获取知识点
	GetByDifficulty(ctx context.Context, difficulty string) ([]*entities.KnowledgePoint, error)
}