package services

import (
	"context"
	"time"

	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/domain/repositories"
	apperrors "sical-go-backend/pkg/errors"
	"sical-go-backend/pkg/jwt"
	"sical-go-backend/pkg/validator"
)

// UserService 用户服务接口
type UserService interface {
	RegisterUser(ctx context.Context, req *RegisterUserRequest) (*AuthResponse, error)
	LoginUser(ctx context.Context, req *LoginUserRequest) (*AuthResponse, error)
	Logout(ctx context.Context, userID uint, tokenID string) error
	RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error)
	GetProfile(ctx context.Context, userID uint) (*UserProfileResponse, error)
	UpdateProfile(ctx context.Context, userID uint, req *UpdateProfileRequest) error
	ChangePassword(ctx context.Context, userID uint, req *ChangePasswordRequest) error
	ListUsers(ctx context.Context, req *ListUsersRequest) (*ListUsersResponse, error)
	GetUserByID(ctx context.Context, userID uint) (*UserDetailResponse, error)
	UpdateUserStatus(ctx context.Context, userID uint, status string) error
	UpdateUserRole(ctx context.Context, userID uint, role string) error
}

// RegisterUserRequest 注册用户请求
type RegisterUserRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// LoginUserRequest 登录用户请求
type LoginUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse 认证响应
type AuthResponse struct {
	User         *entities.User `json:"user"`
	AccessToken  string         `json:"access_token"`
	RefreshToken string         `json:"refresh_token"`
	TokenType    string         `json:"token_type"`
	ExpiresIn    int64          `json:"expires_in"`
}

// TokenResponse 令牌响应
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

// UserProfileResponse 用户资料响应
type UserProfileResponse struct {
	User    *entities.User        `json:"user"`
	Profile *entities.UserProfile `json:"profile"`
}

// UpdateProfileRequest 更新资料请求
type UpdateProfileRequest struct {
	Nickname  *string    `json:"nickname"`
	Avatar    *string    `json:"avatar"`
	Phone     *string    `json:"phone"`
	Bio       *string    `json:"bio"`
	Location  *string    `json:"location"`
	Timezone  *string    `json:"timezone"`
	Language  *string    `json:"language"`
	Gender    *string    `json:"gender"`
	BirthDate *time.Time `json:"birth_date"`
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

// ListUsersRequest 用户列表请求
type ListUsersRequest struct {
	Page     int    `json:"page"`
	PageSize int    `json:"page_size"`
	Keyword  string `json:"keyword"`
	Role     string `json:"role"`
	Status   string `json:"status"`
	SortBy   string `json:"sort_by"`
	SortDesc bool   `json:"sort_desc"`
}

// ListUsersResponse 用户列表响应
type ListUsersResponse struct {
	Users      []*entities.User `json:"users"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}

// UserDetailResponse 用户详情响应
type UserDetailResponse struct {
	User    *entities.User        `json:"user"`
	Profile *entities.UserProfile `json:"profile"`
}

// PasswordHasher 密码哈希接口
type PasswordHasher interface {
	HashPassword(password string) (string, error)
	CheckPassword(password, hash string) bool
}

// userService 用户服务实现
type userService struct {
	userRepo       repositories.UserRepository
	profileRepo    repositories.UserProfileRepository
	sessionRepo    repositories.UserSessionRepository
	jwtManager     *jwt.JWTManager
	validator      validator.Validator
	passwordHasher PasswordHasher
}

// NewUserService 创建用户服务
func NewUserService(
	userRepo repositories.UserRepository,
	profileRepo repositories.UserProfileRepository,
	sessionRepo repositories.UserSessionRepository,
	jwtManager *jwt.JWTManager,
	validator validator.Validator,
	passwordHasher PasswordHasher,
) UserService {
	return &userService{
		userRepo:       userRepo,
		profileRepo:    profileRepo,
		sessionRepo:    sessionRepo,
		jwtManager:     jwtManager,
		validator:      validator,
		passwordHasher: passwordHasher,
	}
}

// RegisterUser 注册用户
func (s *userService) RegisterUser(ctx context.Context, req *RegisterUserRequest) (*AuthResponse, error) {
	// 验证输入
	if err := s.validator.Validate(req); err != nil {
		return nil, apperrors.ErrValidationFailed.WithCause(err)
	}

	// 检查用户名是否已存在
	existingUser, err := s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}
	if existingUser != nil {
		return nil, apperrors.ErrUserExists
	}

	// 检查邮箱是否已存在
	existingUser, err = s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}
	if existingUser != nil {
		return nil, apperrors.ErrAlreadyExists.WithDetail("field", "email")
	}

	// 哈希密码
	hashedPassword, err := s.passwordHasher.HashPassword(req.Password)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	// 创建用户
	user := &entities.User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     string(entities.RoleUser),
		Status:   string(entities.StatusActive),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	// 创建用户资料
	profile := &entities.UserProfile{
		UserID:   user.ID,
		Nickname: req.Username,
	}

	if err := s.profileRepo.Create(ctx, profile); err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	// 生成JWT token
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Username, user.Email, user.Role)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	return &AuthResponse{
		User:         user,
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		TokenType:    tokenPair.TokenType,
		ExpiresIn:    tokenPair.ExpiresIn,
	}, nil
}

// LoginUser 用户登录
func (s *userService) LoginUser(ctx context.Context, req *LoginUserRequest) (*AuthResponse, error) {
	// 验证输入
	if err := s.validator.Validate(req); err != nil {
		return nil, apperrors.ErrValidationFailed.WithCause(err)
	}

	// 根据用户名或邮箱查找用户
	var user *entities.User
	var err error

	if req.Username != "" {
		user, err = s.userRepo.GetByUsername(ctx, req.Username)
	} else {
		user, err = s.userRepo.GetByEmail(ctx, req.Email)
	}

	if err != nil {
		return nil, apperrors.ErrUnauthorized.WithCause(err)
	}

	// 检查用户状态
	if user.Status != string(entities.StatusActive) {
		return nil, apperrors.ErrForbidden.WithDetail("reason", "Account is not active")
	}

	// 验证密码
	if !s.passwordHasher.CheckPassword(req.Password, user.Password) {
		return nil, apperrors.ErrUnauthorized.WithDetail("reason", "Invalid credentials")
	}

	// 生成JWT token
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Username, user.Email, user.Role)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	return &AuthResponse{
		User:         user,
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		TokenType:    tokenPair.TokenType,
		ExpiresIn:    tokenPair.ExpiresIn,
	}, nil
}

// Logout 用户登出
func (s *userService) Logout(ctx context.Context, userID uint, tokenID string) error {
	return s.sessionRepo.DeactivateByTokenID(ctx, tokenID)
}

// RefreshToken 刷新令牌
func (s *userService) RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error) {
	// 验证刷新令牌
	claims, err := s.jwtManager.ValidateToken(refreshToken)
	if err != nil {
		return nil, apperrors.ErrUnauthorized.WithCause(err)
	}

	// 获取用户信息
	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, apperrors.ErrUnauthorized.WithCause(err)
	}

	// 生成新的令牌对
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Username, user.Email, user.Role)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	return &TokenResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    tokenPair.ExpiresIn,
	}, nil
}

// GetProfile 获取用户资料
func (s *userService) GetProfile(ctx context.Context, userID uint) (*UserProfileResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, apperrors.ErrUserNotFound.WithCause(err)
	}

	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	return &UserProfileResponse{
		User:    user,
		Profile: profile,
	}, nil
}

// UpdateProfile 更新用户资料
func (s *userService) UpdateProfile(ctx context.Context, userID uint, req *UpdateProfileRequest) error {
	if err := s.validator.Validate(req); err != nil {
		return apperrors.ErrValidationFailed.WithCause(err)
	}

	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return apperrors.ErrUserNotFound.WithCause(err)
	}

	// 更新字段
	if req.Nickname != nil {
		profile.Nickname = *req.Nickname
	}
	if req.Avatar != nil {
		profile.Avatar = *req.Avatar
	}
	if req.Bio != nil {
		profile.Bio = *req.Bio
	}

	return s.profileRepo.Update(ctx, profile)
}

// ChangePassword 修改密码
func (s *userService) ChangePassword(ctx context.Context, userID uint, req *ChangePasswordRequest) error {
	if err := s.validator.Validate(req); err != nil {
		return apperrors.ErrValidationFailed.WithCause(err)
	}

	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return apperrors.ErrUserNotFound.WithCause(err)
	}

	// 验证旧密码
	if !s.passwordHasher.CheckPassword(req.OldPassword, user.Password) {
		return apperrors.ErrUnauthorized.WithDetail("reason", "Invalid old password")
	}

	// 哈希新密码
	newHashedPassword, err := s.passwordHasher.HashPassword(req.NewPassword)
	if err != nil {
		return apperrors.ErrInternalServer.WithCause(err)
	}

	// 更新密码
	user.Password = newHashedPassword
	return s.userRepo.Update(ctx, user)
}

// ListUsers 获取用户列表
func (s *userService) ListUsers(ctx context.Context, req *ListUsersRequest) (*ListUsersResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 20
	}

	// 计算偏移量
	offset := (req.Page - 1) * req.PageSize

	users, total, err := s.userRepo.List(ctx, offset, req.PageSize)
	if err != nil {
		return nil, apperrors.ErrInternalServer.WithCause(err)
	}

	// 计算总页数
	totalPages := int((total + int64(req.PageSize) - 1) / int64(req.PageSize))

	return &ListUsersResponse{
		Users:      users,
		Total:      total,
		Page:       req.Page,
		PageSize:   req.PageSize,
		TotalPages: totalPages,
	}, nil
}

// GetUserByID 根据ID获取用户详情
func (s *userService) GetUserByID(ctx context.Context, userID uint) (*UserDetailResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, apperrors.ErrUserNotFound.WithCause(err)
	}

	profile, _ := s.profileRepo.GetByUserID(ctx, userID)

	return &UserDetailResponse{
		User:    user,
		Profile: profile,
	}, nil
}

// UpdateUserStatus 更新用户状态
func (s *userService) UpdateUserStatus(ctx context.Context, userID uint, status string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return apperrors.ErrUserNotFound.WithCause(err)
	}

	user.Status = status
	return s.userRepo.Update(ctx, user)
}

// UpdateUserRole 更新用户角色
func (s *userService) UpdateUserRole(ctx context.Context, userID uint, role string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return apperrors.ErrUserNotFound.WithCause(err)
	}

	user.Role = role
	return s.userRepo.Update(ctx, user)
}