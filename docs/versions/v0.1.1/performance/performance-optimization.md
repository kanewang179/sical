# 智能学习规划应用 - 性能优化文档 v0.1.1

## 📋 文档信息

| 项目 | 智能学习规划应用 性能优化 |
|------|----------------------------|
| **版本** | v0.1.1 |
| **后端技术** | Go + Gin + GORM |
| **更新日期** | 2024-01-15 |
| **状态** | 开发中 |

## 🎯 性能目标

### 核心性能指标

| 指标类型 | 目标值 | 当前值 | 优化策略 |
|----------|--------|--------|----------|
| **API响应时间** | P95 < 200ms | - | 缓存、数据库优化 |
| **数据库查询** | P95 < 50ms | - | 索引优化、查询优化 |
| **并发处理** | 1000+ QPS | - | 连接池、协程优化 |
| **内存使用** | < 512MB | - | 内存池、GC优化 |
| **CPU使用率** | < 70% | - | 算法优化、缓存 |
| **错误率** | < 0.1% | - | 容错机制、监控 |

### 性能基准测试

```go
// 性能基准配置
type PerformanceTargets struct {
    APIResponseTime    time.Duration `json:"api_response_time"`     // P95 < 200ms
    DatabaseQueryTime  time.Duration `json:"database_query_time"`  // P95 < 50ms
    ConcurrentUsers    int           `json:"concurrent_users"`      // 1000+
    ThroughputQPS      int           `json:"throughput_qps"`        // 1000+ QPS
    MemoryUsage        int64         `json:"memory_usage"`          // < 512MB
    CPUUsage           float64       `json:"cpu_usage"`             // < 70%
    ErrorRate          float64       `json:"error_rate"`            // < 0.1%
}

var DefaultTargets = PerformanceTargets{
    APIResponseTime:   200 * time.Millisecond,
    DatabaseQueryTime: 50 * time.Millisecond,
    ConcurrentUsers:   1000,
    ThroughputQPS:     1000,
    MemoryUsage:       512 * 1024 * 1024, // 512MB
    CPUUsage:          0.7,                // 70%
    ErrorRate:         0.001,              // 0.1%
}
```

## 🚀 应用层性能优化

### 1.1 HTTP服务器优化

#### Gin框架配置优化
```go
package server

import (
    "context"
    "net/http"
    "time"
    
    "github.com/gin-gonic/gin"
    "golang.org/x/time/rate"
)

// 高性能服务器配置
func NewOptimizedServer() *http.Server {
    gin.SetMode(gin.ReleaseMode)
    
    router := gin.New()
    
    // 自定义中间件
    router.Use(
        gin.Recovery(),
        RequestIDMiddleware(),
        CORSMiddleware(),
        CompressionMiddleware(),
        RateLimitMiddleware(),
        MetricsMiddleware(),
    )
    
    return &http.Server{
        Addr:           ":8080",
        Handler:        router,
        ReadTimeout:    10 * time.Second,
        WriteTimeout:   10 * time.Second,
        IdleTimeout:    60 * time.Second,
        MaxHeaderBytes: 1 << 20, // 1MB
    }
}

// 压缩中间件
func CompressionMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        // 只对大于1KB的响应进行压缩
        if c.Request.Header.Get("Accept-Encoding") != "" {
            c.Header("Content-Encoding", "gzip")
        }
        c.Next()
    })
}

// 限流中间件
func RateLimitMiddleware() gin.HandlerFunc {
    limiter := rate.NewLimiter(rate.Limit(100), 200) // 100 QPS, 突发200
    
    return gin.HandlerFunc(func(c *gin.Context) {
        if !limiter.Allow() {
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "Rate limit exceeded",
            })
            c.Abort()
            return
        }
        c.Next()
    })
}
```

#### 连接池优化
```go
package config

import (
    "net/http"
    "time"
)

// HTTP客户端连接池配置
func NewOptimizedHTTPClient() *http.Client {
    transport := &http.Transport{
        MaxIdleConns:        100,              // 最大空闲连接数
        MaxIdleConnsPerHost: 10,               // 每个主机最大空闲连接数
        MaxConnsPerHost:     100,              // 每个主机最大连接数
        IdleConnTimeout:     90 * time.Second, // 空闲连接超时
        TLSHandshakeTimeout: 10 * time.Second, // TLS握手超时
        DisableCompression:  false,            // 启用压缩
    }
    
    return &http.Client{
        Transport: transport,
        Timeout:   30 * time.Second,
    }
}
```

### 1.2 内存管理优化

#### 对象池模式
```go
package pool

import (
    "sync"
    "bytes"
)

// 字节缓冲池
var ByteBufferPool = sync.Pool{
    New: func() interface{} {
        return &bytes.Buffer{}
    },
}

// 获取缓冲区
func GetBuffer() *bytes.Buffer {
    return ByteBufferPool.Get().(*bytes.Buffer)
}

// 归还缓冲区
func PutBuffer(buf *bytes.Buffer) {
    buf.Reset()
    ByteBufferPool.Put(buf)
}

// 响应对象池
type Response struct {
    Status  string      `json:"status"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

var ResponsePool = sync.Pool{
    New: func() interface{} {
        return &Response{}
    },
}

func GetResponse() *Response {
    return ResponsePool.Get().(*Response)
}

func PutResponse(resp *Response) {
    resp.Status = ""
    resp.Message = ""
    resp.Data = nil
    ResponsePool.Put(resp)
}
```

#### GC优化配置
```go
package main

import (
    "runtime"
    "runtime/debug"
    "time"
)

func init() {
    // 设置GC目标百分比
    debug.SetGCPercent(100)
    
    // 设置最大处理器数
    runtime.GOMAXPROCS(runtime.NumCPU())
    
    // 定期强制GC（在低负载时）
    go func() {
        ticker := time.NewTicker(5 * time.Minute)
        defer ticker.Stop()
        
        for range ticker.C {
            runtime.GC()
        }
    }()
}

// 内存监控
func GetMemoryStats() runtime.MemStats {
    var m runtime.MemStats
    runtime.ReadMemStats(&m)
    return m
}
```

## 🗄️ 数据库性能优化

### 2.1 GORM配置优化

#### 连接池配置
```go
package database

import (
    "time"
    
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

func NewOptimizedDB(dsn string) (*gorm.DB, error) {
    config := &gorm.Config{
        Logger: logger.Default.LogMode(logger.Silent), // 生产环境关闭SQL日志
        PrepareStmt: true,                             // 预编译语句
        DisableForeignKeyConstraintWhenMigrating: true, // 迁移时禁用外键约束
    }
    
    db, err := gorm.Open(postgres.Open(dsn), config)
    if err != nil {
        return nil, err
    }
    
    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }
    
    // 连接池配置
    sqlDB.SetMaxIdleConns(10)                   // 最大空闲连接数
    sqlDB.SetMaxOpenConns(100)                  // 最大打开连接数
    sqlDB.SetConnMaxLifetime(time.Hour)         // 连接最大生存时间
    sqlDB.SetConnMaxIdleTime(10 * time.Minute)  // 连接最大空闲时间
    
    return db, nil
}
```

#### 查询优化
```go
package repository

import (
    "context"
    "time"
    
    "gorm.io/gorm"
    "sical-backend/internal/domain"
)

type OptimizedUserRepository struct {
    db *gorm.DB
}

// 批量查询优化
func (r *OptimizedUserRepository) GetUsersByIDs(ctx context.Context, ids []uint64) ([]*domain.User, error) {
    var users []*domain.User
    
    // 使用IN查询，限制批量大小
    const batchSize = 100
    for i := 0; i < len(ids); i += batchSize {
        end := i + batchSize
        if end > len(ids) {
            end = len(ids)
        }
        
        var batch []*domain.User
        err := r.db.WithContext(ctx).
            Select("id, username, email, status, created_at"). // 只选择需要的字段
            Where("id IN ?", ids[i:end]).
            Find(&batch).Error
        
        if err != nil {
            return nil, err
        }
        
        users = append(users, batch...)
    }
    
    return users, nil
}

// 分页查询优化
func (r *OptimizedUserRepository) GetUsersWithPagination(ctx context.Context, offset, limit int) ([]*domain.User, int64, error) {
    var users []*domain.User
    var total int64
    
    // 并行执行计数和查询
    errChan := make(chan error, 2)
    
    // 计数查询
    go func() {
        err := r.db.WithContext(ctx).
            Model(&domain.User{}).
            Where("deleted_at IS NULL").
            Count(&total).Error
        errChan <- err
    }()
    
    // 数据查询
    go func() {
        err := r.db.WithContext(ctx).
            Select("id, username, email, status, created_at").
            Where("deleted_at IS NULL").
            Order("created_at DESC").
            Offset(offset).
            Limit(limit).
            Find(&users).Error
        errChan <- err
    }()
    
    // 等待两个查询完成
    for i := 0; i < 2; i++ {
        if err := <-errChan; err != nil {
            return nil, 0, err
        }
    }
    
    return users, total, nil
}

// 预加载优化
func (r *OptimizedUserRepository) GetUserWithGoals(ctx context.Context, userID uint64) (*domain.User, error) {
    var user domain.User
    
    err := r.db.WithContext(ctx).
        Preload("LearningGoals", func(db *gorm.DB) *gorm.DB {
            return db.Select("id, user_id, title, status, created_at"). // 只预加载需要的字段
                Where("status = ?", "active").
                Order("created_at DESC")
        }).
        First(&user, userID).Error
    
    return &user, err
}
```

### 2.2 索引优化策略

#### 复合索引设计
```sql
-- 用户表索引优化
CREATE INDEX CONCURRENTLY idx_users_email_status ON users(email, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_users_status_created ON users(status, created_at DESC) WHERE deleted_at IS NULL;

-- 学习目标表索引优化
CREATE INDEX CONCURRENTLY idx_learning_goals_user_status ON learning_goals(user_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_learning_goals_category_status ON learning_goals(category, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_learning_goals_target_date ON learning_goals(target_date) WHERE status = 'active';

-- 学习路径表索引优化
CREATE INDEX CONCURRENTLY idx_learning_paths_goal_order ON learning_paths(learning_goal_id, order_index);
CREATE INDEX CONCURRENTLY idx_learning_paths_status_updated ON learning_paths(status, updated_at DESC);

-- 知识点表索引优化
CREATE INDEX CONCURRENTLY idx_knowledge_points_path_order ON knowledge_points(learning_path_id, order_index);
CREATE INDEX CONCURRENTLY idx_knowledge_points_difficulty ON knowledge_points(difficulty_level, category);

-- 评估测试表索引优化
CREATE INDEX CONCURRENTLY idx_assessments_user_created ON assessments(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_assessments_type_status ON assessments(assessment_type, status);

-- 评论表索引优化
CREATE INDEX CONCURRENTLY idx_comments_target_created ON comments(target_type, target_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_comments_user_created ON comments(user_id, created_at DESC);
```

#### 部分索引优化
```sql
-- 只为活跃用户创建索引
CREATE INDEX CONCURRENTLY idx_active_users_email ON users(email) WHERE status = 'active' AND deleted_at IS NULL;

-- 只为未完成的学习目标创建索引
CREATE INDEX CONCURRENTLY idx_incomplete_goals ON learning_goals(user_id, target_date) 
WHERE status IN ('active', 'in_progress') AND deleted_at IS NULL;

-- 只为最近的评估创建索引
CREATE INDEX CONCURRENTLY idx_recent_assessments ON assessments(user_id, score) 
WHERE created_at > NOW() - INTERVAL '30 days';
```

### 2.3 查询性能监控

#### 慢查询监控
```go
package monitoring

import (
    "context"
    "time"
    
    "github.com/prometheus/client_golang/prometheus"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

// 数据库性能指标
var (
    dbQueryDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "db_query_duration_seconds",
            Help: "Database query duration in seconds",
            Buckets: []float64{0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0},
        },
        []string{"operation", "table"},
    )
    
    dbQueryTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "db_queries_total",
            Help: "Total number of database queries",
        },
        []string{"operation", "table", "status"},
    )
)

// 自定义GORM日志记录器
type MetricsLogger struct {
    logger.Interface
}

func (l *MetricsLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
    elapsed := time.Since(begin)
    sql, rows := fc()
    
    // 解析SQL获取操作类型和表名
    operation, table := parseSQLOperation(sql)
    
    // 记录指标
    dbQueryDuration.WithLabelValues(operation, table).Observe(elapsed.Seconds())
    
    status := "success"
    if err != nil {
        status = "error"
    }
    dbQueryTotal.WithLabelValues(operation, table, status).Inc()
    
    // 记录慢查询
    if elapsed > 100*time.Millisecond {
        logger.Default.Warn(ctx, "Slow query detected", 
            "duration", elapsed,
            "sql", sql,
            "rows", rows,
            "error", err,
        )
    }
    
    // 调用原始日志记录器
    l.Interface.Trace(ctx, begin, fc, err)
}

func parseSQLOperation(sql string) (operation, table string) {
    // 简单的SQL解析逻辑
    // 实际实现中可以使用更复杂的SQL解析器
    if strings.HasPrefix(strings.ToUpper(sql), "SELECT") {
        return "SELECT", extractTableName(sql)
    } else if strings.HasPrefix(strings.ToUpper(sql), "INSERT") {
        return "INSERT", extractTableName(sql)
    } else if strings.HasPrefix(strings.ToUpper(sql), "UPDATE") {
        return "UPDATE", extractTableName(sql)
    } else if strings.HasPrefix(strings.ToUpper(sql), "DELETE") {
        return "DELETE", extractTableName(sql)
    }
    return "UNKNOWN", "unknown"
}
```

## 🔄 缓存优化策略

### 3.1 Redis缓存配置

#### 连接池优化
```go
package cache

import (
    "context"
    "encoding/json"
    "time"
    
    "github.com/redis/go-redis/v9"
)

// 优化的Redis客户端配置
func NewOptimizedRedisClient(addr, password string, db int) *redis.Client {
    return redis.NewClient(&redis.Options{
        Addr:         addr,
        Password:     password,
        DB:           db,
        PoolSize:     100,                    // 连接池大小
        MinIdleConns: 10,                     // 最小空闲连接数
        MaxIdleConns: 50,                     // 最大空闲连接数
        PoolTimeout:  4 * time.Second,        // 连接池超时
        IdleTimeout:  5 * time.Minute,        // 空闲连接超时
        ReadTimeout:  3 * time.Second,        // 读取超时
        WriteTimeout: 3 * time.Second,        // 写入超时
        DialTimeout:  5 * time.Second,        // 连接超时
    })
}

// 缓存管理器
type CacheManager struct {
    client *redis.Client
}

func NewCacheManager(client *redis.Client) *CacheManager {
    return &CacheManager{client: client}
}

// 多级缓存策略
func (c *CacheManager) GetWithFallback(ctx context.Context, key string, fallback func() (interface{}, error), ttl time.Duration) (interface{}, error) {
    // 1. 尝试从缓存获取
    cached, err := c.client.Get(ctx, key).Result()
    if err == nil {
        var result interface{}
        if err := json.Unmarshal([]byte(cached), &result); err == nil {
            return result, nil
        }
    }
    
    // 2. 缓存未命中，调用fallback函数
    data, err := fallback()
    if err != nil {
        return nil, err
    }
    
    // 3. 异步写入缓存
    go func() {
        jsonData, err := json.Marshal(data)
        if err == nil {
            c.client.Set(context.Background(), key, jsonData, ttl)
        }
    }()
    
    return data, nil
}

// 批量缓存操作
func (c *CacheManager) MGet(ctx context.Context, keys []string) (map[string]interface{}, error) {
    if len(keys) == 0 {
        return make(map[string]interface{}), nil
    }
    
    values, err := c.client.MGet(ctx, keys...).Result()
    if err != nil {
        return nil, err
    }
    
    result := make(map[string]interface{})
    for i, value := range values {
        if value != nil {
            var data interface{}
            if err := json.Unmarshal([]byte(value.(string)), &data); err == nil {
                result[keys[i]] = data
            }
        }
    }
    
    return result, nil
}

// 缓存预热
func (c *CacheManager) Warmup(ctx context.Context) error {
    // 预热热点数据
    hotKeys := []string{
        "popular_learning_goals",
        "trending_knowledge_points",
        "system_statistics",
    }
    
    for _, key := range hotKeys {
        // 检查缓存是否存在
        exists, err := c.client.Exists(ctx, key).Result()
        if err != nil || exists == 0 {
            // 根据key类型加载数据
            switch key {
            case "popular_learning_goals":
                // 加载热门学习目标
            case "trending_knowledge_points":
                // 加载热门知识点
            case "system_statistics":
                // 加载系统统计数据
            }
        }
    }
    
    return nil
}
```

### 3.2 应用层缓存

#### 本地缓存实现
```go
package cache

import (
    "sync"
    "time"
)

// LRU缓存实现
type LRUCache struct {
    capacity int
    cache    map[string]*Node
    head     *Node
    tail     *Node
    mutex    sync.RWMutex
}

type Node struct {
    key      string
    value    interface{}
    expireAt time.Time
    prev     *Node
    next     *Node
}

func NewLRUCache(capacity int) *LRUCache {
    cache := &LRUCache{
        capacity: capacity,
        cache:    make(map[string]*Node),
    }
    
    // 创建哨兵节点
    cache.head = &Node{}
    cache.tail = &Node{}
    cache.head.next = cache.tail
    cache.tail.prev = cache.head
    
    // 启动清理协程
    go cache.cleanup()
    
    return cache
}

func (c *LRUCache) Get(key string) (interface{}, bool) {
    c.mutex.RLock()
    defer c.mutex.RUnlock()
    
    if node, exists := c.cache[key]; exists {
        // 检查是否过期
        if time.Now().After(node.expireAt) {
            c.removeNode(node)
            delete(c.cache, key)
            return nil, false
        }
        
        // 移动到头部
        c.moveToHead(node)
        return node.value, true
    }
    
    return nil, false
}

func (c *LRUCache) Set(key string, value interface{}, ttl time.Duration) {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    
    expireAt := time.Now().Add(ttl)
    
    if node, exists := c.cache[key]; exists {
        // 更新现有节点
        node.value = value
        node.expireAt = expireAt
        c.moveToHead(node)
    } else {
        // 创建新节点
        newNode := &Node{
            key:      key,
            value:    value,
            expireAt: expireAt,
        }
        
        c.cache[key] = newNode
        c.addToHead(newNode)
        
        // 检查容量
        if len(c.cache) > c.capacity {
            tail := c.removeTail()
            delete(c.cache, tail.key)
        }
    }
}

// 定期清理过期数据
func (c *LRUCache) cleanup() {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()
    
    for range ticker.C {
        c.mutex.Lock()
        now := time.Now()
        
        for key, node := range c.cache {
            if now.After(node.expireAt) {
                c.removeNode(node)
                delete(c.cache, key)
            }
        }
        
        c.mutex.Unlock()
    }
}
```

### 3.3 缓存策略优化

#### 智能缓存键设计
```go
package cache

import (
    "crypto/md5"
    "fmt"
    "sort"
    "strings"
)

// 缓存键生成器
type KeyGenerator struct {
    prefix string
}

func NewKeyGenerator(prefix string) *KeyGenerator {
    return &KeyGenerator{prefix: prefix}
}

// 用户相关缓存键
func (kg *KeyGenerator) UserProfileKey(userID uint64) string {
    return fmt.Sprintf("%s:user:profile:%d", kg.prefix, userID)
}

func (kg *KeyGenerator) UserGoalsKey(userID uint64, status string) string {
    return fmt.Sprintf("%s:user:goals:%d:%s", kg.prefix, userID, status)
}

// 学习路径缓存键
func (kg *KeyGenerator) LearningPathKey(goalID uint64) string {
    return fmt.Sprintf("%s:learning:path:%d", kg.prefix, goalID)
}

// 复杂查询缓存键（基于参数哈希）
func (kg *KeyGenerator) QueryKey(operation string, params map[string]interface{}) string {
    // 对参数进行排序以确保一致性
    var keys []string
    for k := range params {
        keys = append(keys, k)
    }
    sort.Strings(keys)
    
    var parts []string
    for _, k := range keys {
        parts = append(parts, fmt.Sprintf("%s=%v", k, params[k]))
    }
    
    paramStr := strings.Join(parts, "&")
    hash := fmt.Sprintf("%x", md5.Sum([]byte(paramStr)))
    
    return fmt.Sprintf("%s:query:%s:%s", kg.prefix, operation, hash)
}

// 分页缓存键
func (kg *KeyGenerator) PaginationKey(resource string, page, limit int, filters map[string]interface{}) string {
    filterHash := ""
    if len(filters) > 0 {
        filterHash = kg.hashFilters(filters)
    }
    
    return fmt.Sprintf("%s:page:%s:%d:%d:%s", kg.prefix, resource, page, limit, filterHash)
}

func (kg *KeyGenerator) hashFilters(filters map[string]interface{}) string {
    var keys []string
    for k := range filters {
        keys = append(keys, k)
    }
    sort.Strings(keys)
    
    var parts []string
    for _, k := range keys {
        parts = append(parts, fmt.Sprintf("%s=%v", k, filters[k]))
    }
    
    return fmt.Sprintf("%x", md5.Sum([]byte(strings.Join(parts, "&"))))
}
```

## 📊 性能监控与分析

### 4.1 应用性能监控

#### Prometheus指标收集
```go
package metrics

import (
    "time"
    
    "github.com/gin-gonic/gin"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

// 应用性能指标
var (
    // HTTP请求指标
    httpRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )
    
    httpRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
            Buckets: []float64{0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0},
        },
        []string{"method", "endpoint"},
    )
    
    // 业务指标
    activeUsers = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_users_total",
            Help: "Number of active users",
        },
    )
    
    learningGoalsCreated = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "learning_goals_created_total",
            Help: "Total number of learning goals created",
        },
        []string{"category"},
    )
    
    // 系统资源指标
    memoryUsage = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "memory_usage_bytes",
            Help: "Memory usage in bytes",
        },
    )
    
    goroutineCount = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "goroutines_total",
            Help: "Number of goroutines",
        },
    )
)

// HTTP指标中间件
func MetricsMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        start := time.Now()
        
        c.Next()
        
        duration := time.Since(start)
        status := fmt.Sprintf("%d", c.Writer.Status())
        
        httpRequestsTotal.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
            status,
        ).Inc()
        
        httpRequestDuration.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
        ).Observe(duration.Seconds())
    })
}

// 系统指标收集器
func StartMetricsCollector() {
    go func() {
        ticker := time.NewTicker(30 * time.Second)
        defer ticker.Stop()
        
        for range ticker.C {
            // 收集内存使用情况
            var m runtime.MemStats
            runtime.ReadMemStats(&m)
            memoryUsage.Set(float64(m.Alloc))
            
            // 收集协程数量
            goroutineCount.Set(float64(runtime.NumGoroutine()))
            
            // 收集活跃用户数（需要从数据库或缓存获取）
            // activeUsers.Set(float64(getActiveUserCount()))
        }
    }()
}
```

### 4.2 性能分析工具

#### pprof性能分析
```go
package profiling

import (
    "net/http"
    _ "net/http/pprof"
    "runtime"
    "time"
)

// 启用性能分析
func EnableProfiling(addr string) {
    // 设置采样率
    runtime.SetMutexProfileFraction(1)
    runtime.SetBlockProfileRate(1)
    
    // 启动pprof服务器
    go func() {
        http.ListenAndServe(addr, nil)
    }()
}

// 自动性能分析
func StartAutoProfiling() {
    go func() {
        ticker := time.NewTicker(10 * time.Minute)
        defer ticker.Stop()
        
        for range ticker.C {
            // 自动生成CPU profile
            generateCPUProfile()
            
            // 自动生成内存profile
            generateMemProfile()
        }
    }()
}

func generateCPUProfile() {
    // 实现CPU profile生成逻辑
}

func generateMemProfile() {
    // 实现内存profile生成逻辑
}
```

### 4.3 性能告警配置

#### Prometheus告警规则
```yaml
# alerts.yml
groups:
- name: sical-backend-performance
  rules:
  # API响应时间告警
  - alert: HighAPIResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.2
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "API响应时间过高"
      description: "95%的API请求响应时间超过200ms，当前值: {{ $value }}s"
  
  # 错误率告警
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "API错误率过高"
      description: "API错误率超过1%，当前值: {{ $value | humanizePercentage }}"
  
  # 内存使用告警
  - alert: HighMemoryUsage
    expr: memory_usage_bytes > 500 * 1024 * 1024  # 500MB
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "内存使用过高"
      description: "应用内存使用超过500MB，当前值: {{ $value | humanizeBytes }}"
  
  # 协程数量告警
  - alert: HighGoroutineCount
    expr: goroutines_total > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "协程数量过多"
      description: "协程数量超过1000，当前值: {{ $value }}"
  
  # 数据库连接告警
  - alert: DatabaseConnectionIssue
    expr: rate(db_queries_total{status="error"}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "数据库连接异常"
      description: "数据库查询错误率过高，当前值: {{ $value }}"
```

## 🔧 性能调优最佳实践

### 5.1 代码层面优化

#### 避免常见性能陷阱
```go
// ❌ 错误示例：字符串拼接
func badStringConcat(items []string) string {
    result := ""
    for _, item := range items {
        result += item + ","
    }
    return result
}

// ✅ 正确示例：使用strings.Builder
func goodStringConcat(items []string) string {
    var builder strings.Builder
    builder.Grow(len(items) * 10) // 预分配容量
    
    for i, item := range items {
        if i > 0 {
            builder.WriteString(",")
        }
        builder.WriteString(item)
    }
    return builder.String()
}

// ❌ 错误示例：频繁的内存分配
func badSliceAppend() []int {
    var result []int
    for i := 0; i < 10000; i++ {
        result = append(result, i)
    }
    return result
}

// ✅ 正确示例：预分配切片容量
func goodSliceAppend() []int {
    result := make([]int, 0, 10000) // 预分配容量
    for i := 0; i < 10000; i++ {
        result = append(result, i)
    }
    return result
}

// ❌ 错误示例：不必要的JSON序列化
func badJSONHandling(data interface{}) string {
    jsonData, _ := json.Marshal(data)
    return string(jsonData)
}

// ✅ 正确示例：使用对象池
func goodJSONHandling(data interface{}) string {
    buf := pool.GetBuffer()
    defer pool.PutBuffer(buf)
    
    encoder := json.NewEncoder(buf)
    encoder.Encode(data)
    return buf.String()
}
```

### 5.2 并发优化

#### 协程池实现
```go
package worker

import (
    "context"
    "sync"
)

type WorkerPool struct {
    workerCount int
    jobQueue    chan Job
    workers     []*Worker
    wg          sync.WaitGroup
    ctx         context.Context
    cancel      context.CancelFunc
}

type Job func() error

type Worker struct {
    id       int
    jobQueue chan Job
    quit     chan bool
}

func NewWorkerPool(workerCount, queueSize int) *WorkerPool {
    ctx, cancel := context.WithCancel(context.Background())
    
    pool := &WorkerPool{
        workerCount: workerCount,
        jobQueue:    make(chan Job, queueSize),
        workers:     make([]*Worker, workerCount),
        ctx:         ctx,
        cancel:      cancel,
    }
    
    // 创建工作协程
    for i := 0; i < workerCount; i++ {
        worker := &Worker{
            id:       i,
            jobQueue: pool.jobQueue,
            quit:     make(chan bool),
        }
        pool.workers[i] = worker
    }
    
    return pool
}

func (p *WorkerPool) Start() {
    for _, worker := range p.workers {
        p.wg.Add(1)
        go func(w *Worker) {
            defer p.wg.Done()
            w.start(p.ctx)
        }(worker)
    }
}

func (p *WorkerPool) Submit(job Job) {
    select {
    case p.jobQueue <- job:
    case <-p.ctx.Done():
        // 池已关闭
    }
}

func (p *WorkerPool) Stop() {
    p.cancel()
    close(p.jobQueue)
    p.wg.Wait()
}

func (w *Worker) start(ctx context.Context) {
    for {
        select {
        case job := <-w.jobQueue:
            if job != nil {
                job()
            }
        case <-ctx.Done():
            return
        }
    }
}
```

### 5.3 部署优化

#### 容器资源配置
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sical-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: sical-backend
        image: sical-backend:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: GOMAXPROCS
          valueFrom:
            resourceFieldRef:
              resource: limits.cpu
        - name: GOMEMLIMIT
          valueFrom:
            resourceFieldRef:
              resource: limits.memory
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

**文档维护**: 本文档随性能优化需求持续更新  
**最后更新**: 2024-01-15  
**负责人**: 性能工程师