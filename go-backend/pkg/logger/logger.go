package logger

import (
	"io"
	"os"
	"path/filepath"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

// Logger 日志器接口
type Logger interface {
	Debug(msg string, fields ...zap.Field)
	Info(msg string, fields ...zap.Field)
	Warn(msg string, fields ...zap.Field)
	Error(msg string, fields ...zap.Field)
	Fatal(msg string, fields ...zap.Field)
	With(fields ...zap.Field) Logger
	Sync() error
}

// zapLogger zap日志器实现
type zapLogger struct {
	zap *zap.Logger
}

// Config 日志配置
type Config struct {
	Level      string `json:"level"`      // debug, info, warn, error
	Format     string `json:"format"`     // json, text
	Output     string `json:"output"`     // stdout, file, both
	FilePath   string `json:"file_path"`
	MaxSize    int    `json:"max_size"`    // MB
	MaxBackups int    `json:"max_backups"`
	MaxAge     int    `json:"max_age"`     // days
	Compress   bool   `json:"compress"`
}

// DefaultConfig 默认配置
func DefaultConfig() *Config {
	return &Config{
		Level:      "info",
		Format:     "json",
		Output:     "stdout",
		FilePath:   "logs/app.log",
		MaxSize:    100,
		MaxBackups: 3,
		MaxAge:     28,
		Compress:   true,
	}
}

// New 创建新的日志器
func New(config *Config) (Logger, error) {
	if config == nil {
		config = DefaultConfig()
	}

	// 解析日志级别
	level, err := zapcore.ParseLevel(config.Level)
	if err != nil {
		level = zapcore.InfoLevel
	}

	// 创建编码器配置
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		FunctionKey:    zapcore.OmitKey,
		MessageKey:     "message",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.TimeEncoderOfLayout("2006-01-02 15:04:05.000"),
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	// 选择编码器
	var encoder zapcore.Encoder
	if config.Format == "json" {
		encoder = zapcore.NewJSONEncoder(encoderConfig)
	} else {
		encoder = zapcore.NewConsoleEncoder(encoderConfig)
	}

	// 创建写入器
	var writers []zapcore.WriteSyncer

	switch config.Output {
	case "stdout":
		writers = append(writers, zapcore.AddSync(os.Stdout))
	case "file":
		fileWriter, err := createFileWriter(config)
		if err != nil {
			return nil, err
		}
		writers = append(writers, zapcore.AddSync(fileWriter))
	case "both":
		writers = append(writers, zapcore.AddSync(os.Stdout))
		fileWriter, err := createFileWriter(config)
		if err != nil {
			return nil, err
		}
		writers = append(writers, zapcore.AddSync(fileWriter))
	default:
		writers = append(writers, zapcore.AddSync(os.Stdout))
	}

	// 创建核心
	core := zapcore.NewCore(
		encoder,
		zapcore.NewMultiWriteSyncer(writers...),
		level,
	)

	// 创建日志器
	zapLog := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return &zapLogger{zap: zapLog}, nil
}

// createFileWriter 创建文件写入器
func createFileWriter(config *Config) (io.Writer, error) {
	// 确保目录存在
	dir := filepath.Dir(config.FilePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	return &lumberjack.Logger{
		Filename:   config.FilePath,
		MaxSize:    config.MaxSize,
		MaxBackups: config.MaxBackups,
		MaxAge:     config.MaxAge,
		Compress:   config.Compress,
		LocalTime:  true,
	}, nil
}

// Debug 调试日志
func (l *zapLogger) Debug(msg string, fields ...zap.Field) {
	l.zap.Debug(msg, fields...)
}

// Info 信息日志
func (l *zapLogger) Info(msg string, fields ...zap.Field) {
	l.zap.Info(msg, fields...)
}

// Warn 警告日志
func (l *zapLogger) Warn(msg string, fields ...zap.Field) {
	l.zap.Warn(msg, fields...)
}

// Error 错误日志
func (l *zapLogger) Error(msg string, fields ...zap.Field) {
	l.zap.Error(msg, fields...)
}

// Fatal 致命错误日志
func (l *zapLogger) Fatal(msg string, fields ...zap.Field) {
	l.zap.Fatal(msg, fields...)
}

// With 添加字段
func (l *zapLogger) With(fields ...zap.Field) Logger {
	return &zapLogger{zap: l.zap.With(fields...)}
}

// Sync 同步日志
func (l *zapLogger) Sync() error {
	return l.zap.Sync()
}

// 全局日志器
var globalLogger Logger

// Init 初始化全局日志器
func Init(config *Config) error {
	logger, err := New(config)
	if err != nil {
		return err
	}
	globalLogger = logger
	return nil
}

// GetLogger 获取全局日志器
func GetLogger() Logger {
	if globalLogger == nil {
		// 如果没有初始化，使用默认配置
		logger, _ := New(DefaultConfig())
		globalLogger = logger
	}
	return globalLogger
}

// 全局日志函数

// Debug 调试日志
func Debug(msg string, fields ...zap.Field) {
	GetLogger().Debug(msg, fields...)
}

// Info 信息日志
func Info(msg string, fields ...zap.Field) {
	GetLogger().Info(msg, fields...)
}

// Warn 警告日志
func Warn(msg string, fields ...zap.Field) {
	GetLogger().Warn(msg, fields...)
}

// Error 错误日志
func Error(msg string, fields ...zap.Field) {
	GetLogger().Error(msg, fields...)
}

// Fatal 致命错误日志
func Fatal(msg string, fields ...zap.Field) {
	GetLogger().Fatal(msg, fields...)
}

// With 添加字段
func With(fields ...zap.Field) Logger {
	return GetLogger().With(fields...)
}

// Sync 同步日志
func Sync() error {
	return GetLogger().Sync()
}

// 常用字段函数

// String 字符串字段
func String(key, val string) zap.Field {
	return zap.String(key, val)
}

// Int 整数字段
func Int(key string, val int) zap.Field {
	return zap.Int(key, val)
}

// Int64 64位整数字段
func Int64(key string, val int64) zap.Field {
	return zap.Int64(key, val)
}

// Uint 无符号整数字段
func Uint(key string, val uint) zap.Field {
	return zap.Uint(key, val)
}

// Float64 浮点数字段
func Float64(key string, val float64) zap.Field {
	return zap.Float64(key, val)
}

// Bool 布尔字段
func Bool(key string, val bool) zap.Field {
	return zap.Bool(key, val)
}

// Duration 时间间隔字段
func Duration(key string, val time.Duration) zap.Field {
	return zap.Duration(key, val)
}

// Time 时间字段
func Time(key string, val time.Time) zap.Field {
	return zap.Time(key, val)
}

// Error 错误字段
func Err(err error) zap.Field {
	return zap.Error(err)
}

// Any 任意类型字段
func Any(key string, val interface{}) zap.Field {
	return zap.Any(key, val)
}