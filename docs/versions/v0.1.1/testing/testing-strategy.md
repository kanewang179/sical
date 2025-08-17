# 智能学习规划应用 - 测试策略文档 v0.1.1

## 📋 文档信息

| 项目 | 智能学习规划应用 测试策略 |
|------|----------------------------|
| **版本** | v0.1.1 |
| **后端技术** | Go + Gin + GORM |
| **更新日期** | 2024-01-15 |
| **状态** | 开发中 |

## 🎯 测试策略概览

### 测试金字塔
```
                    ┌─────────────────┐
                    │   E2E Tests     │  <- 少量，关键业务流程
                    │     (5%)        │
                    └─────────────────┘
                  ┌───────────────────────┐
                  │  Integration Tests    │  <- 中等数量，API和服务集成
                  │       (25%)           │
                  └───────────────────────┘
              ┌─────────────────────────────────┐
              │      Unit Tests                 │  <- 大量，函数和方法级别
              │        (70%)                    │
              └─────────────────────────────────┘
```

### 测试目标
- **代码覆盖率**: 目标 ≥ 80%
- **API覆盖率**: 目标 100%
- **关键路径覆盖**: 目标 100%
- **性能基准**: 响应时间 < 200ms (P95)
- **并发处理**: 支持 1000+ 并发用户

### 测试环境
- **开发环境**: 本地Docker容器
- **测试环境**: Kubernetes集群
- **预发布环境**: 生产环境镜像
- **生产环境**: 监控和告警

## 🧪 单元测试

### 1.1 测试框架选择

#### 主要测试库
```go
// go.mod
module sical-backend

require (
    github.com/stretchr/testify v1.8.4
    github.com/golang/mock v1.6.0
    github.com/DATA-DOG/go-sqlmock v1.5.0
    github.com/go-redis/redismock/v9 v9.2.0
    github.com/gin-gonic/gin v1.9.1
    github.com/onsi/ginkgo/v2 v2.13.0
    github.com/onsi/gomega v1.29.0
)
```

#### 测试工具配置
```go
package testutil

import (
    "database/sql"
    "testing"
    
    "github.com/DATA-DOG/go-sqlmock"
    "github.com/go-redis/redismock/v9"
    "github.com/stretchr/testify/suite"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

// 测试套件基类
type TestSuite struct {
    suite.Suite
    DB       *gorm.DB
    SQLMock  sqlmock.Sqlmock
    RedisMock redismock.ClientMock
}

func (suite *TestSuite) SetupTest() {
    // 设置数据库Mock
    db, mock, err := sqlmock.New()
    suite.Require().NoError(err)
    
    gormDB, err := gorm.Open(postgres.New(postgres.Config{
        Conn: db,
    }), &gorm.Config{})
    suite.Require().NoError(err)
    
    suite.DB = gormDB
    suite.SQLMock = mock
    
    // 设置Redis Mock
    redisMock := redismock.NewClientMock()
    suite.RedisMock = redisMock
}

func (suite *TestSuite) TearDownTest() {
    suite.SQLMock.ExpectationsWereMet()
}
```

### 1.2 Repository层测试

#### 用户Repository测试
```go
package repository_test

import (
    "regexp"
    "testing"
    "time"
    
    "github.com/DATA-DOG/go-sqlmock"
    "github.com/stretchr/testify/suite"
    "sical-backend/internal/domain"
    "sical-backend/internal/repository"
    "sical-backend/pkg/testutil"
)

type UserRepositoryTestSuite struct {
    testutil.TestSuite
    userRepo *repository.UserRepository
}

func (suite *UserRepositoryTestSuite) SetupTest() {
    suite.TestSuite.SetupTest()
    suite.userRepo = repository.NewUserRepository(suite.DB)
}

func (suite *UserRepositoryTestSuite) TestCreateUser() {
    // 准备测试数据
    user := &domain.User{
        Username: "testuser",
        Email:    "test@example.com",
        Password: "hashedpassword",
        Status:   "active",
    }
    
    // 设置SQL期望
    suite.SQLMock.ExpectBegin()
    suite.SQLMock.ExpectQuery(
        regexp.QuoteMeta(`INSERT INTO "users" ("username","email","password","status","created_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6) RETURNING "id"`),
    ).WithArgs(
        user.Username,
        user.Email,
        user.Password,
        user.Status,
        sqlmock.AnyArg(),
        sqlmock.AnyArg(),
    ).WillReturnRows(
        sqlmock.NewRows([]string{"id"}).AddRow(1),
    )
    suite.SQLMock.ExpectCommit()
    
    // 执行测试
    err := suite.userRepo.Create(user)
    
    // 验证结果
    suite.NoError(err)
    suite.Equal(uint64(1), user.ID)
}

func (suite *UserRepositoryTestSuite) TestGetUserByEmail() {
    // 准备测试数据
    email := "test@example.com"
    expectedUser := &domain.User{
        ID:       1,
        Username: "testuser",
        Email:    email,
        Status:   "active",
        CreatedAt: time.Now(),
    }
    
    // 设置SQL期望
    rows := sqlmock.NewRows([]string{"id", "username", "email", "status", "created_at"}).
        AddRow(expectedUser.ID, expectedUser.Username, expectedUser.Email, expectedUser.Status, expectedUser.CreatedAt)
    
    suite.SQLMock.ExpectQuery(
        regexp.QuoteMeta(`SELECT * FROM "users" WHERE email = $1 AND deleted_at IS NULL ORDER BY "users"."id" LIMIT 1`),
    ).WithArgs(email).WillReturnRows(rows)
    
    // 执行测试
    user, err := suite.userRepo.GetByEmail(email)
    
    // 验证结果
    suite.NoError(err)
    suite.Equal(expectedUser.ID, user.ID)
    suite.Equal(expectedUser.Username, user.Username)
    suite.Equal(expectedUser.Email, user.Email)
}

func (suite *UserRepositoryTestSuite) TestGetUserByEmail_NotFound() {
    email := "notfound@example.com"
    
    // 设置SQL期望 - 返回空结果
    suite.SQLMock.ExpectQuery(
        regexp.QuoteMeta(`SELECT * FROM "users" WHERE email = $1 AND deleted_at IS NULL ORDER BY "users"."id" LIMIT 1`),
    ).WithArgs(email).WillReturnError(gorm.ErrRecordNotFound)
    
    // 执行测试
    user, err := suite.userRepo.GetByEmail(email)
    
    // 验证结果
    suite.Error(err)
    suite.Nil(user)
    suite.Equal(repository.ErrUserNotFound, err)
}

func TestUserRepositoryTestSuite(t *testing.T) {
    suite.Run(t, new(UserRepositoryTestSuite))
}
```

### 1.3 Service层测试

#### 用户Service测试
```go
package service_test

import (
    "errors"
    "testing"
    
    "github.com/golang/mock/gomock"
    "github.com/stretchr/testify/suite"
    "sical-backend/internal/domain"
    "sical-backend/internal/service"
    "sical-backend/mocks"
)

type UserServiceTestSuite struct {
    suite.Suite
    ctrl         *gomock.Controller
    userRepo     *mocks.MockUserRepository
    passwordSvc  *mocks.MockPasswordService
    userService  *service.UserService
}

func (suite *UserServiceTestSuite) SetupTest() {
    suite.ctrl = gomock.NewController(suite.T())
    suite.userRepo = mocks.NewMockUserRepository(suite.ctrl)
    suite.passwordSvc = mocks.NewMockPasswordService(suite.ctrl)
    suite.userService = service.NewUserService(suite.userRepo, suite.passwordSvc)
}

func (suite *UserServiceTestSuite) TearDownTest() {
    suite.ctrl.Finish()
}

func (suite *UserServiceTestSuite) TestRegisterUser_Success() {
    // 准备测试数据
    req := &service.RegisterRequest{
        Username: "testuser",
        Email:    "test@example.com",
        Password: "password123",
    }
    
    hashedPassword := "$2a$12$hashedpassword"
    
    // 设置Mock期望
    suite.userRepo.EXPECT().
        GetByEmail(req.Email).
        Return(nil, repository.ErrUserNotFound)
    
    suite.userRepo.EXPECT().
        GetByUsername(req.Username).
        Return(nil, repository.ErrUserNotFound)
    
    suite.passwordSvc.EXPECT().
        HashPassword(req.Password).
        Return(hashedPassword, nil)
    
    suite.userRepo.EXPECT().
        Create(gomock.Any()).
        DoAndReturn(func(user *domain.User) error {
            user.ID = 1
            return nil
        })
    
    // 执行测试
    user, err := suite.userService.Register(req)
    
    // 验证结果
    suite.NoError(err)
    suite.Equal(uint64(1), user.ID)
    suite.Equal(req.Username, user.Username)
    suite.Equal(req.Email, user.Email)
    suite.Equal(hashedPassword, user.Password)
}

func (suite *UserServiceTestSuite) TestRegisterUser_EmailExists() {
    req := &service.RegisterRequest{
        Username: "testuser",
        Email:    "test@example.com",
        Password: "password123",
    }
    
    existingUser := &domain.User{
        ID:    1,
        Email: req.Email,
    }
    
    // 设置Mock期望
    suite.userRepo.EXPECT().
        GetByEmail(req.Email).
        Return(existingUser, nil)
    
    // 执行测试
    user, err := suite.userService.Register(req)
    
    // 验证结果
    suite.Error(err)
    suite.Nil(user)
    suite.Equal(service.ErrEmailAlreadyExists, err)
}

func (suite *UserServiceTestSuite) TestLoginUser_Success() {
    // 准备测试数据
    req := &service.LoginRequest{
        Email:    "test@example.com",
        Password: "password123",
    }
    
    user := &domain.User{
        ID:       1,
        Email:    req.Email,
        Password: "$2a$12$hashedpassword",
        Status:   "active",
    }
    
    // 设置Mock期望
    suite.userRepo.EXPECT().
        GetByEmail(req.Email).
        Return(user, nil)
    
    suite.passwordSvc.EXPECT().
        VerifyPassword(req.Password, user.Password).
        Return(true)
    
    // 执行测试
    result, err := suite.userService.Login(req)
    
    // 验证结果
    suite.NoError(err)
    suite.Equal(user.ID, result.ID)
    suite.Equal(user.Email, result.Email)
}

func TestUserServiceTestSuite(t *testing.T) {
    suite.Run(t, new(UserServiceTestSuite))
}
```

### 1.4 Handler层测试

#### HTTP Handler测试
```go
package handler_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    
    "github.com/gin-gonic/gin"
    "github.com/golang/mock/gomock"
    "github.com/stretchr/testify/suite"
    "sical-backend/internal/handler"
    "sical-backend/internal/service"
    "sical-backend/mocks"
)

type UserHandlerTestSuite struct {
    suite.Suite
    ctrl        *gomock.Controller
    userService *mocks.MockUserService
    handler     *handler.UserHandler
    router      *gin.Engine
}

func (suite *UserHandlerTestSuite) SetupTest() {
    gin.SetMode(gin.TestMode)
    
    suite.ctrl = gomock.NewController(suite.T())
    suite.userService = mocks.NewMockUserService(suite.ctrl)
    suite.handler = handler.NewUserHandler(suite.userService)
    
    suite.router = gin.New()
    suite.router.POST("/register", suite.handler.Register)
    suite.router.POST("/login", suite.handler.Login)
}

func (suite *UserHandlerTestSuite) TearDownTest() {
    suite.ctrl.Finish()
}

func (suite *UserHandlerTestSuite) TestRegister_Success() {
    // 准备测试数据
    reqBody := map[string]string{
        "username": "testuser",
        "email":    "test@example.com",
        "password": "password123",
    }
    
    user := &domain.User{
        ID:       1,
        Username: reqBody["username"],
        Email:    reqBody["email"],
        Status:   "active",
    }
    
    // 设置Mock期望
    suite.userService.EXPECT().
        Register(gomock.Any()).
        Return(user, nil)
    
    // 准备HTTP请求
    jsonBody, _ := json.Marshal(reqBody)
    req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(jsonBody))
    req.Header.Set("Content-Type", "application/json")
    
    // 执行请求
    w := httptest.NewRecorder()
    suite.router.ServeHTTP(w, req)
    
    // 验证响应
    suite.Equal(http.StatusCreated, w.Code)
    
    var response map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &response)
    suite.NoError(err)
    
    suite.Equal("success", response["status"])
    suite.Equal("用户注册成功", response["message"])
    
    userData := response["data"].(map[string]interface{})
    suite.Equal(float64(1), userData["id"])
    suite.Equal(reqBody["username"], userData["username"])
    suite.Equal(reqBody["email"], userData["email"])
}

func (suite *UserHandlerTestSuite) TestRegister_ValidationError() {
    // 准备无效的测试数据
    reqBody := map[string]string{
        "username": "", // 空用户名
        "email":    "invalid-email", // 无效邮箱
        "password": "123", // 密码太短
    }
    
    // 准备HTTP请求
    jsonBody, _ := json.Marshal(reqBody)
    req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(jsonBody))
    req.Header.Set("Content-Type", "application/json")
    
    // 执行请求
    w := httptest.NewRecorder()
    suite.router.ServeHTTP(w, req)
    
    // 验证响应
    suite.Equal(http.StatusBadRequest, w.Code)
    
    var response map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &response)
    suite.NoError(err)
    
    suite.Equal("error", response["status"])
    suite.Contains(response["message"], "验证失败")
}

func TestUserHandlerTestSuite(t *testing.T) {
    suite.Run(t, new(UserHandlerTestSuite))
}
```

## 🔗 集成测试

### 2.1 API集成测试

#### 测试环境设置
```go
package integration_test

import (
    "context"
    "fmt"
    "testing"
    
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/suite"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/modules/postgres"
    "github.com/testcontainers/testcontainers-go/modules/redis"
    "sical-backend/internal/app"
    "sical-backend/internal/config"
)

type IntegrationTestSuite struct {
    suite.Suite
    app           *app.App
    router        *gin.Engine
    pgContainer   *postgres.PostgresContainer
    redisContainer *redis.RedisContainer
    dbURL         string
    redisURL      string
}

func (suite *IntegrationTestSuite) SetupSuite() {
    ctx := context.Background()
    
    // 启动PostgreSQL容器
    pgContainer, err := postgres.RunContainer(ctx,
        testcontainers.WithImage("postgres:15-alpine"),
        postgres.WithDatabase("testdb"),
        postgres.WithUsername("testuser"),
        postgres.WithPassword("testpass"),
        testcontainers.WithWaitStrategy(wait.ForLog("database system is ready to accept connections")),
    )
    suite.Require().NoError(err)
    suite.pgContainer = pgContainer
    
    // 获取数据库连接信息
    host, err := pgContainer.Host(ctx)
    suite.Require().NoError(err)
    port, err := pgContainer.MappedPort(ctx, "5432")
    suite.Require().NoError(err)
    
    suite.dbURL = fmt.Sprintf("postgres://testuser:testpass@%s:%s/testdb?sslmode=disable", host, port.Port())
    
    // 启动Redis容器
    redisContainer, err := redis.RunContainer(ctx,
        testcontainers.WithImage("redis:7-alpine"),
    )
    suite.Require().NoError(err)
    suite.redisContainer = redisContainer
    
    // 获取Redis连接信息
    redisHost, err := redisContainer.Host(ctx)
    suite.Require().NoError(err)
    redisPort, err := redisContainer.MappedPort(ctx, "6379")
    suite.Require().NoError(err)
    
    suite.redisURL = fmt.Sprintf("%s:%s", redisHost, redisPort.Port())
    
    // 初始化应用
    cfg := &config.Config{
        Database: config.DatabaseConfig{
            URL: suite.dbURL,
        },
        Redis: config.RedisConfig{
            Host: redisHost,
            Port: redisPort.Int(),
        },
        JWT: config.JWTConfig{
            Secret: "test-secret",
            Expiry: 3600,
        },
    }
    
    suite.app, err = app.NewApp(cfg)
    suite.Require().NoError(err)
    
    suite.router = suite.app.Router()
    
    // 运行数据库迁移
    err = suite.app.Migrate()
    suite.Require().NoError(err)
}

func (suite *IntegrationTestSuite) TearDownSuite() {
    ctx := context.Background()
    
    if suite.pgContainer != nil {
        suite.pgContainer.Terminate(ctx)
    }
    
    if suite.redisContainer != nil {
        suite.redisContainer.Terminate(ctx)
    }
}

func (suite *IntegrationTestSuite) SetupTest() {
    // 清理测试数据
    suite.app.DB().Exec("TRUNCATE TABLE users, learning_goals, learning_paths RESTART IDENTITY CASCADE")
    suite.app.Redis().FlushAll(context.Background())
}
```

#### 用户注册登录流程测试
```go
func (suite *IntegrationTestSuite) TestUserRegistrationAndLogin() {
    // 1. 用户注册
    registerReq := map[string]string{
        "username": "testuser",
        "email":    "test@example.com",
        "password": "Password123!",
    }
    
    registerResp := suite.makeRequest("POST", "/api/v1/auth/register", registerReq)
    suite.Equal(http.StatusCreated, registerResp.Code)
    
    var registerResult map[string]interface{}
    err := json.Unmarshal(registerResp.Body.Bytes(), &registerResult)
    suite.NoError(err)
    
    suite.Equal("success", registerResult["status"])
    userData := registerResult["data"].(map[string]interface{})
    userID := userData["id"].(float64)
    
    // 2. 用户登录
    loginReq := map[string]string{
        "email":    "test@example.com",
        "password": "Password123!",
    }
    
    loginResp := suite.makeRequest("POST", "/api/v1/auth/login", loginReq)
    suite.Equal(http.StatusOK, loginResp.Code)
    
    var loginResult map[string]interface{}
    err = json.Unmarshal(loginResp.Body.Bytes(), &loginResult)
    suite.NoError(err)
    
    suite.Equal("success", loginResult["status"])
    tokenData := loginResult["data"].(map[string]interface{})
    accessToken := tokenData["access_token"].(string)
    suite.NotEmpty(accessToken)
    
    // 3. 使用Token访问受保护的资源
    profileResp := suite.makeAuthenticatedRequest("GET", "/api/v1/user/profile", nil, accessToken)
    suite.Equal(http.StatusOK, profileResp.Code)
    
    var profileResult map[string]interface{}
    err = json.Unmarshal(profileResp.Body.Bytes(), &profileResult)
    suite.NoError(err)
    
    profileData := profileResult["data"].(map[string]interface{})
    suite.Equal(userID, profileData["id"])
    suite.Equal("testuser", profileData["username"])
    suite.Equal("test@example.com", profileData["email"])
}

func (suite *IntegrationTestSuite) makeRequest(method, path string, body interface{}) *httptest.ResponseRecorder {
    var reqBody []byte
    if body != nil {
        reqBody, _ = json.Marshal(body)
    }
    
    req := httptest.NewRequest(method, path, bytes.NewBuffer(reqBody))
    req.Header.Set("Content-Type", "application/json")
    
    w := httptest.NewRecorder()
    suite.router.ServeHTTP(w, req)
    
    return w
}

func (suite *IntegrationTestSuite) makeAuthenticatedRequest(method, path string, body interface{}, token string) *httptest.ResponseRecorder {
    var reqBody []byte
    if body != nil {
        reqBody, _ = json.Marshal(body)
    }
    
    req := httptest.NewRequest(method, path, bytes.NewBuffer(reqBody))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+token)
    
    w := httptest.NewRecorder()
    suite.router.ServeHTTP(w, req)
    
    return w
}
```

### 2.2 数据库集成测试

#### 事务测试
```go
func (suite *IntegrationTestSuite) TestDatabaseTransaction() {
    // 开始事务
    tx := suite.app.DB().Begin()
    
    // 创建用户
    user := &domain.User{
        Username: "txuser",
        Email:    "tx@example.com",
        Password: "hashedpass",
        Status:   "active",
    }
    
    err := tx.Create(user).Error
    suite.NoError(err)
    suite.NotZero(user.ID)
    
    // 创建学习目标
    goal := &domain.LearningGoal{
        UserID:      user.ID,
        Title:       "Test Goal",
        Description: "Test Description",
        Status:      "active",
    }
    
    err = tx.Create(goal).Error
    suite.NoError(err)
    
    // 模拟错误，回滚事务
    tx.Rollback()
    
    // 验证数据未被保存
    var count int64
    suite.app.DB().Model(&domain.User{}).Where("email = ?", user.Email).Count(&count)
    suite.Equal(int64(0), count)
    
    suite.app.DB().Model(&domain.LearningGoal{}).Where("title = ?", goal.Title).Count(&count)
    suite.Equal(int64(0), count)
}
```

## 🚀 性能测试

### 3.1 基准测试

#### API性能基准
```go
package benchmark_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    
    "github.com/gin-gonic/gin"
    "sical-backend/internal/app"
)

func BenchmarkUserRegistration(b *testing.B) {
    gin.SetMode(gin.ReleaseMode)
    
    app := setupTestApp()
    router := app.Router()
    
    reqBody := map[string]string{
        "username": "benchuser",
        "email":    "bench@example.com",
        "password": "Password123!",
    }
    
    jsonBody, _ := json.Marshal(reqBody)
    
    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
            req.Header.Set("Content-Type", "application/json")
            
            w := httptest.NewRecorder()
            router.ServeHTTP(w, req)
            
            if w.Code != http.StatusCreated {
                b.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
            }
        }
    })
}

func BenchmarkUserLogin(b *testing.B) {
    gin.SetMode(gin.ReleaseMode)
    
    app := setupTestApp()
    router := app.Router()
    
    // 预先创建用户
    setupTestUser(app)
    
    reqBody := map[string]string{
        "email":    "bench@example.com",
        "password": "Password123!",
    }
    
    jsonBody, _ := json.Marshal(reqBody)
    
    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
            req.Header.Set("Content-Type", "application/json")
            
            w := httptest.NewRecorder()
            router.ServeHTTP(w, req)
            
            if w.Code != http.StatusOK {
                b.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
            }
        }
    })
}

func BenchmarkDatabaseQuery(b *testing.B) {
    app := setupTestApp()
    userRepo := repository.NewUserRepository(app.DB())
    
    // 预先创建测试数据
    for i := 0; i < 1000; i++ {
        user := &domain.User{
            Username: fmt.Sprintf("user%d", i),
            Email:    fmt.Sprintf("user%d@example.com", i),
            Password: "hashedpass",
            Status:   "active",
        }
        userRepo.Create(user)
    }
    
    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            email := fmt.Sprintf("user%d@example.com", rand.Intn(1000))
            _, err := userRepo.GetByEmail(email)
            if err != nil {
                b.Error(err)
            }
        }
    })
}
```

### 3.2 负载测试

#### K6负载测试脚本
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');

// 测试配置
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // 2分钟内逐渐增加到100用户
    { duration: '5m', target: 100 },   // 保持100用户5分钟
    { duration: '2m', target: 200 },   // 2分钟内增加到200用户
    { duration: '5m', target: 200 },   // 保持200用户5分钟
    { duration: '2m', target: 0 },     // 2分钟内减少到0用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95%的请求响应时间小于500ms
    http_req_failed: ['rate<0.1'],      // 错误率小于10%
    errors: ['rate<0.1'],               // 自定义错误率小于10%
  },
};

const BASE_URL = 'http://localhost:8080/api/v1';

// 测试数据
const users = [];
for (let i = 0; i < 1000; i++) {
  users.push({
    username: `user${i}`,
    email: `user${i}@example.com`,
    password: 'Password123!'
  });
}

export function setup() {
  // 预先注册一些用户
  for (let i = 0; i < 100; i++) {
    const user = users[i];
    const response = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status !== 201) {
      console.error(`Failed to register user ${user.email}: ${response.status}`);
    }
  }
  
  return { users: users.slice(0, 100) };
}

export default function(data) {
  // 随机选择一个用户
  const user = data.users[Math.floor(Math.random() * data.users.length)];
  
  // 1. 用户登录
  const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!loginSuccess);
  
  if (loginSuccess) {
    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.data.access_token;
    
    // 2. 获取用户资料
    const profileResponse = http.get(`${BASE_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const profileSuccess = check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    errorRate.add(!profileSuccess);
    
    // 3. 创建学习目标
    const goalResponse = http.post(`${BASE_URL}/learning-goals`, JSON.stringify({
      title: `Goal ${Math.random()}`,
      description: 'Test learning goal',
      target_date: '2024-12-31'
    }), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const goalSuccess = check(goalResponse, {
      'goal creation status is 201': (r) => r.status === 201,
      'goal creation response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    errorRate.add(!goalSuccess);
  }
  
  sleep(1); // 等待1秒
}

export function teardown(data) {
  console.log('Load test completed');
}
```

#### 运行负载测试
```bash
#!/bin/bash

# 安装k6
brew install k6

# 启动应用
docker-compose up -d

# 等待应用启动
sleep 30

# 运行负载测试
k6 run --out json=results.json load-test.js

# 生成报告
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
```

## 🔍 端到端测试

### 4.1 Playwright E2E测试

#### 测试配置
```javascript
// playwright.config.js
module.exports = {
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
};
```

#### 用户注册登录E2E测试
```javascript
// e2e/auth.spec.js
const { test, expect } = require('@playwright/test');

test.describe('用户认证流程', () => {
  test.beforeEach(async ({ page }) => {
    // 清理测试数据
    await page.request.post('/api/test/cleanup');
  });
  
  test('用户注册和登录流程', async ({ page }) => {
    // 1. 访问注册页面
    await page.goto('/register');
    
    // 2. 填写注册表单
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirm-password"]', 'Password123!');
    
    // 3. 提交注册
    await page.click('[data-testid="register-button"]');
    
    // 4. 验证注册成功
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('注册成功');
    
    // 5. 跳转到登录页面
    await page.click('[data-testid="login-link"]');
    
    // 6. 填写登录表单
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    
    // 7. 提交登录
    await page.click('[data-testid="login-button"]');
    
    // 8. 验证登录成功
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="username"]')).toContainText('testuser');
  });
  
  test('登录验证错误处理', async ({ page }) => {
    await page.goto('/login');
    
    // 测试空表单提交
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('邮箱不能为空');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('密码不能为空');
    
    // 测试无效邮箱
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('邮箱格式不正确');
    
    // 测试错误的登录凭据
    await page.fill('[data-testid="email"]', 'wrong@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('邮箱或密码错误');
  });
});
```

### 4.2 学习目标管理E2E测试

```javascript
// e2e/learning-goals.spec.js
const { test, expect } = require('@playwright/test');

test.describe('学习目标管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录用户
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('创建学习目标', async ({ page }) => {
    // 1. 导航到学习目标页面
    await page.click('[data-testid="learning-goals-nav"]');
    await expect(page).toHaveURL('/learning-goals');
    
    // 2. 点击创建按钮
    await page.click('[data-testid="create-goal-button"]');
    
    // 3. 填写目标表单
    await page.fill('[data-testid="goal-title"]', '学习Go语言');
    await page.fill('[data-testid="goal-description"]', '掌握Go语言基础语法和并发编程');
    await page.selectOption('[data-testid="goal-category"]', 'programming');
    await page.fill('[data-testid="target-date"]', '2024-12-31');
    
    // 4. 提交表单
    await page.click('[data-testid="submit-goal"]');
    
    // 5. 验证目标创建成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('学习目标创建成功');
    await expect(page.locator('[data-testid="goal-list"]')).toContainText('学习Go语言');
  });
  
  test('编辑学习目标', async ({ page }) => {
    // 假设已有目标存在
    await page.goto('/learning-goals');
    
    // 点击编辑按钮
    await page.click('[data-testid="edit-goal-1"]');
    
    // 修改目标信息
    await page.fill('[data-testid="goal-title"]', '深入学习Go语言');
    await page.fill('[data-testid="goal-description"]', '掌握Go语言高级特性和性能优化');
    
    // 保存修改
    await page.click('[data-testid="save-goal"]');
    
    // 验证修改成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('学习目标更新成功');
    await expect(page.locator('[data-testid="goal-list"]')).toContainText('深入学习Go语言');
  });
});
```

## 📊 测试报告与覆盖率

### 5.1 测试覆盖率配置

#### 覆盖率收集
```bash
#!/bin/bash

# 运行测试并收集覆盖率
go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

# 生成HTML报告
go tool cover -html=coverage.out -o coverage.html

# 生成覆盖率统计
go tool cover -func=coverage.out

# 检查覆盖率阈值
COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')
THRESHOLD=80

if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
    echo "Coverage $COVERAGE% is below threshold $THRESHOLD%"
    exit 1
else
    echo "Coverage $COVERAGE% meets threshold $THRESHOLD%"
fi
```

### 5.2 CI/CD集成

#### GitHub Actions测试工作流
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'
    
    - name: Cache Go modules
      uses: actions/cache@v3
      with:
        path: ~/go/pkg/mod
        key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
    
    - name: Install dependencies
      run: go mod download
    
    - name: Run unit tests
      run: |
        go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
      env:
        DB_HOST: localhost
        DB_PORT: 5432
        DB_USER: postgres
        DB_PASSWORD: postgres
        DB_NAME: test_db
        REDIS_HOST: localhost
        REDIS_PORT: 6379
    
    - name: Run integration tests
      run: |
        go test -v -tags=integration ./tests/integration/...
      env:
        DB_HOST: localhost
        DB_PORT: 5432
        DB_USER: postgres
        DB_PASSWORD: postgres
        DB_NAME: test_db
        REDIS_HOST: localhost
        REDIS_PORT: 6379
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.out
        flags: unittests
        name: codecov-umbrella
    
    - name: Generate test report
      run: |
        go install github.com/jstemmer/go-junit-report/v2@latest
        go test -v ./... 2>&1 | go-junit-report -set-exit-code > report.xml
    
    - name: Publish test results
      uses: EnricoMi/publish-unit-test-result-action@v2
      if: always()
      with:
        files: report.xml
```

---

**文档维护**: 本文档随测试需求变化持续更新  
**最后更新**: 2024-01-15  
**负责人**: 测试工程师