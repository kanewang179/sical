package repositories

import (
	"context"

	"sical-go-backend/internal/domain/entities"
)

// UserRepository 用户仓储接口
type UserRepository interface {
	// 基础CRUD操作
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id uint) (*entities.User, error)
	GetByUsername(ctx context.Context, username string) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id uint) error
	SoftDelete(ctx context.Context, id uint) error

	// 查询操作
	List(ctx context.Context, offset, limit int) ([]*entities.User, int64, error)
	Search(ctx context.Context, keyword string, offset, limit int) ([]*entities.User, int64, error)
	GetByRole(ctx context.Context, role string, offset, limit int) ([]*entities.User, int64, error)
	GetByStatus(ctx context.Context, status string, offset, limit int) ([]*entities.User, int64, error)

	// 验证操作
	ExistsByUsername(ctx context.Context, username string) (bool, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	ExistsByID(ctx context.Context, id uint) (bool, error)

	// 状态操作
	UpdateStatus(ctx context.Context, id uint, status string) error
	UpdateRole(ctx context.Context, id uint, role string) error
	UpdatePassword(ctx context.Context, id uint, hashedPassword string) error
	UpdateLastLoginAt(ctx context.Context, id uint) error

	// 关联操作
	GetWithProfile(ctx context.Context, id uint) (*entities.User, error)
	GetWithSessions(ctx context.Context, id uint) (*entities.User, error)
	GetWithAll(ctx context.Context, id uint) (*entities.User, error)

	// 统计操作
	Count(ctx context.Context) (int64, error)
	CountByRole(ctx context.Context, role string) (int64, error)
	CountByStatus(ctx context.Context, status string) (int64, error)
	CountActiveUsers(ctx context.Context) (int64, error)
	CountNewUsersInPeriod(ctx context.Context, days int) (int64, error)
}

// UserProfileRepository 用户资料仓储接口
type UserProfileRepository interface {
	// 基础CRUD操作
	Create(ctx context.Context, profile *entities.UserProfile) error
	GetByID(ctx context.Context, id uint) (*entities.UserProfile, error)
	GetByUserID(ctx context.Context, userID uint) (*entities.UserProfile, error)
	Update(ctx context.Context, profile *entities.UserProfile) error
	Delete(ctx context.Context, id uint) error

	// 验证操作
	ExistsByUserID(ctx context.Context, userID uint) (bool, error)
	ExistsByPhone(ctx context.Context, phone string) (bool, error)

	// 更新操作
	UpdateAvatar(ctx context.Context, userID uint, avatar string) error
	UpdateNickname(ctx context.Context, userID uint, nickname string) error
	UpdatePhone(ctx context.Context, userID uint, phone string) error
	UpdateBio(ctx context.Context, userID uint, bio string) error
	UpdateLocation(ctx context.Context, userID uint, location string) error
	UpdateTimezone(ctx context.Context, userID uint, timezone string) error
	UpdateLanguage(ctx context.Context, userID uint, language string) error
}

// UserSessionRepository 用户会话仓储接口
type UserSessionRepository interface {
	// 基础CRUD操作
	Create(ctx context.Context, session *entities.UserSession) error
	GetByID(ctx context.Context, id uint) (*entities.UserSession, error)
	GetByTokenID(ctx context.Context, tokenID string) (*entities.UserSession, error)
	Update(ctx context.Context, session *entities.UserSession) error
	Delete(ctx context.Context, id uint) error

	// 查询操作
	GetByUserID(ctx context.Context, userID uint) ([]*entities.UserSession, error)
	GetActiveByUserID(ctx context.Context, userID uint) ([]*entities.UserSession, error)
	GetByUserIDAndType(ctx context.Context, userID uint, tokenType string) ([]*entities.UserSession, error)

	// 验证操作
	ExistsByTokenID(ctx context.Context, tokenID string) (bool, error)
	IsValidSession(ctx context.Context, tokenID string) (bool, error)

	// 状态操作
	Deactivate(ctx context.Context, id uint) error
	DeactivateByTokenID(ctx context.Context, tokenID string) error
	DeactivateByUserID(ctx context.Context, userID uint) error
	DeactivateExpiredSessions(ctx context.Context) error
	UpdateLastUsed(ctx context.Context, tokenID string) error

	// 清理操作
	DeleteExpiredSessions(ctx context.Context) error
	DeleteByUserID(ctx context.Context, userID uint) error
	DeleteOldSessions(ctx context.Context, days int) error

	// 统计操作
	CountActiveSessionsByUserID(ctx context.Context, userID uint) (int64, error)
	CountTotalSessions(ctx context.Context) (int64, error)
	CountActiveSessions(ctx context.Context) (int64, error)
}