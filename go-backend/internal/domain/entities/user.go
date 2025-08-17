package entities

import (
	"time"
)

// User 用户实体
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Username  string    `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;size:100;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"` // 不在JSON中显示
	Role      string    `json:"role" gorm:"size:20;not null;default:'user'"`
	Status    string    `json:"status" gorm:"size:20;not null;default:'active'"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`

	// 关联关系
	Profile      *UserProfile      `json:"profile,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Sessions     []UserSession     `json:"sessions,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	// LearningGoals []LearningGoal   `json:"learning_goals,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"` // 待实现
}

// UserProfile 用户资料
type UserProfile struct {
	ID          uint       `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID      uint       `json:"user_id" gorm:"uniqueIndex;not null"`
	Nickname    string     `json:"nickname" gorm:"size:50"`
	Avatar      string     `json:"avatar" gorm:"size:255"`
	Phone       string     `json:"phone" gorm:"size:20"`
	BirthDate   *time.Time `json:"birth_date"`
	Gender      string     `json:"gender" gorm:"size:10"`
	Location    string     `json:"location" gorm:"size:100"`
	Bio         string     `json:"bio" gorm:"type:text"`
	Timezone    string     `json:"timezone" gorm:"size:50;default:'Asia/Shanghai'"`
	Language    string     `json:"language" gorm:"size:10;default:'zh-CN'"`
	CreatedAt   time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"autoUpdateTime"`

	// 关联关系
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// UserSession 用户会话
type UserSession struct {
	ID           uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID       uint      `json:"user_id" gorm:"index;not null"`
	TokenID      string    `json:"token_id" gorm:"uniqueIndex;size:100;not null"`
	TokenType    string    `json:"token_type" gorm:"size:20;not null;default:'access'"`
	DeviceInfo   string    `json:"device_info" gorm:"size:255"`
	IPAddress    string    `json:"ip_address" gorm:"size:45"`
	UserAgent    string    `json:"user_agent" gorm:"size:500"`
	IsActive     bool      `json:"is_active" gorm:"default:true"`
	LastUsedAt   time.Time `json:"last_used_at" gorm:"autoCreateTime"`
	ExpiresAt    time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// 关联关系
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// UserRole 用户角色常量
type UserRole string

const (
	RoleAdmin     UserRole = "admin"
	RoleModerator UserRole = "moderator"
	RoleUser      UserRole = "user"
	RoleGuest     UserRole = "guest"
)

// UserStatus 用户状态常量
type UserStatus string

const (
	StatusActive    UserStatus = "active"
	StatusInactive  UserStatus = "inactive"
	StatusSuspended UserStatus = "suspended"
	StatusBanned    UserStatus = "banned"
)

// TokenType token类型常量
type TokenType string

const (
	TokenTypeAccess  TokenType = "access"
	TokenTypeRefresh TokenType = "refresh"
)

// Gender 性别常量
type Gender string

const (
	GenderMale   Gender = "male"
	GenderFemale Gender = "female"
	GenderOther  Gender = "other"
)

// TableName 指定User表名
func (User) TableName() string {
	return "users"
}

// TableName 指定UserProfile表名
func (UserProfile) TableName() string {
	return "user_profiles"
}

// TableName 指定UserSession表名
func (UserSession) TableName() string {
	return "user_sessions"
}

// IsAdmin 检查是否为管理员
func (u *User) IsAdmin() bool {
	return u.Role == string(RoleAdmin)
}

// IsModerator 检查是否为版主
func (u *User) IsModerator() bool {
	return u.Role == string(RoleModerator)
}

// IsActive 检查用户是否激活
func (u *User) IsActive() bool {
	return u.Status == string(StatusActive)
}

// IsSuspended 检查用户是否被暂停
func (u *User) IsSuspended() bool {
	return u.Status == string(StatusSuspended)
}

// IsBanned 检查用户是否被封禁
func (u *User) IsBanned() bool {
	return u.Status == string(StatusBanned)
}

// CanLogin 检查用户是否可以登录
func (u *User) CanLogin() bool {
	return u.IsActive() && !u.IsBanned()
}

// HasRole 检查用户是否具有指定角色
func (u *User) HasRole(role UserRole) bool {
	return u.Role == string(role)
}

// HasAnyRole 检查用户是否具有任一指定角色
func (u *User) HasAnyRole(roles ...UserRole) bool {
	for _, role := range roles {
		if u.HasRole(role) {
			return true
		}
	}
	return false
}

// IsExpired 检查会话是否过期
func (s *UserSession) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}

// IsAccessToken 检查是否为访问token
func (s *UserSession) IsAccessToken() bool {
	return s.TokenType == string(TokenTypeAccess)
}

// IsRefreshToken 检查是否为刷新token
func (s *UserSession) IsRefreshToken() bool {
	return s.TokenType == string(TokenTypeRefresh)
}

// UpdateLastUsed 更新最后使用时间
func (s *UserSession) UpdateLastUsed() {
	s.LastUsedAt = time.Now()
}

// Deactivate 停用会话
func (s *UserSession) Deactivate() {
	s.IsActive = false
}

// GetAge 获取年龄
func (p *UserProfile) GetAge() int {
	if p.BirthDate == nil {
		return 0
	}
	now := time.Now()
	age := now.Year() - p.BirthDate.Year()
	if now.YearDay() < p.BirthDate.YearDay() {
		age--
	}
	return age
}

// HasAvatar 检查是否有头像
func (p *UserProfile) HasAvatar() bool {
	return p.Avatar != ""
}

// GetDisplayName 获取显示名称
func (p *UserProfile) GetDisplayName() string {
	if p.Nickname != "" {
		return p.Nickname
	}
	if p.User != nil {
		return p.User.Username
	}
	return "Unknown"
}