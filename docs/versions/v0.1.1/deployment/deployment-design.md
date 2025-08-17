# 智能学习规划应用 - 部署设计文档 v0.1.1

## 📋 文档信息

| 项目 | 智能学习规划应用 部署设计 |
|------|----------------------------|
| **版本** | v0.1.1 |
| **后端技术** | Go + Gin + GORM |
| **更新日期** | 2024-01-15 |
| **状态** | 开发中 |

## 🏗️ 部署架构概览

### 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web用户   │  │  移动用户   │  │   API用户    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                         Internet
                              │
┌─────────────────────────────────────────────────────────────┐
│                        CDN层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  CloudFlare │  │   静态资源   │  │   图片CDN    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      负载均衡层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Nginx    │  │  SSL终止    │  │   WAF防护    │        │
│  │ Load Balancer│  │   Proxy     │  │  Firewall   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      应用服务层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Go Backend │  │  Go Backend │  │  Go Backend │        │
│  │   Instance1 │  │   Instance2 │  │   Instance3 │        │
│  │  (Container)│  │  (Container)│  │  (Container)│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       缓存层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Redis Cluster│  │ Redis Cache │  │ Redis Session│       │
│  │   (主从)     │  │   (缓存)    │  │   (会话)     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       数据层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │ PostgreSQL  │  │   文件存储   │        │
│  │   Master    │  │   Replica   │  │   MinIO/S3   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      监控层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Prometheus  │  │   Grafana   │  │   ELK Stack │        │
│  │   监控      │  │   可视化    │  │   日志      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🐳 容器化设计

### 2.1 Docker配置

#### Dockerfile
```dockerfile
# 多阶段构建
FROM golang:1.21-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装必要的包
RUN apk add --no-cache git ca-certificates tzdata

# 复制go mod文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# 运行阶段
FROM alpine:latest

# 安装ca证书和时区数据
RUN apk --no-cache add ca-certificates tzdata

# 设置时区
ENV TZ=Asia/Shanghai

# 创建非root用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 设置工作目录
WORKDIR /root/

# 从构建阶段复制二进制文件
COPY --from=builder /app/main .
COPY --from=builder /app/configs ./configs
COPY --from=builder /app/migrations ./migrations

# 更改文件所有者
RUN chown -R appuser:appgroup /root

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 启动应用
CMD ["./main"]
```

#### Docker Compose (开发环境)
```yaml
version: '3.8'

services:
  # Go后端服务
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - ENV=development
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=sical_user
      - DB_PASSWORD=sical_password
      - DB_NAME=sical_db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your-jwt-secret-key
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - sical-network
    restart: unless-stopped

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=sical_db
      - POSTGRES_USER=sical_user
      - POSTGRES_PASSWORD=sical_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - sical-network
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./configs/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - sical-network
    restart: unless-stopped

  # Nginx负载均衡
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./configs/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./static:/usr/share/nginx/html
    depends_on:
      - backend
    networks:
      - sical-network
    restart: unless-stopped

  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./configs/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - sical-network
    restart: unless-stopped

  # Grafana可视化
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./configs/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./configs/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - sical-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  sical-network:
    driver: bridge
```

### 2.2 Kubernetes配置

#### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sical
  labels:
    name: sical
    environment: production
```

#### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: sical-config
  namespace: sical
data:
  app.env: |
    ENV=production
    LOG_LEVEL=info
    SERVER_PORT=8080
    DB_HOST=postgres-service
    DB_PORT=5432
    REDIS_HOST=redis-service
    REDIS_PORT=6379
    CACHE_TTL=3600
    JWT_EXPIRY=900
    REFRESH_TOKEN_EXPIRY=604800
```

#### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sical-secrets
  namespace: sical
type: Opaque
data:
  db-user: c2ljYWxfdXNlcg==  # base64 encoded
  db-password: c2ljYWxfcGFzc3dvcmQ=
  jwt-secret: eW91ci1qd3Qtc2VjcmV0LWtleQ==
  redis-password: cmVkaXNfcGFzc3dvcmQ=
```

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sical-backend
  namespace: sical
  labels:
    app: sical-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sical-backend
  template:
    metadata:
      labels:
        app: sical-backend
    spec:
      containers:
      - name: backend
        image: sical/backend:v0.1.1
        ports:
        - containerPort: 8080
        env:
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: sical-secrets
              key: db-user
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: sical-secrets
              key: db-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: sical-secrets
              key: jwt-secret
        envFrom:
        - configMapRef:
            name: sical-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
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
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: uploads
          mountPath: /app/uploads
      volumes:
      - name: logs
        persistentVolumeClaim:
          claimName: sical-logs-pvc
      - name: uploads
        persistentVolumeClaim:
          claimName: sical-uploads-pvc
      imagePullSecrets:
      - name: registry-secret
---
apiVersion: v1
kind: Service
metadata:
  name: sical-backend-service
  namespace: sical
spec:
  selector:
    app: sical-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

#### HorizontalPodAutoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sical-backend-hpa
  namespace: sical
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sical-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🚀 CI/CD流程

### 3.1 GitHub Actions配置

#### 主工作流
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: sical/backend

jobs:
  # 代码质量检查
  lint-and-test:
    runs-on: ubuntu-latest
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
        restore-keys: |
          ${{ runner.os }}-go-
    
    - name: Install dependencies
      run: go mod download
    
    - name: Run golangci-lint
      uses: golangci/golangci-lint-action@v3
      with:
        version: latest
        args: --timeout=5m
    
    - name: Run tests
      run: |
        go test -v -race -coverprofile=coverage.out ./...
        go tool cover -html=coverage.out -o coverage.html
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.out
        flags: unittests
        name: codecov-umbrella
    
    - name: Security scan
      uses: securecodewarrior/github-action-add-sarif@v1
      with:
        sarif-file: 'gosec-report.sarif'

  # 构建和推送镜像
  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # 部署到开发环境
  deploy-dev:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Development
      run: |
        echo "Deploying to development environment"
        # 这里添加部署脚本

  # 部署到生产环境
  deploy-prod:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Production
      run: |
        echo "Deploying to production environment"
        # 这里添加生产部署脚本
```

### 3.2 部署脚本

#### 部署脚本 (deploy.sh)
```bash
#!/bin/bash

set -e

# 配置变量
ENVIRONMENT=${1:-development}
IMAGE_TAG=${2:-latest}
NAMESPACE="sical-${ENVIRONMENT}"

echo "Deploying to ${ENVIRONMENT} environment with image tag ${IMAGE_TAG}"

# 检查kubectl连接
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster"
    exit 1
fi

# 创建命名空间（如果不存在）
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# 更新镜像标签
kubectl set image deployment/sical-backend backend=ghcr.io/sical/backend:${IMAGE_TAG} -n ${NAMESPACE}

# 等待部署完成
kubectl rollout status deployment/sical-backend -n ${NAMESPACE} --timeout=300s

# 验证部署
echo "Verifying deployment..."
kubectl get pods -n ${NAMESPACE} -l app=sical-backend

# 运行健康检查
echo "Running health check..."
SERVICE_URL=$(kubectl get service sical-backend-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -n "$SERVICE_URL" ]; then
    curl -f http://${SERVICE_URL}/health || {
        echo "Health check failed"
        exit 1
    }
    echo "Deployment successful!"
else
    echo "Warning: Could not get service URL for health check"
fi
```

#### 数据库迁移脚本
```bash
#!/bin/bash

set -e

ENVIRONMENT=${1:-development}
NAMESPACE="sical-${ENVIRONMENT}"

echo "Running database migrations for ${ENVIRONMENT}"

# 创建迁移Job
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-$(date +%s)
  namespace: ${NAMESPACE}
spec:
  template:
    spec:
      containers:
      - name: migration
        image: ghcr.io/sical/backend:latest
        command: ["./main", "migrate"]
        env:
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: sical-secrets
              key: db-user
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: sical-secrets
              key: db-password
        envFrom:
        - configMapRef:
            name: sical-config
      restartPolicy: Never
  backoffLimit: 3
EOF

echo "Migration job created"
```

## 📊 监控与日志

### 4.1 Prometheus监控配置

#### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Prometheus自身监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Go应用监控
  - job_name: 'sical-backend'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - sical
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: sical-backend
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

  # PostgreSQL监控
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis监控
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Nginx监控
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

#### 告警规则 (alert_rules.yml)
```yaml
groups:
- name: sical-backend
  rules:
  # 高错误率告警
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  # 高响应时间告警
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }} seconds"

  # 内存使用率告警
  - alert: HighMemoryUsage
    expr: (process_resident_memory_bytes / 1024 / 1024) > 400
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is {{ $value }} MB"

  # CPU使用率告警
  - alert: HighCPUUsage
    expr: rate(process_cpu_seconds_total[5m]) * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is {{ $value }}%"

  # 数据库连接告警
  - alert: DatabaseConnectionFailure
    expr: up{job="postgres"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failure"
      description: "Cannot connect to PostgreSQL database"

  # Redis连接告警
  - alert: RedisConnectionFailure
    expr: up{job="redis"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Redis connection failure"
      description: "Cannot connect to Redis cache"
```

### 4.2 应用监控指标

#### Go应用监控代码
```go
package monitoring

import (
    "github.com/gin-gonic/gin"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    "strconv"
    "time"
)

// 定义监控指标
var (
    // HTTP请求总数
    httpRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )

    // HTTP请求持续时间
    httpRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint"},
    )

    // 活跃连接数
    activeConnections = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_connections",
            Help: "Number of active connections",
        },
    )

    // 数据库查询持续时间
    dbQueryDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "db_query_duration_seconds",
            Help:    "Database query duration in seconds",
            Buckets: []float64{0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5},
        },
        []string{"operation", "table"},
    )

    // 缓存命中率
    cacheHits = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "cache_hits_total",
            Help: "Total number of cache hits",
        },
        []string{"cache_type"},
    )

    cacheMisses = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "cache_misses_total",
            Help: "Total number of cache misses",
        },
        []string{"cache_type"},
    )
)

// Prometheus中间件
func PrometheusMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        
        // 增加活跃连接数
        activeConnections.Inc()
        defer activeConnections.Dec()
        
        // 处理请求
        c.Next()
        
        // 记录指标
        duration := time.Since(start).Seconds()
        status := strconv.Itoa(c.Writer.Status())
        
        httpRequestsTotal.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
            status,
        ).Inc()
        
        httpRequestDuration.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
        ).Observe(duration)
    }
}

// 数据库监控装饰器
func MonitorDBQuery(operation, table string, fn func() error) error {
    start := time.Now()
    err := fn()
    duration := time.Since(start).Seconds()
    
    dbQueryDuration.WithLabelValues(operation, table).Observe(duration)
    return err
}

// 缓存监控
func RecordCacheHit(cacheType string) {
    cacheHits.WithLabelValues(cacheType).Inc()
}

func RecordCacheMiss(cacheType string) {
    cacheMisses.WithLabelValues(cacheType).Inc()
}

// 注册Prometheus处理器
func RegisterPrometheusHandler(router *gin.Engine) {
    router.GET("/metrics", gin.WrapH(promhttp.Handler()))
}
```

### 4.3 日志管理

#### 结构化日志配置
```go
package logger

import (
    "os"
    "time"
    
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
    "gopkg.in/natefinch/lumberjack.v2"
)

type Logger struct {
    *zap.Logger
}

func NewLogger(env string) (*Logger, error) {
    var config zap.Config
    
    if env == "production" {
        config = zap.NewProductionConfig()
        config.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
    } else {
        config = zap.NewDevelopmentConfig()
        config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
    }
    
    // 自定义编码器配置
    config.EncoderConfig = zapcore.EncoderConfig{
        TimeKey:        "timestamp",
        LevelKey:       "level",
        NameKey:        "logger",
        CallerKey:      "caller",
        MessageKey:     "message",
        StacktraceKey:  "stacktrace",
        LineEnding:     zapcore.DefaultLineEnding,
        EncodeLevel:    zapcore.LowercaseLevelEncoder,
        EncodeTime:     zapcore.ISO8601TimeEncoder,
        EncodeDuration: zapcore.StringDurationEncoder,
        EncodeCaller:   zapcore.ShortCallerEncoder,
    }
    
    // 配置输出
    var cores []zapcore.Core
    
    // 控制台输出
    consoleEncoder := zapcore.NewConsoleEncoder(config.EncoderConfig)
    consoleCore := zapcore.NewCore(
        consoleEncoder,
        zapcore.AddSync(os.Stdout),
        config.Level,
    )
    cores = append(cores, consoleCore)
    
    // 文件输出（生产环境）
    if env == "production" {
        fileEncoder := zapcore.NewJSONEncoder(config.EncoderConfig)
        
        // 应用日志
        appLogWriter := &lumberjack.Logger{
            Filename:   "/app/logs/app.log",
            MaxSize:    100, // MB
            MaxBackups: 10,
            MaxAge:     30, // days
            Compress:   true,
        }
        
        appCore := zapcore.NewCore(
            fileEncoder,
            zapcore.AddSync(appLogWriter),
            config.Level,
        )
        cores = append(cores, appCore)
        
        // 错误日志
        errorLogWriter := &lumberjack.Logger{
            Filename:   "/app/logs/error.log",
            MaxSize:    100,
            MaxBackups: 10,
            MaxAge:     30,
            Compress:   true,
        }
        
        errorCore := zapcore.NewCore(
            fileEncoder,
            zapcore.AddSync(errorLogWriter),
            zap.ErrorLevel,
        )
        cores = append(cores, errorCore)
    }
    
    // 创建logger
    core := zapcore.NewTee(cores...)
    logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zap.ErrorLevel))
    
    return &Logger{logger}, nil
}

// 请求日志中间件
func (l *Logger) GinLogger() gin.HandlerFunc {
    return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        l.Info("HTTP Request",
            zap.String("method", param.Method),
            zap.String("path", param.Path),
            zap.Int("status", param.StatusCode),
            zap.Duration("latency", param.Latency),
            zap.String("client_ip", param.ClientIP),
            zap.String("user_agent", param.Request.UserAgent()),
            zap.String("error", param.ErrorMessage),
        )
        return ""
    })
}

// 恢复中间件
func (l *Logger) GinRecovery() gin.HandlerFunc {
    return gin.RecoveryWithWriter(os.Stderr, func(c *gin.Context, recovered interface{}) {
        l.Error("Panic recovered",
            zap.Any("error", recovered),
            zap.String("path", c.Request.URL.Path),
            zap.String("method", c.Request.Method),
        )
        c.AbortWithStatus(http.StatusInternalServerError)
    })
}
```

## 🔧 运维管理

### 5.1 健康检查

#### 健康检查端点
```go
package health

import (
    "context"
    "database/sql"
    "net/http"
    "time"
    
    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
)

type HealthChecker struct {
    db    *sql.DB
    redis *redis.Client
}

type HealthStatus struct {
    Status    string            `json:"status"`
    Timestamp time.Time         `json:"timestamp"`
    Services  map[string]string `json:"services"`
    Version   string            `json:"version"`
    Uptime    time.Duration     `json:"uptime"`
}

func NewHealthChecker(db *sql.DB, redis *redis.Client) *HealthChecker {
    return &HealthChecker{
        db:    db,
        redis: redis,
    }
}

func (hc *HealthChecker) HealthCheck(c *gin.Context) {
    status := &HealthStatus{
        Status:    "healthy",
        Timestamp: time.Now(),
        Services:  make(map[string]string),
        Version:   "v0.1.1",
        Uptime:    time.Since(startTime),
    }
    
    // 检查数据库
    if err := hc.checkDatabase(); err != nil {
        status.Services["database"] = "unhealthy: " + err.Error()
        status.Status = "unhealthy"
    } else {
        status.Services["database"] = "healthy"
    }
    
    // 检查Redis
    if err := hc.checkRedis(); err != nil {
        status.Services["redis"] = "unhealthy: " + err.Error()
        status.Status = "unhealthy"
    } else {
        status.Services["redis"] = "healthy"
    }
    
    httpStatus := http.StatusOK
    if status.Status == "unhealthy" {
        httpStatus = http.StatusServiceUnavailable
    }
    
    c.JSON(httpStatus, status)
}

func (hc *HealthChecker) ReadinessCheck(c *gin.Context) {
    // 简单的就绪检查
    c.JSON(http.StatusOK, gin.H{
        "status": "ready",
        "timestamp": time.Now(),
    })
}

func (hc *HealthChecker) checkDatabase() error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    return hc.db.PingContext(ctx)
}

func (hc *HealthChecker) checkRedis() error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    return hc.redis.Ping(ctx).Err()
}
```

### 5.2 备份策略

#### 数据库备份脚本
```bash
#!/bin/bash

set -e

# 配置
BACKUP_DIR="/backups/postgres"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="sical_backup_${DATE}.sql"

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 执行备份
echo "Starting database backup..."
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} > ${BACKUP_DIR}/${BACKUP_FILE}

# 压缩备份文件
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# 清理旧备份
find ${BACKUP_DIR} -name "*.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${BACKUP_FILE}.gz"

# 验证备份
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}.gz" ]; then
    echo "Backup verification successful"
else
    echo "Backup verification failed"
    exit 1
fi
```

#### Kubernetes CronJob备份
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: sical
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:15-alpine
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > /backup/sical_backup_$(date +%Y%m%d_%H%M%S).sql.gz
            env:
            - name: DB_HOST
              value: "postgres-service"
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: sical-secrets
                  key: db-user
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: sical-secrets
                  key: db-password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### 5.3 性能调优

#### 应用性能配置
```go
package config

import (
    "runtime"
    "time"
)

type PerformanceConfig struct {
    // HTTP服务器配置
    ReadTimeout       time.Duration
    WriteTimeout      time.Duration
    IdleTimeout       time.Duration
    ReadHeaderTimeout time.Duration
    MaxHeaderBytes    int
    
    // 数据库连接池配置
    MaxOpenConns    int
    MaxIdleConns    int
    ConnMaxLifetime time.Duration
    ConnMaxIdleTime time.Duration
    
    // Redis配置
    PoolSize     int
    MinIdleConns int
    PoolTimeout  time.Duration
    
    // 应用配置
    WorkerPoolSize int
    QueueSize      int
    CacheSize      int
}

func NewPerformanceConfig() *PerformanceConfig {
    return &PerformanceConfig{
        // HTTP服务器
        ReadTimeout:       30 * time.Second,
        WriteTimeout:      30 * time.Second,
        IdleTimeout:       120 * time.Second,
        ReadHeaderTimeout: 10 * time.Second,
        MaxHeaderBytes:    1 << 20, // 1MB
        
        // 数据库连接池
        MaxOpenConns:    25,
        MaxIdleConns:    5,
        ConnMaxLifetime: time.Hour,
        ConnMaxIdleTime: 10 * time.Minute,
        
        // Redis
        PoolSize:     10,
        MinIdleConns: 2,
        PoolTimeout:  4 * time.Second,
        
        // 应用
        WorkerPoolSize: runtime.NumCPU() * 2,
        QueueSize:      1000,
        CacheSize:      10000,
    }
}
```

---

**文档维护**: 本文档随部署需求变化持续更新  
**最后更新**: 2024-01-15  
**负责人**: DevOps工程师