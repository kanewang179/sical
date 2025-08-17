package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Redis Redis缓存结构
type Redis struct {
	client *redis.Client
}

// Config Redis配置
type Config struct {
	Host         string
	Port         int
	Password     string
	DB           int
	PoolSize     int
	MinIdleConns int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

// New 创建新的Redis连接
func New(config *Config) (*Redis, error) {
	addr := fmt.Sprintf("%s:%d", config.Host, config.Port)

	client := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     config.Password,
		DB:           config.DB,
		PoolSize:     config.PoolSize,
		MinIdleConns: config.MinIdleConns,
		DialTimeout:  config.DialTimeout,
		ReadTimeout:  config.ReadTimeout,
		WriteTimeout: config.WriteTimeout,
	})

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &Redis{client: client}, nil
}

// Close 关闭Redis连接
func (r *Redis) Close() error {
	return r.client.Close()
}

// GetClient 获取Redis客户端
func (r *Redis) GetClient() *redis.Client {
	return r.client
}

// Set 设置键值对
func (r *Redis) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.client.Set(ctx, key, value, expiration).Err()
}

// Get 获取值
func (r *Redis) Get(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, key).Result()
}

// GetJSON 获取JSON值
func (r *Redis) GetJSON(ctx context.Context, key string, dest interface{}) error {
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(val), dest)
}

// SetJSON 设置JSON值
func (r *Redis) SetJSON(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(ctx, key, data, expiration).Err()
}

// Delete 删除键
func (r *Redis) Delete(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

// Exists 检查键是否存在
func (r *Redis) Exists(ctx context.Context, key string) (bool, error) {
	result, err := r.client.Exists(ctx, key).Result()
	return result > 0, err
}

// Expire 设置过期时间
func (r *Redis) Expire(ctx context.Context, key string, expiration time.Duration) error {
	return r.client.Expire(ctx, key, expiration).Err()
}

// TTL 获取剩余过期时间
func (r *Redis) TTL(ctx context.Context, key string) (time.Duration, error) {
	return r.client.TTL(ctx, key).Result()
}

// Increment 递增
func (r *Redis) Increment(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

// IncrementBy 按指定值递增
func (r *Redis) IncrementBy(ctx context.Context, key string, value int64) (int64, error) {
	return r.client.IncrBy(ctx, key, value).Result()
}

// Decrement 递减
func (r *Redis) Decrement(ctx context.Context, key string) (int64, error) {
	return r.client.Decr(ctx, key).Result()
}

// DecrementBy 按指定值递减
func (r *Redis) DecrementBy(ctx context.Context, key string, value int64) (int64, error) {
	return r.client.DecrBy(ctx, key, value).Result()
}

// HSet 设置哈希字段
func (r *Redis) HSet(ctx context.Context, key string, values ...interface{}) error {
	return r.client.HSet(ctx, key, values...).Err()
}

// HGet 获取哈希字段
func (r *Redis) HGet(ctx context.Context, key, field string) (string, error) {
	return r.client.HGet(ctx, key, field).Result()
}

// HGetAll 获取所有哈希字段
func (r *Redis) HGetAll(ctx context.Context, key string) (map[string]string, error) {
	return r.client.HGetAll(ctx, key).Result()
}

// HDel 删除哈希字段
func (r *Redis) HDel(ctx context.Context, key string, fields ...string) error {
	return r.client.HDel(ctx, key, fields...).Err()
}

// SAdd 添加集合成员
func (r *Redis) SAdd(ctx context.Context, key string, members ...interface{}) error {
	return r.client.SAdd(ctx, key, members...).Err()
}

// SMembers 获取集合所有成员
func (r *Redis) SMembers(ctx context.Context, key string) ([]string, error) {
	return r.client.SMembers(ctx, key).Result()
}

// SIsMember 检查是否为集合成员
func (r *Redis) SIsMember(ctx context.Context, key string, member interface{}) (bool, error) {
	return r.client.SIsMember(ctx, key, member).Result()
}

// SRem 移除集合成员
func (r *Redis) SRem(ctx context.Context, key string, members ...interface{}) error {
	return r.client.SRem(ctx, key, members...).Err()
}

// ZAdd 添加有序集合成员
func (r *Redis) ZAdd(ctx context.Context, key string, members ...redis.Z) error {
	return r.client.ZAdd(ctx, key, members...).Err()
}

// ZRange 获取有序集合范围
func (r *Redis) ZRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
	return r.client.ZRange(ctx, key, start, stop).Result()
}

// ZRangeWithScores 获取有序集合范围（带分数）
func (r *Redis) ZRangeWithScores(ctx context.Context, key string, start, stop int64) ([]redis.Z, error) {
	return r.client.ZRangeWithScores(ctx, key, start, stop).Result()
}

// ZRem 移除有序集合成员
func (r *Redis) ZRem(ctx context.Context, key string, members ...interface{}) error {
	return r.client.ZRem(ctx, key, members...).Err()
}

// Health 检查Redis健康状态
func (r *Redis) Health(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}

// Stats 获取Redis统计信息
func (r *Redis) Stats() *redis.PoolStats {
	return r.client.PoolStats()
}

// FlushDB 清空当前数据库
func (r *Redis) FlushDB(ctx context.Context) error {
	return r.client.FlushDB(ctx).Err()
}

// FlushAll 清空所有数据库
func (r *Redis) FlushAll(ctx context.Context) error {
	return r.client.FlushAll(ctx).Err()
}

// Keys 获取匹配模式的键
func (r *Redis) Keys(ctx context.Context, pattern string) ([]string, error) {
	return r.client.Keys(ctx, pattern).Result()
}

// IsNotFoundError 检查是否为键不存在错误
func IsNotFoundError(err error) bool {
	return err == redis.Nil
}