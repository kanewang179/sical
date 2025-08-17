package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"sical-go-backend/internal/api/handlers"
	"sical-go-backend/internal/api/middleware"
	"sical-go-backend/internal/api/routes"
	"sical-go-backend/internal/domain/services"
	"sical-go-backend/internal/infrastructure/cache"
	"sical-go-backend/internal/infrastructure/database"
	"sical-go-backend/internal/infrastructure/database/repositories"
	"sical-go-backend/internal/pkg"
	"sical-go-backend/pkg/hash"
	"sical-go-backend/pkg/jwt"
	"sical-go-backend/pkg/logger"
	"sical-go-backend/pkg/validator"
)

func main() {
	// 加载配置
	config, err := pkg.LoadConfig()
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 初始化日志器
	loggerInstance, err := logger.New(&logger.Config{
		Level:      config.Log.Level,
		Format:     config.Log.Format,
		Output:     config.Log.Output,
		FilePath:   config.Log.FilePath,
		MaxSize:    config.Log.MaxSize,
		MaxBackups: config.Log.MaxBackups,
		MaxAge:     config.Log.MaxAge,
		Compress:   config.Log.Compress,
	})
	if err != nil {
		log.Fatalf("初始化日志器失败: %v", err)
	}
	defer loggerInstance.Sync()

	// 设置全局日志器
	logger.SetGlobal(loggerInstance)

	loggerInstance.Info("正在启动服务器...",
		logger.String("version", config.App.Version),
		logger.String("environment", config.App.Environment),
	)

	// 初始化数据库
	db, err := database.New(&database.Config{
		Host:            config.Database.Host,
		Port:            config.Database.Port,
		User:            config.Database.User,
		Password:        config.Database.Password,
		DBName:          config.Database.DBName,
		SSLMode:         config.Database.SSLMode,
		Timezone:        config.Database.Timezone,
		MaxOpenConns:    config.Database.MaxOpenConns,
		MaxIdleConns:    config.Database.MaxIdleConns,
		ConnMaxLifetime: time.Duration(config.Database.ConnMaxLifetime) * time.Second,
		ConnMaxIdleTime: time.Duration(config.Database.ConnMaxIdleTime) * time.Second,
	})
	if err != nil {
		loggerInstance.Fatal("数据库连接失败", logger.Error(err))
	}
	defer db.Close()

	loggerInstance.Info("数据库连接成功")

	// 初始化Redis
	redisClient, err := cache.New(&cache.Config{
		Addr:         config.Redis.Addr,
		Password:     config.Redis.Password,
		DB:           config.Redis.DB,
		PoolSize:     config.Redis.PoolSize,
		MinIdleConns: config.Redis.MinIdleConns,
		MaxRetries:   config.Redis.MaxRetries,
		DialTimeout:  time.Duration(config.Redis.DialTimeout) * time.Second,
		ReadTimeout:  time.Duration(config.Redis.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(config.Redis.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(config.Redis.IdleTimeout) * time.Second,
	})
	if err != nil {
		loggerInstance.Fatal("Redis连接失败", logger.Error(err))
	}
	defer redisClient.Close()

	loggerInstance.Info("Redis连接成功")

	// 初始化JWT管理器
	jwtManager := jwt.NewJWTManager(&jwt.Config{
		SecretKey:            config.JWT.SecretKey,
		AccessTokenExpiry:    config.JWT.AccessTokenExpiry,
		RefreshTokenExpiry:   config.JWT.RefreshTokenExpiry,
		RefreshSecretKey:     config.JWT.RefreshSecretKey,
		Issuer:               config.JWT.Issuer,
	})

	// 初始化验证器
	validatorInstance := validator.New()

	// 初始化密码哈希器
	passwordHasher := hash.NewBcryptHasher(12)

	// 初始化仓储层
	userRepo := repositories.NewUserRepository(db.GetDB())
	userProfileRepo := repositories.NewUserProfileRepository(db.GetDB())
	userSessionRepo := repositories.NewUserSessionRepository(db.GetDB())

	// 初始化服务层
	userService := services.NewUserService(
		userRepo,
		userProfileRepo,
		userSessionRepo,
		jwtManager,
		validatorInstance,
		passwordHasher,
	)

	// 初始化处理器层
	userHandler := handlers.NewUserHandler(userService)

	// 初始化中间件
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	// 设置Gin模式
	if config.App.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else if config.App.Debug {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.TestMode)
	}

	// 创建Gin引擎
	engine := gin.New()

	// 添加全局中间件
	engine.Use(gin.Logger())
	engine.Use(gin.Recovery())

	// 设置路由
	router := routes.NewRouter(userHandler, authMiddleware)
	router.SetupRoutes(engine)

	// 创建HTTP服务器
	server := &http.Server{
		Addr:           fmt.Sprintf(":%d", config.Server.Port),
		Handler:        engine,
		ReadTimeout:    time.Duration(config.Server.ReadTimeout) * time.Second,
		WriteTimeout:   time.Duration(config.Server.WriteTimeout) * time.Second,
		IdleTimeout:    time.Duration(config.Server.IdleTimeout) * time.Second,
		MaxHeaderBytes: 1 << 20, // 1MB
	}

	// 启动服务器
	go func() {
		loggerInstance.Info("服务器启动",
			logger.String("address", server.Addr),
			logger.String("environment", config.App.Environment),
		)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			loggerInstance.Fatal("服务器启动失败", logger.Error(err))
		}
	}()

	// 等待中断信号以优雅地关闭服务器
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	loggerInstance.Info("正在关闭服务器...")

	// 设置5秒的超时时间来关闭服务器
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		loggerInstance.Fatal("服务器强制关闭", logger.Error(err))
	}

	loggerInstance.Info("服务器已关闭")
}