package repositories

import (
	"context"

	"gorm.io/gorm"

	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
)

// userProfileRepositoryImpl GORM用户资料仓储实现
type userProfileRepositoryImpl struct {
	db *gorm.DB
}

// NewUserProfileRepository 创建用户资料仓储实例
func NewUserProfileRepository(db *gorm.DB) repositories.UserProfileRepository {
	return &userProfileRepositoryImpl{db: db}
}

// Create 创建用户资料
func (r *userProfileRepositoryImpl) Create(ctx context.Context, profile *entities.UserProfile) error {
	return r.db.WithContext(ctx).Create(profile).Error
}

// GetByID 根据ID获取用户资料
func (r *userProfileRepositoryImpl) GetByID(ctx context.Context, id uint) (*entities.UserProfile, error) {
	var profile entities.UserProfile
	err := r.db.WithContext(ctx).First(&profile, id).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

// GetByUserID 根据用户ID获取用户资料
func (r *userProfileRepositoryImpl) GetByUserID(ctx context.Context, userID uint) (*entities.UserProfile, error) {
	var profile entities.UserProfile
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

// Update 更新用户资料
func (r *userProfileRepositoryImpl) Update(ctx context.Context, profile *entities.UserProfile) error {
	return r.db.WithContext(ctx).Save(profile).Error
}

// Delete 删除用户资料
func (r *userProfileRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.UserProfile{}, id).Error
}

// ExistsByUserID 检查用户ID是否已有资料
func (r *userProfileRepositoryImpl) ExistsByUserID(ctx context.Context, userID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Count(&count).Error
	return count > 0, err
}

// ExistsByPhone 检查手机号是否已存在
func (r *userProfileRepositoryImpl) ExistsByPhone(ctx context.Context, phone string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("phone = ? AND phone != ''", phone).Count(&count).Error
	return count > 0, err
}

// UpdateAvatar 更新头像
func (r *userProfileRepositoryImpl) UpdateAvatar(ctx context.Context, userID uint, avatar string) error {
	return r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Update("avatar", avatar).Error
}

// UpdateNickname 更新昵称
func (r *userProfileRepositoryImpl) UpdateNickname(ctx context.Context, userID uint, nickname string) error {
	return r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Update("nickname", nickname).Error
}

// UpdatePhone 更新手机号
func (r *userProfileRepositoryImpl) UpdatePhone(ctx context.Context, userID uint, phone string) error {
	return r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Update("phone", phone).Error
}

// UpdateBio 更新个人简介
func (r *userProfileRepositoryImpl) UpdateBio(ctx context.Context, userID uint, bio string) error {
	return r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Update("bio", bio).Error
}

// UpdateLocation 更新位置
func (r *userProfileRepositoryImpl) UpdateLocation(ctx context.Context, userID uint, location string) error {
	return r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Update("location", location).Error
}

// UpdateTimezone 更新时区
func (r *userProfileRepositoryImpl) UpdateTimezone(ctx context.Context, userID uint, timezone string) error {
	return r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Update("timezone", timezone).Error
}

// UpdateLanguage 更新语言
func (r *userProfileRepositoryImpl) UpdateLanguage(ctx context.Context, userID uint, language string) error {
	return r.db.WithContext(ctx).Model(&entities.UserProfile{}).Where("user_id = ?", userID).Update("language", language).Error
}