package repositories

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"

	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
)

// userRepositoryImpl GORM用户仓储实现
type userRepositoryImpl struct {
	db *gorm.DB
}

// NewUserRepository 创建用户仓储实例
func NewUserRepository(db *gorm.DB) repositories.UserRepository {
	return &userRepositoryImpl{db: db}
}

// Create 创建用户
func (r *userRepositoryImpl) Create(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

// GetByID 根据ID获取用户
func (r *userRepositoryImpl) GetByID(ctx context.Context, id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByUsername 根据用户名获取用户
func (r *userRepositoryImpl) GetByUsername(ctx context.Context, username string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail 根据邮箱获取用户
func (r *userRepositoryImpl) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update 更新用户
func (r *userRepositoryImpl) Update(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

// Delete 删除用户
func (r *userRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.User{}, id).Error
}

// SoftDelete 软删除用户
func (r *userRepositoryImpl) SoftDelete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&entities.User{}).Where("id = ?", id).Update("deleted_at", time.Now()).Error
}

// List 获取用户列表
func (r *userRepositoryImpl) List(ctx context.Context, offset, limit int) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	// 获取总数
	if err := r.db.WithContext(ctx).Model(&entities.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取数据
	err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Find(&users).Error
	return users, total, err
}

// Search 搜索用户
func (r *userRepositoryImpl) Search(ctx context.Context, keyword string, offset, limit int) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.User{})
	if keyword != "" {
		likeKeyword := fmt.Sprintf("%%%s%%", keyword)
		query = query.Where("username LIKE ? OR email LIKE ?", likeKeyword, likeKeyword)
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取数据
	err := query.Offset(offset).Limit(limit).Find(&users).Error
	return users, total, err
}

// GetByRole 根据角色获取用户
func (r *userRepositoryImpl) GetByRole(ctx context.Context, role string, offset, limit int) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.User{}).Where("role = ?", role)

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取数据
	err := query.Offset(offset).Limit(limit).Find(&users).Error
	return users, total, err
}

// GetByStatus 根据状态获取用户
func (r *userRepositoryImpl) GetByStatus(ctx context.Context, status string, offset, limit int) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.User{}).Where("status = ?", status)

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取数据
	err := query.Offset(offset).Limit(limit).Find(&users).Error
	return users, total, err
}

// ExistsByUsername 检查用户名是否存在
func (r *userRepositoryImpl) ExistsByUsername(ctx context.Context, username string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Where("username = ?", username).Count(&count).Error
	return count > 0, err
}

// ExistsByEmail 检查邮箱是否存在
func (r *userRepositoryImpl) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// ExistsByID 检查用户ID是否存在
func (r *userRepositoryImpl) ExistsByID(ctx context.Context, id uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Where("id = ?", id).Count(&count).Error
	return count > 0, err
}

// UpdateStatus 更新用户状态
func (r *userRepositoryImpl) UpdateStatus(ctx context.Context, id uint, status string) error {
	return r.db.WithContext(ctx).Model(&entities.User{}).Where("id = ?", id).Update("status", status).Error
}

// UpdateRole 更新用户角色
func (r *userRepositoryImpl) UpdateRole(ctx context.Context, id uint, role string) error {
	return r.db.WithContext(ctx).Model(&entities.User{}).Where("id = ?", id).Update("role", role).Error
}

// UpdatePassword 更新用户密码
func (r *userRepositoryImpl) UpdatePassword(ctx context.Context, id uint, hashedPassword string) error {
	return r.db.WithContext(ctx).Model(&entities.User{}).Where("id = ?", id).Update("password_hash", hashedPassword).Error
}

// UpdateLastLoginAt 更新最后登录时间
func (r *userRepositoryImpl) UpdateLastLoginAt(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&entities.User{}).Where("id = ?", id).Update("last_login_at", time.Now()).Error
}

// GetWithProfile 获取用户及其资料
func (r *userRepositoryImpl) GetWithProfile(ctx context.Context, id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Preload("Profile").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetWithSessions 获取用户及其会话
func (r *userRepositoryImpl) GetWithSessions(ctx context.Context, id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Preload("Sessions").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetWithAll 获取用户及其所有关联数据
func (r *userRepositoryImpl) GetWithAll(ctx context.Context, id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Preload("Profile").Preload("Sessions").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Count 获取用户总数
func (r *userRepositoryImpl) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Count(&count).Error
	return count, err
}

// CountByRole 根据角色统计用户数
func (r *userRepositoryImpl) CountByRole(ctx context.Context, role string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Where("role = ?", role).Count(&count).Error
	return count, err
}

// CountByStatus 根据状态统计用户数
func (r *userRepositoryImpl) CountByStatus(ctx context.Context, status string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// CountActiveUsers 统计活跃用户数
func (r *userRepositoryImpl) CountActiveUsers(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Where("status = ?", entities.StatusActive).Count(&count).Error
	return count, err
}

// CountNewUsersInPeriod 统计指定天数内的新用户数
func (r *userRepositoryImpl) CountNewUsersInPeriod(ctx context.Context, days int) (int64, error) {
	var count int64
	since := time.Now().AddDate(0, 0, -days)
	err := r.db.WithContext(ctx).Model(&entities.User{}).Where("created_at >= ?", since).Count(&count).Error
	return count, err
}