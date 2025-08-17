package pkg

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config 应用配置结构
type Config struct {
	Server   ServerConfig   `json:"server"`
	Database DatabaseConfig `json:"database"`
	Redis    RedisConfig    `json:"redis"`
	JWT      JWTConfig      `json:"jwt"`
	App      AppConfig      `json:"app"`
	Log      LogConfig      `json:"log"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port         int           `json:"port"`
	Host         string        `json:"host"`
	Mode         string        `json:"mode"` // debug, release, test
	ReadTimeout  time.Duration `json:"read_timeout"`
	WriteTimeout time.Duration `json:"write_timeout"`
	IdleTimeout  time.Duration `json:"idle_timeout"`
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Host            string        `json:"host"`
	Port            int           `json:"port"`
	User            string        `json:"user"`
	Password        string        `json:"password"`
	DBName          string        `json:"db_name"`
	SSLMode         string        `json:"ssl_mode"`
	MaxOpenConns    int           `json:"max_open_conns"`
	MaxIdleConns    int           `json:"max_idle_conns"`
	ConnMaxLifetime time.Duration `json:"conn_max_lifetime"`
	ConnMaxIdleTime time.Duration `json:"conn_max_idle_time"`
}

// RedisConfig Redis配置
type RedisConfig struct {
	Host         string        `json:"host"`
	Port         int           `json:"port"`
	Password     string        `json:"password"`
	DB           int           `json:"db"`
	PoolSize     int           `json:"pool_size"`
	MinIdleConns int           `json:"min_idle_conns"`
	DialTimeout  time.Duration `json:"dial_timeout"`
	ReadTimeout  time.Duration `json:"read_timeout"`
	WriteTimeout time.Duration `json:"write_timeout"`
}

// JWTConfig JWT配置
type JWTConfig struct {
	Secret           string        `json:"secret"`
	Expiration       time.Duration `json:"expiration"`
	RefreshExpiration time.Duration `json:"refresh_expiration"`
	Issuer           string        `json:"issuer"`
}

// AppConfig 应用配置
type AppConfig struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Environment string `json:"environment"` // development, testing, production
	Debug       bool   `json:"debug"`
	Timezone    string `json:"timezone"`
}

// LogConfig 日志配置
type LogConfig struct {
	Level      string `json:"level"`      // debug, info, warn, error
	Format     string `json:"format"`     // json, text
	Output     string `json:"output"`     // stdout, file
	FilePath   string `json:"file_path"`
	MaxSize    int    `json:"max_size"`    // MB
	MaxBackups int    `json:"max_backups"`
	MaxAge     int    `json:"max_age"`     // days
	Compress   bool   `json:"compress"`
}

// LoadConfig 加载配置
func LoadConfig() (*Config, error) {
	// 加载.env文件
	if err := godotenv.Load(); err != nil {
		// 在生产环境中，.env文件可能不存在，这是正常的
		fmt.Printf("Warning: .env file not found: %v\n", err)
	}

	config := &Config{
		Server: ServerConfig{
			Port:         getEnvAsInt("SERVER_PORT", 8080),
			Host:         getEnv("SERVER_HOST", "0.0.0.0"),
			Mode:         getEnv("GIN_MODE", "debug"),
			ReadTimeout:  getEnvAsDuration("SERVER_READ_TIMEOUT", "30s"),
			WriteTimeout: getEnvAsDuration("SERVER_WRITE_TIMEOUT", "30s"),
			IdleTimeout:  getEnvAsDuration("SERVER_IDLE_TIMEOUT", "60s"),
		},
		Database: DatabaseConfig{
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnvAsInt("DB_PORT", 5432),
			User:            getEnv("DB_USER", "postgres"),
			Password:        getEnv("DB_PASSWORD", ""),
			DBName:          getEnv("DB_NAME", "sical_go"),
			SSLMode:         getEnv("DB_SSL_MODE", "disable"),
			MaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
			ConnMaxLifetime: getEnvAsDuration("DB_CONN_MAX_LIFETIME", "1h"),
			ConnMaxIdleTime: getEnvAsDuration("DB_CONN_MAX_IDLE_TIME", "15m"),
		},
		Redis: RedisConfig{
			Host:         getEnv("REDIS_HOST", "localhost"),
			Port:         getEnvAsInt("REDIS_PORT", 6379),
			Password:     getEnv("REDIS_PASSWORD", ""),
			DB:           getEnvAsInt("REDIS_DB", 0),
			PoolSize:     getEnvAsInt("REDIS_POOL_SIZE", 10),
			MinIdleConns: getEnvAsInt("REDIS_MIN_IDLE_CONNS", 2),
			DialTimeout:  getEnvAsDuration("REDIS_DIAL_TIMEOUT", "5s"),
			ReadTimeout:  getEnvAsDuration("REDIS_READ_TIMEOUT", "3s"),
			WriteTimeout: getEnvAsDuration("REDIS_WRITE_TIMEOUT", "3s"),
		},
		JWT: JWTConfig{
			Secret:            getEnv("JWT_SECRET", "your-secret-key"),
			Expiration:        getEnvAsDuration("JWT_EXPIRATION", "24h"),
			RefreshExpiration: getEnvAsDuration("JWT_REFRESH_EXPIRATION", "168h"), // 7 days
			Issuer:            getEnv("JWT_ISSUER", "sical-go-backend"),
		},
		App: AppConfig{
			Name:        getEnv("APP_NAME", "SiCal Go Backend"),
			Version:     getEnv("APP_VERSION", "0.1.1"),
			Environment: getEnv("APP_ENV", "development"),
			Debug:       getEnvAsBool("APP_DEBUG", true),
			Timezone:    getEnv("APP_TIMEZONE", "Asia/Shanghai"),
		},
		Log: LogConfig{
			Level:      getEnv("LOG_LEVEL", "info"),
			Format:     getEnv("LOG_FORMAT", "json"),
			Output:     getEnv("LOG_OUTPUT", "stdout"),
			FilePath:   getEnv("LOG_FILE_PATH", "logs/app.log"),
			MaxSize:    getEnvAsInt("LOG_MAX_SIZE", 100),
			MaxBackups: getEnvAsInt("LOG_MAX_BACKUPS", 3),
			MaxAge:     getEnvAsInt("LOG_MAX_AGE", 28),
			Compress:   getEnvAsBool("LOG_COMPRESS", true),
		},
	}

	// 验证配置
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return config, nil
}

// Validate 验证配置
func (c *Config) Validate() error {
	if c.Server.Port <= 0 || c.Server.Port > 65535 {
		return fmt.Errorf("invalid server port: %d", c.Server.Port)
	}

	if c.Database.Host == "" {
		return fmt.Errorf("database host is required")
	}

	if c.Database.User == "" {
		return fmt.Errorf("database user is required")
	}

	if c.Database.DBName == "" {
		return fmt.Errorf("database name is required")
	}

	if c.JWT.Secret == "" || c.JWT.Secret == "your-secret-key" {
		return fmt.Errorf("JWT secret must be set and not use default value")
	}

	return nil
}

// GetDSN 获取数据库连接字符串
func (c *Config) GetDSN() string {
	if c.Database.Password != "" {
		return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
			c.Database.User,
			c.Database.Password,
			c.Database.Host,
			c.Database.Port,
			c.Database.DBName,
			c.Database.SSLMode,
		)
	} else {
		return fmt.Sprintf("postgres://%s@%s:%d/%s?sslmode=%s",
			c.Database.User,
			c.Database.Host,
			c.Database.Port,
			c.Database.DBName,
			c.Database.SSLMode,
		)
	}
}

// GetRedisAddr 获取Redis地址
func (c *Config) GetRedisAddr() string {
	return fmt.Sprintf("%s:%d", c.Redis.Host, c.Redis.Port)
}

// 辅助函数
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvAsDuration(key, defaultValue string) time.Duration {
	value := getEnv(key, defaultValue)
	if duration, err := time.ParseDuration(value); err == nil {
		return duration
	}
	// 如果解析失败，尝试解析默认值
	if duration, err := time.ParseDuration(defaultValue); err == nil {
		return duration
	}
	// 如果都失败，返回一个合理的默认值
	return 30 * time.Second
}