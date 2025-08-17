package repositories

import (
	"context"
	"time"

	"gorm.io/gorm"

	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
)

// userSessionRepositoryImpl GORM用户会话仓储实现
type userSessionRepositoryImpl struct {
	db *gorm.DB
}

// NewUserSessionRepository 创建用户会话仓储实例
func NewUserSessionRepository(db *gorm.DB) repositories.UserSessionRepository {
	return &userSessionRepositoryImpl{db: db}
}

// Create 创建用户会话
func (r *userSessionRepositoryImpl) Create(ctx context.Context, session *entities.UserSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

// GetByID 根据ID获取用户会话
func (r *userSessionRepositoryImpl) GetByID(ctx context.Context, id uint) (*entities.UserSession, error) {
	var session entities.UserSession
	err := r.db.WithContext(ctx).First(&session, id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// GetByTokenID 根据TokenID获取用户会话
func (r *userSessionRepositoryImpl) GetByTokenID(ctx context.Context, tokenID string) (*entities.UserSession, error) {
	var session entities.UserSession
	err := r.db.WithContext(ctx).Where("token_id = ?", tokenID).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// Update 更新用户会话
func (r *userSessionRepositoryImpl) Update(ctx context.Context, session *entities.UserSession) error {
	return r.db.WithContext(ctx).Save(session).Error
}

// Delete 删除用户会话
func (r *userSessionRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.UserSession{}, id).Error
}

// GetByUserID 根据用户ID获取所有会话
func (r *userSessionRepositoryImpl) GetByUserID(ctx context.Context, userID uint) ([]*entities.UserSession, error) {
	var sessions []*entities.UserSession
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&sessions).Error
	return sessions, err
}

// GetActiveByUserID 根据用户ID获取活跃会话
func (r *userSessionRepositoryImpl) GetActiveByUserID(ctx context.Context, userID uint) ([]*entities.UserSession, error) {
	var sessions []*entities.UserSession
	err := r.db.WithContext(ctx).Where("user_id = ? AND is_active = ? AND expires_at > ?", userID, true, time.Now()).Find(&sessions).Error
	return sessions, err
}

// GetByUserIDAndType 根据用户ID和Token类型获取会话
func (r *userSessionRepositoryImpl) GetByUserIDAndType(ctx context.Context, userID uint, tokenType string) ([]*entities.UserSession, error) {
	var sessions []*entities.UserSession
	err := r.db.WithContext(ctx).Where("user_id = ? AND token_type = ?", userID, tokenType).Find(&sessions).Error
	return sessions, err
}

// ExistsByTokenID 检查TokenID是否存在
func (r *userSessionRepositoryImpl) ExistsByTokenID(ctx context.Context, tokenID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.UserSession{}).Where("token_id = ?", tokenID).Count(&count).Error
	return count > 0, err
}

// IsValidSession 检查会话是否有效
func (r *userSessionRepositoryImpl) IsValidSession(ctx context.Context, tokenID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.UserSession{}).
		Where("token_id = ? AND is_active = ? AND expires_at > ?", tokenID, true, time.Now()).
		Count(&count).Error
	return count > 0, err
}

// Deactivate 停用会话
func (r *userSessionRepositoryImpl) Deactivate(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&entities.UserSession{}).Where("id = ?", id).Update("is_active", false).Error
}

// DeactivateByTokenID 根据TokenID停用会话
func (r *userSessionRepositoryImpl) DeactivateByTokenID(ctx context.Context, tokenID string) error {
	return r.db.WithContext(ctx).Model(&entities.UserSession{}).Where("token_id = ?", tokenID).Update("is_active", false).Error
}

// DeactivateByUserID 停用用户的所有会话
func (r *userSessionRepositoryImpl) DeactivateByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Model(&entities.UserSession{}).Where("user_id = ?", userID).Update("is_active", false).Error
}

// DeactivateExpiredSessions 停用过期会话
func (r *userSessionRepositoryImpl) DeactivateExpiredSessions(ctx context.Context) error {
	return r.db.WithContext(ctx).Model(&entities.UserSession{}).
		Where("expires_at <= ? AND is_active = ?", time.Now(), true).
		Update("is_active", false).Error
}

// UpdateLastUsed 更新最后使用时间
func (r *userSessionRepositoryImpl) UpdateLastUsed(ctx context.Context, tokenID string) error {
	return r.db.WithContext(ctx).Model(&entities.UserSession{}).
		Where("token_id = ?", tokenID).
		Update("last_used", time.Now()).Error
}

// DeleteExpiredSessions 删除过期会话
func (r *userSessionRepositoryImpl) DeleteExpiredSessions(ctx context.Context) error {
	return r.db.WithContext(ctx).Where("expires_at <= ?", time.Now()).Delete(&entities.UserSession{}).Error
}

// DeleteByUserID 删除用户的所有会话
func (r *userSessionRepositoryImpl) DeleteByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&entities.UserSession{}).Error
}

// DeleteOldSessions 删除指定天数前的会话
func (r *userSessionRepositoryImpl) DeleteOldSessions(ctx context.Context, days int) error {
	cutoff := time.Now().AddDate(0, 0, -days)
	return r.db.WithContext(ctx).Where("created_at <= ?", cutoff).Delete(&entities.UserSession{}).Error
}

// CountActiveSessionsByUserID 统计用户活跃会话数
func (r *userSessionRepositoryImpl) CountActiveSessionsByUserID(ctx context.Context, userID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.UserSession{}).
		Where("user_id = ? AND is_active = ? AND expires_at > ?", userID, true, time.Now()).
		Count(&count).Error
	return count, err
}

// CountTotalSessions 统计总会话数
func (r *userSessionRepositoryImpl) CountTotalSessions(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.UserSession{}).Count(&count).Error
	return count, err
}

// CountActiveSessions 统计活跃会话数
func (r *userSessionRepositoryImpl) CountActiveSessions(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.UserSession{}).
		Where("is_active = ? AND expires_at > ?", true, time.Now()).
		Count(&count).Error
	return count, err
}