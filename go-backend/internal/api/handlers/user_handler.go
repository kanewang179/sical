package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"sical-go-backend/internal/domain/services"
	"sical-go-backend/pkg/errors"
	"sical-go-backend/pkg/response"
)

// UserHandler 用户处理器
type UserHandler struct {
	userService services.UserService
}

// NewUserHandler 创建用户处理器
func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// Register 用户注册
// @Summary 用户注册
// @Description 创建新用户账户
// @Tags 用户认证
// @Accept json
// @Produce json
// @Param request body services.RegisterUserRequest true "注册信息"
// @Success 201 {object} response.Response{data=services.AuthResponse} "注册成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 409 {object} response.Response "用户名或邮箱已存在"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var req services.RegisterUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数格式错误")
		return
	}

	authResp, err := h.userService.RegisterUser(c.Request.Context(), &req)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.Created(c, authResp)
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户登录获取访问令牌
// @Tags 用户认证
// @Accept json
// @Produce json
// @Param request body services.LoginUserRequest true "登录信息"
// @Success 200 {object} response.Response{data=services.AuthResponse} "登录成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "用户名或密码错误"
// @Failure 403 {object} response.Response "账户已被禁用"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var req services.LoginUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数格式错误")
		return
	}

	authResp, err := h.userService.LoginUser(c.Request.Context(), &req)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.Success(c, authResp)
}

// Logout 用户登出
// @Summary 用户登出
// @Description 用户登出，使当前令牌失效
// @Tags 用户认证
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response "登出成功"
// @Failure 401 {object} response.Response "未授权"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/auth/logout [post]
func (h *UserHandler) Logout(c *gin.Context) {
	// 从上下文获取用户信息
	userID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "未授权访问")
		return
	}

	tokenID, exists := c.Get("token_id")
	if !exists {
		response.Unauthorized(c, "令牌信息缺失")
		return
	}

	err := h.userService.Logout(c.Request.Context(), userID.(uint), tokenID.(string))
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.SuccessWithMessage(c, "登出成功", nil)
}

// RefreshToken 刷新令牌
// @Summary 刷新访问令牌
// @Description 使用刷新令牌获取新的访问令牌
// @Tags 用户认证
// @Accept json
// @Produce json
// @Param request body map[string]string true "刷新令牌" example({"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."})
// @Success 200 {object} response.Response{data=services.TokenResponse} "刷新成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "刷新令牌无效或已过期"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/auth/refresh [post]
func (h *UserHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数格式错误")
		return
	}

	tokenResp, err := h.userService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.Success(c, tokenResp)
}

// GetProfile 获取用户资料
// @Summary 获取用户资料
// @Description 获取当前用户的详细资料信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=services.UserProfileResponse} "获取成功"
// @Failure 401 {object} response.Response "未授权"
// @Failure 404 {object} response.Response "用户不存在"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/user/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "未授权访问")
		return
	}

	profile, err := h.userService.GetProfile(c.Request.Context(), userID.(uint))
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.Success(c, profile)
}

// UpdateProfile 更新用户资料
// @Summary 更新用户资料
// @Description 更新当前用户的资料信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.UpdateProfileRequest true "更新信息"
// @Success 200 {object} response.Response "更新成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未授权"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/user/profile [put]
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "未授权访问")
		return
	}

	var req services.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数格式错误")
		return
	}

	err := h.userService.UpdateProfile(c.Request.Context(), userID.(uint), &req)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.SuccessWithMessage(c, "更新用户资料成功", nil)
}

// ChangePassword 修改密码
// @Summary 修改密码
// @Description 修改当前用户的登录密码
// @Tags 用户管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.ChangePasswordRequest true "密码信息"
// @Success 200 {object} response.Response "修改成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未授权或原密码错误"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/user/password [put]
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "未授权访问")
		return
	}

	var req services.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数格式错误")
		return
	}

	err := h.userService.ChangePassword(c.Request.Context(), userID.(uint), &req)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.SuccessWithMessage(c, "密码修改成功", nil)
}

// ListUsers 获取用户列表（管理员）
// @Summary 获取用户列表
// @Description 管理员获取用户列表
// @Tags 用户管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Param keyword query string false "搜索关键词"
// @Param role query string false "用户角色"
// @Param status query string false "用户状态"
// @Param sort_by query string false "排序字段" Enums(id,username,email,created_at,updated_at)
// @Param sort_desc query bool false "是否降序" default(false)
// @Success 200 {object} response.Response{data=services.ListUsersResponse} "获取成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未授权"
// @Failure 403 {object} response.Response "权限不足"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/admin/users [get]
func (h *UserHandler) ListUsers(c *gin.Context) {
	// 检查管理员权限
	if !h.checkAdminPermission(c) {
		return
	}

	// 解析查询参数
	req := &services.ListUsersRequest{
		Page:     1,
		PageSize: 10,
	}

	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			req.Page = p
		}
	}

	if pageSize := c.Query("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil && ps > 0 && ps <= 100 {
			req.PageSize = ps
		}
	}

	req.Keyword = c.Query("keyword")
	req.Role = c.Query("role")
	req.Status = c.Query("status")
	req.SortBy = c.Query("sort_by")
	req.SortDesc = c.Query("sort_desc") == "true"

	users, err := h.userService.ListUsers(c.Request.Context(), req)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.Success(c, users)
}

// GetUserByID 根据ID获取用户详情（管理员）
// @Summary 获取用户详情
// @Description 管理员根据用户ID获取用户详细信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "用户ID"
// @Success 200 {object} response.Response{data=services.UserDetailResponse} "获取成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未授权"
// @Failure 403 {object} response.Response "权限不足"
// @Failure 404 {object} response.Response "用户不存在"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/admin/users/{id} [get]
func (h *UserHandler) GetUserByID(c *gin.Context) {
	// 检查管理员权限
	if !h.checkAdminPermission(c) {
		return
	}

	// 解析用户ID
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "用户ID格式错误")
		return
	}

	user, err := h.userService.GetUserByID(c.Request.Context(), uint(id))
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.Success(c, user)
}

// UpdateUserStatus 更新用户状态（管理员）
// @Summary 更新用户状态
// @Description 管理员更新用户状态（激活/禁用）
// @Tags 用户管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "用户ID"
// @Param request body map[string]string true "状态信息" example({"status": "active"})
// @Success 200 {object} response.Response "更新成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未授权"
// @Failure 403 {object} response.Response "权限不足"
// @Failure 404 {object} response.Response "用户不存在"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/admin/users/{id}/status [put]
func (h *UserHandler) UpdateUserStatus(c *gin.Context) {
	// 检查管理员权限
	if !h.checkAdminPermission(c) {
		return
	}

	// 解析用户ID
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "用户ID格式错误")
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=active inactive banned"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数格式错误")
		return
	}

	err = h.userService.UpdateUserStatus(c.Request.Context(), uint(id), req.Status)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.SuccessWithMessage(c, "用户状态更新成功", nil)
}

// UpdateUserRole 更新用户角色（管理员）
// @Summary 更新用户角色
// @Description 管理员更新用户角色
// @Tags 用户管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "用户ID"
// @Param request body map[string]string true "角色信息" example({"role": "admin"})
// @Success 200 {object} response.Response "更新成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未授权"
// @Failure 403 {object} response.Response "权限不足"
// @Failure 404 {object} response.Response "用户不存在"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Router /api/v1/admin/users/{id}/role [put]
func (h *UserHandler) UpdateUserRole(c *gin.Context) {
	// 检查管理员权限
	if !h.checkAdminPermission(c) {
		return
	}

	// 解析用户ID
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "用户ID格式错误")
		return
	}

	var req struct {
		Role string `json:"role" binding:"required,oneof=user admin super_admin"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数格式错误")
		return
	}

	err = h.userService.UpdateUserRole(c.Request.Context(), uint(id), req.Role)
	if err != nil {
		h.handleServiceError(c, err)
		return
	}

	response.SuccessWithMessage(c, "用户角色更新成功", nil)
}

// checkAdminPermission 检查管理员权限
func (h *UserHandler) checkAdminPermission(c *gin.Context) bool {
	role, exists := c.Get("user_role")
	if !exists {
		response.Unauthorized(c, "未授权访问")
		return false
	}

	userRole := role.(string)
	if userRole != "admin" && userRole != "super_admin" {
		response.Forbidden(c, "权限不足")
		return false
	}

	return true
}

// handleServiceError 处理服务层错误
func (h *UserHandler) handleServiceError(c *gin.Context, err error) {
	if appErr, ok := err.(*errors.AppError); ok {
		switch appErr.Type {
		case errors.ErrorTypeValidation:
			response.BadRequest(c, appErr.Message)
		case errors.ErrorTypeNotFound:
			response.NotFound(c, appErr.Message)
		case errors.ErrorTypeConflict:
			response.Conflict(c, appErr.Message)
		case errors.ErrorTypeUnauthorized:
			response.Unauthorized(c, appErr.Message)
		case errors.ErrorTypeForbidden:
			response.Forbidden(c, appErr.Message)
		default:
			response.InternalServerError(c, "服务器内部错误")
		}
	} else {
		response.InternalServerError(c, "服务器内部错误")
	}
}