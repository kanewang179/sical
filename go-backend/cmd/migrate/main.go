package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"sical-go-backend/internal/domain/entities"
	"sical-go-backend/internal/infrastructure/database"
	"sical-go-backend/internal/pkg"
	"sical-go-backend/pkg/logger"
)

func main() {
	// 解析命令行参数
	var (
		action = flag.String("action", "migrate", "迁移操作: migrate, rollback, seed")
		env    = flag.String("env", "development", "环境: development, production, test")
	)
	flag.Parse()

	// 加载配置
	config, err := pkg.LoadConfig()
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 初始化日志器配置
	loggerConfig := &logger.Config{
		Level:  "info",
		Format: "json",
		Output: "stdout",
	}

	// 初始化全局日志器
	if err := logger.Init(loggerConfig); err != nil {
		log.Fatalf("初始化全局日志器失败: %v", err)
	}

	logger.Info("开始数据库迁移",
		logger.String("action", *action),
		logger.String("environment", *env),
	)

	// 初始化数据库连接
	dbConfig := &database.Config{
		Host:            config.Database.Host,
		Port:            config.Database.Port,
		User:            config.Database.User,
		Password:        config.Database.Password,
		DBName:          config.Database.DBName,
		SSLMode:         config.Database.SSLMode,
		MaxOpenConns:    config.Database.MaxOpenConns,
		MaxIdleConns:    config.Database.MaxIdleConns,
		ConnMaxLifetime: config.Database.ConnMaxLifetime,
		ConnMaxIdleTime: config.Database.ConnMaxIdleTime,
	}

	db, err := database.New(dbConfig)
	if err != nil {
		logger.Fatal("数据库连接失败", logger.Err(err))
	}
	defer db.Close()

	logger.Info("数据库连接成功")

	// 执行迁移操作
	switch *action {
	case "migrate":
		if err := runMigration(db); err != nil {
			logger.Fatal("数据库迁移失败", logger.Err(err))
		}
	case "seed":
		if err := runSeed(db); err != nil {
			logger.Fatal("种子数据创建失败", logger.Err(err))
		}
	case "rollback":
		logger.Warn("回滚功能暂未实现")
	default:
		logger.Error("未知的迁移操作", logger.String("action", *action))
		os.Exit(1)
	}

	logger.Info("数据库迁移完成")
}

// runMigration 执行数据库迁移
func runMigration(db *database.Database) error {
	logger.Info("开始执行数据库迁移...")

	// 定义所有需要迁移的模型
	models := []interface{}{
		&entities.User{},
	}

	// 执行自动迁移
	for _, model := range models {
		modelName := fmt.Sprintf("%T", model)
		logger.Info("迁移模型", logger.String("model", modelName))
		
		if err := db.Migrate(model); err != nil {
			return fmt.Errorf("迁移模型 %s 失败: %w", modelName, err)
		}
	}

	logger.Info("数据库迁移成功完成")
	return nil
}

// runSeed 执行种子数据创建
func runSeed(db *database.Database) error {
	logger.Info("开始创建种子数据...")

	// 暂时没有种子数据需要创建
	// 可以在这里添加默认用户、角色等初始数据

	logger.Info("种子数据创建完成")
	return nil
}