package database

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

// Database 数据库结构
type Database struct {
	DB *gorm.DB
}

// Config 数据库配置
type Config struct {
	Host            string
	Port            int
	User            string
	Password        string
	DBName          string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
	LogLevel        logger.LogLevel
}

// New 创建新的数据库连接
func New(config *Config) (*Database, error) {
	// 构建DSN - 使用URL格式
	var dsn string
	if config.Password != "" {
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
			config.User,
			config.Password,
			config.Host,
			config.Port,
			config.DBName,
			config.SSLMode,
		)
	} else {
		dsn = fmt.Sprintf("postgres://%s@%s:%d/%s?sslmode=%s",
			config.User,
			config.Host,
			config.Port,
			config.DBName,
			config.SSLMode,
		)
	}



	// GORM配置
	gormConfig := &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix:   "",
			SingularTable: false,
		},
		Logger: logger.Default.LogMode(config.LogLevel),
	}

	// 连接数据库
	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// 获取底层sql.DB
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// 设置连接池参数
	sqlDB.SetMaxOpenConns(config.MaxOpenConns)
	sqlDB.SetMaxIdleConns(config.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(config.ConnMaxLifetime)
	sqlDB.SetConnMaxIdleTime(config.ConnMaxIdleTime)

	// 测试连接
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Database{DB: db}, nil
}

// Close 关闭数据库连接
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// GetDB 获取GORM数据库实例
func (d *Database) GetDB() *gorm.DB {
	return d.DB
}

// Health 检查数据库健康状态
func (d *Database) Health() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// Stats 获取数据库连接统计信息
func (d *Database) Stats() (map[string]interface{}, error) {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return nil, err
	}

	stats := sqlDB.Stats()
	return map[string]interface{}{
		"max_open_connections": stats.MaxOpenConnections,
		"open_connections":     stats.OpenConnections,
		"in_use":               stats.InUse,
		"idle":                 stats.Idle,
		"wait_count":           stats.WaitCount,
		"wait_duration":        stats.WaitDuration,
		"max_idle_closed":      stats.MaxIdleClosed,
		"max_idle_time_closed": stats.MaxIdleTimeClosed,
		"max_lifetime_closed":  stats.MaxLifetimeClosed,
	}, nil
}

// Transaction 执行事务
func (d *Database) Transaction(fn func(*gorm.DB) error) error {
	return d.DB.Transaction(fn)
}

// Migrate 执行数据库迁移
func (d *Database) Migrate(models ...interface{}) error {
	return d.DB.AutoMigrate(models...)
}

// IsRecordNotFoundError 检查是否为记录未找到错误
func IsRecordNotFoundError(err error) bool {
	return err == gorm.ErrRecordNotFound
}

// IsDuplicateKeyError 检查是否为重复键错误
func IsDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}
	// PostgreSQL重复键错误代码
	return err.Error() == "ERROR: duplicate key value violates unique constraint"
}