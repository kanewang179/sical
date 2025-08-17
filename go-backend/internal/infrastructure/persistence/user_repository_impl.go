package persistence

import (
	"context"
	"gorm.io/gorm"
	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
)

// userRepositoryImpl 用户仓储实现
type userRepositoryImpl struct {
	db *gorm.DB
}

// NewUserRepository 创建用户仓储实例
func NewUserRepository(db *gorm.DB) repositories.UserRepository {
	return &userRepositoryImpl{db: db}
}

func (r *userRepositoryImpl) Create(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepositoryImpl) GetByID(ctx context.Context, id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepositoryImpl) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepositoryImpl) GetByUsername(ctx context.Context, username string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepositoryImpl) Update(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entities.User{}, id).Error
}

func (r *userRepositoryImpl) List(ctx context.Context, offset, limit int) ([]*entities.User, error) {
	var users []*entities.User
	err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Find(&users).Error
	return users, err
}

func (r *userRepositoryImpl) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Count(&count).Error
	return count, err
}

// userProfileRepositoryImpl 用户档案仓储实现
type userProfileRepositoryImpl struct {
	db *gorm.DB
}

// NewUserProfileRepository 创建用户档案仓储实例
func NewUserProfileRepository(db *gorm.DB) repositories.UserProfileRepository {
	return &userProfileRepositoryImpl{db: db}
}

func (r *userProfileRepositoryImpl) Create(ctx context.Context, profile *entities.UserProfile) error {
	return r.db.WithContext(ctx).Create(profile).Error
}

func (r *userProfileRepositoryImpl) GetByUserID(ctx context.Context, userID uint) (*entities.UserProfile, error) {
	var profile entities.UserProfile
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *userProfileRepositoryImpl) Update(ctx context.Context, profile *entities.UserProfile) error {
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *userProfileRepositoryImpl) Delete(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&entities.UserProfile{}).Error
}

// userSessionRepositoryImpl 用户会话仓储实现
type userSessionRepositoryImpl struct {
	db *gorm.DB
}

// NewUserSessionRepository 创建用户会话仓储实例
func NewUserSessionRepository(db *gorm.DB) repositories.UserSessionRepository {
	return &userSessionRepositoryImpl{db: db}
}

func (r *userSessionRepositoryImpl) Create(ctx context.Context, session *entities.UserSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *userSessionRepositoryImpl) GetByTokenID(ctx context.Context, tokenID string) (*entities.UserSession, error) {
	var session entities.UserSession
	err := r.db.WithContext(ctx).Where("token_id = ?", tokenID).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *userSessionRepositoryImpl) GetByUserID(ctx context.Context, userID uint) ([]*entities.UserSession, error) {
	var sessions []*entities.UserSession
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&sessions).Error
	return sessions, err
}

func (r *userSessionRepositoryImpl) Update(ctx context.Context, session *entities.UserSession) error {
	return r.db.WithContext(ctx).Save(session).Error
}

func (r *userSessionRepositoryImpl) Delete(ctx context.Context, tokenID string) error {
	return r.db.WithContext(ctx).Where("token_id = ?", tokenID).Delete(&entities.UserSession{}).Error
}

func (r *userSessionRepositoryImpl) DeleteByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&entities.UserSession{}).Error
}