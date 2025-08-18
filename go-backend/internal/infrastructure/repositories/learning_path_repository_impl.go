package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
)

// learningPathRepositoryImpl 学习路径仓储实现
type learningPathRepositoryImpl struct {
	db *gorm.DB
}

// NewLearningPathRepository 创建学习路径仓储实例
func NewLearningPathRepository(db *gorm.DB) repositories.LearningPathRepository {
	return &learningPathRepositoryImpl{
		db: db,
	}
}

// Create 创建学习路径
func (r *learningPathRepositoryImpl) Create(ctx context.Context, path *entities.LearningPath) error {
	if err := r.db.WithContext(ctx).Create(path).Error; err != nil {
		return fmt.Errorf("创建学习路径失败: %w", err)
	}
	return nil
}

// GetByID 根据ID获取学习路径
func (r *learningPathRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.LearningPath, error) {
	var path entities.LearningPath
	if err := r.db.WithContext(ctx).Preload("LearningGoal").Preload("KnowledgePoints").Where("id = ?", id).First(&path).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("学习路径不存在")
		}
		return nil, fmt.Errorf("获取学习路径失败: %w", err)
	}
	return &path, nil
}

// GetByGoalID 根据目标ID获取学习路径
func (r *learningPathRepositoryImpl) GetByGoalID(ctx context.Context, goalID uuid.UUID) ([]*entities.LearningPath, error) {
	var paths []*entities.LearningPath
	if err := r.db.WithContext(ctx).Preload("KnowledgePoints").Where("goal_id = ?", goalID).Order("order ASC").Find(&paths).Error; err != nil {
		return nil, fmt.Errorf("获取学习路径失败: %w", err)
	}
	return paths, nil
}

// Update 更新学习路径
func (r *learningPathRepositoryImpl) Update(ctx context.Context, path *entities.LearningPath) error {
	if err := r.db.WithContext(ctx).Save(path).Error; err != nil {
		return fmt.Errorf("更新学习路径失败: %w", err)
	}
	return nil
}

// Delete 删除学习路径
func (r *learningPathRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&entities.LearningPath{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("删除学习路径失败: %w", err)
	}
	return nil
}

// UpdateStatus 更新学习路径状态
func (r *learningPathRepositoryImpl) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	if err := r.db.WithContext(ctx).Model(&entities.LearningPath{}).Where("id = ?", id).Update("status", status).Error; err != nil {
		return fmt.Errorf("更新学习路径状态失败: %w", err)
	}
	return nil
}

// knowledgePointRepositoryImpl 知识点仓储实现
type knowledgePointRepositoryImpl struct {
	db *gorm.DB
}

// NewKnowledgePointRepository 创建知识点仓储实例
func NewKnowledgePointRepository(db *gorm.DB) repositories.KnowledgePointRepository {
	return &knowledgePointRepositoryImpl{
		db: db,
	}
}

// Create 创建知识点
func (r *knowledgePointRepositoryImpl) Create(ctx context.Context, point *entities.KnowledgePoint) error {
	if err := r.db.WithContext(ctx).Create(point).Error; err != nil {
		return fmt.Errorf("创建知识点失败: %w", err)
	}
	return nil
}

// GetByID 根据ID获取知识点
func (r *knowledgePointRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.KnowledgePoint, error) {
	var point entities.KnowledgePoint
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&point).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("知识点不存在")
		}
		return nil, fmt.Errorf("获取知识点失败: %w", err)
	}
	return &point, nil
}

// GetByCategory 根据类别获取知识点
func (r *knowledgePointRepositoryImpl) GetByCategory(ctx context.Context, category string) ([]*entities.KnowledgePoint, error) {
	var points []*entities.KnowledgePoint
	if err := r.db.WithContext(ctx).Where("category = ?", category).Find(&points).Error; err != nil {
		return nil, fmt.Errorf("根据类别获取知识点失败: %w", err)
	}
	return points, nil
}

// Search 搜索知识点
func (r *knowledgePointRepositoryImpl) Search(ctx context.Context, keyword string) ([]*entities.KnowledgePoint, error) {
	var points []*entities.KnowledgePoint
	searchPattern := "%" + keyword + "%"
	if err := r.db.WithContext(ctx).Where("title ILIKE ? OR description ILIKE ?", searchPattern, searchPattern).Find(&points).Error; err != nil {
		return nil, fmt.Errorf("搜索知识点失败: %w", err)
	}
	return points, nil
}

// Update 更新知识点
func (r *knowledgePointRepositoryImpl) Update(ctx context.Context, point *entities.KnowledgePoint) error {
	if err := r.db.WithContext(ctx).Save(point).Error; err != nil {
		return fmt.Errorf("更新知识点失败: %w", err)
	}
	return nil
}

// Delete 删除知识点
func (r *knowledgePointRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&entities.KnowledgePoint{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("删除知识点失败: %w", err)
	}
	return nil
}

// GetByDifficulty 根据难度获取知识点
func (r *knowledgePointRepositoryImpl) GetByDifficulty(ctx context.Context, difficulty string) ([]*entities.KnowledgePoint, error) {
	var points []*entities.KnowledgePoint
	if err := r.db.WithContext(ctx).Where("difficulty = ?", difficulty).Find(&points).Error; err != nil {
		return nil, fmt.Errorf("根据难度获取知识点失败: %w", err)
	}
	return points, nil
}