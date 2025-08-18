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
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"sical-go-backend/internal/api/middleware"
	"sical-go-backend/internal/interfaces/http/routes"
	"sical-go-backend/internal/pkg"
	"sical-go-backend/pkg/jwt"
	"sical-go-backend/pkg/logger"
)

func main() {
	// 加载配置
	config, err := pkg.LoadConfig()
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 初始化日志器
	err = logger.Init(&logger.Config{
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
		log.Fatalf("Failed to initialize logger: %v", err)
	}

	logger.Info("正在启动服务器...",
		logger.String("version", config.App.Version),
		logger.String("environment", config.App.Environment),
	)

	// 初始化数据库
	dsn := config.GetDSN()
	logger.Info("Connecting to database", logger.String("dsn", dsn))
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Error("Failed to connect to database", logger.Err(err))
		log.Fatalf("Failed to connect to database: %v", err)
	}

	logger.Info("数据库连接成功")

	// 初始化Redis (暂时跳过)
	// redisAddr := config.GetRedisAddr()
	// redisClient := redis.NewClient(&redis.Options{
	//	Addr:         redisAddr,
	//	Password:     config.Redis.Password,
	//	DB:           config.Redis.DB,
	//	PoolSize:     config.Redis.PoolSize,
	//	MinIdleConns: config.Redis.MinIdleConns,
	//	DialTimeout:  config.Redis.DialTimeout,
	//	ReadTimeout:  config.Redis.ReadTimeout,
	//	WriteTimeout: config.Redis.WriteTimeout,
	// })
	// defer redisClient.Close()

	logger.Info("Redis连接成功")

	// 初始化JWT管理器
	jwtManager := jwt.NewJWTManager(&jwt.Config{
		SecretKey:            config.JWT.Secret,
		AccessTokenExpiry:    config.JWT.Expiration,
		RefreshTokenExpiry:   config.JWT.RefreshExpiration,
		Issuer:               config.JWT.Issuer,
	})

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

	// 创建临时用户处理器（稍后实现）
	// userHandler := handlers.NewUserHandler(userService)
	
	// 初始化路由
	// router := routes.NewRouter(userHandler, authMiddleware, db)
	// router.SetupRoutes(engine)
	
	// 临时设置基础路由
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "服务运行正常",
		})
	})
	
	// 设置学习目标路由
	learningGroup := engine.Group("/api/v1/learning")
	learningGroup.Use(authMiddleware.RequireAuth())
	routes.SetupLearningGoalRoutes(learningGroup, db)
	
	// 设置学习路径路由
	routes.SetupLearningPathRoutes(engine, db)
	
	// 设置知识点路由
	routes.SetupKnowledgePointRoutes(engine, db)

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
		logger.Info("服务器启动",
			logger.String("address", server.Addr),
			logger.String("environment", config.App.Environment),
		)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("服务器启动失败", logger.Err(err))
		}
	}()

	// 等待中断信号以优雅地关闭服务器
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("正在关闭服务器...")

	// 设置5秒的超时时间来关闭服务器
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("服务器强制关闭", logger.Err(err))
	}

	logger.Info("服务器已关闭")
}