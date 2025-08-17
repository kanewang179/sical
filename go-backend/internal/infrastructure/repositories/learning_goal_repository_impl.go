package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
)

// learningGoalRepositoryImpl 学习目标仓储实现
type learningGoalRepositoryImpl struct {
	db *gorm.DB
}

// NewLearningGoalRepository 创建学习目标仓储实例
func NewLearningGoalRepository(db *gorm.DB) repositories.LearningGoalRepository {
	return &learningGoalRepositoryImpl{
		db: db,
	}
}

// Create 创建学习目标
func (r *learningGoalRepositoryImpl) Create(ctx context.Context, goal *entities.LearningGoal) error {
	if err := r.db.WithContext(ctx).Create(goal).Error; err != nil {
		return fmt.Errorf("创建学习目标失败: %w", err)
	}
	return nil
}

// GetByID 根据ID获取学习目标
func (r *learningGoalRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.LearningGoal, error) {
	var goal entities.LearningGoal
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&goal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("学习目标不存在")
		}
		return nil, fmt.Errorf("获取学习目标失败: %w", err)
	}
	return &goal, nil
}

// GetByUserID 根据用户ID获取学习目标列表
func (r *learningGoalRepositoryImpl) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.LearningGoal, error) {
	var goals []*entities.LearningGoal
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&goals).Error; err != nil {
		return nil, fmt.Errorf("获取用户学习目标失败: %w", err)
	}
	return goals, nil
}

// Update 更新学习目标
func (r *learningGoalRepositoryImpl) Update(ctx context.Context, goal *entities.LearningGoal) error {
	if err := r.db.WithContext(ctx).Save(goal).Error; err != nil {
		return fmt.Errorf("更新学习目标失败: %w", err)
	}
	return nil
}

// Delete 删除学习目标
func (r *learningGoalRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&entities.LearningGoal{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("删除学习目标失败: %w", err)
	}
	return nil
}

// GetByStatus 根据状态获取学习目标
func (r *learningGoalRepositoryImpl) GetByStatus(ctx context.Context, userID uuid.UUID, status string) ([]*entities.LearningGoal, error) {
	var goals []*entities.LearningGoal
	if err := r.db.WithContext(ctx).Where("user_id = ? AND status = ?", userID, status).Find(&goals).Error; err != nil {
		return nil, fmt.Errorf("根据状态获取学习目标失败: %w", err)
	}
	return goals, nil
}

// UpdateProgress 更新学习进度
func (r *learningGoalRepositoryImpl) UpdateProgress(ctx context.Context, id uuid.UUID, progress float64) error {
	if err := r.db.WithContext(ctx).Model(&entities.LearningGoal{}).Where("id = ?", id).Update("progress", progress).Error; err != nil {
		return fmt.Errorf("更新学习进度失败: %w", err)
	}
	return nil
}

// goalAnalysisRepositoryImpl 学习目标分析仓储实现
type goalAnalysisRepositoryImpl struct {
	db *gorm.DB
}

// NewGoalAnalysisRepository 创建学习目标分析仓储实例
func NewGoalAnalysisRepository(db *gorm.DB) repositories.GoalAnalysisRepository {
	return &goalAnalysisRepositoryImpl{
		db: db,
	}
}

// Create 创建分析记录
func (r *goalAnalysisRepositoryImpl) Create(ctx context.Context, analysis *entities.GoalAnalysis) error {
	if err := r.db.WithContext(ctx).Create(analysis).Error; err != nil {
		return fmt.Errorf("创建分析记录失败: %w", err)
	}
	return nil
}

// GetByID 根据ID获取分析记录
func (r *goalAnalysisRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.GoalAnalysis, error) {
	var analysis entities.GoalAnalysis
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&analysis).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("分析记录不存在")
		}
		return nil, fmt.Errorf("获取分析记录失败: %w", err)
	}
	return &analysis, nil
}

// GetByGoalID 根据目标ID获取分析记录
func (r *goalAnalysisRepositoryImpl) GetByGoalID(ctx context.Context, goalID uuid.UUID) ([]*entities.GoalAnalysis, error) {
	var analyses []*entities.GoalAnalysis
	if err := r.db.WithContext(ctx).Where("goal_id = ?", goalID).Find(&analyses).Error; err != nil {
		return nil, fmt.Errorf("获取目标分析记录失败: %w", err)
	}
	return analyses, nil
}

// GetLatestByGoalID 获取目标的最新分析记录
func (r *goalAnalysisRepositoryImpl) GetLatestByGoalID(ctx context.Context, goalID uuid.UUID) (*entities.GoalAnalysis, error) {
	var analysis entities.GoalAnalysis
	if err := r.db.WithContext(ctx).Where("goal_id = ?", goalID).Order("created_at DESC").First(&analysis).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("分析记录不存在")
		}
		return nil, fmt.Errorf("获取最新分析记录失败: %w", err)
	}
	return &analysis, nil
}

// Update 更新分析记录
func (r *goalAnalysisRepositoryImpl) Update(ctx context.Context, analysis *entities.GoalAnalysis) error {
	if err := r.db.WithContext(ctx).Save(analysis).Error; err != nil {
		return fmt.Errorf("更新分析记录失败: %w", err)
	}
	return nil
}

// Delete 删除分析记录
func (r *goalAnalysisRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&entities.GoalAnalysis{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("删除分析记录失败: %w", err)
	}
	return nil
}