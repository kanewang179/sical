# 智能学习规划应用 - 安全设计文档 v0.1.1

## 📋 文档信息

| 项目 | 智能学习规划应用 安全设计 |
|------|----------------------------|
| **版本** | v0.1.1 |
| **后端技术** | Go + Gin + GORM |
| **更新日期** | 2024-01-15 |
| **状态** | 开发中 |

## 🛡️ 安全架构概览

### 安全设计原则
- **纵深防御**: 多层安全防护机制
- **最小权限**: 用户和系统最小权限原则
- **数据保护**: 敏感数据加密和脱敏
- **安全开发**: 安全编码规范和审计
- **持续监控**: 实时安全监控和响应

### 安全架构图
```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web App   │  │ Mobile App  │  │   API客户端  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTPS/TLS 1.3
                              │
┌─────────────────────────────────────────────────────────────┐
│                        网关层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  WAF防护    │  │  DDoS防护   │  │   API网关    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      应用服务层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  认证服务   │  │  授权服务   │  │  业务服务    │        │
│  │   JWT       │  │   RBAC      │  │   API       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       数据层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 数据库加密  │  │  访问控制   │  │  审计日志    │        │
│  │ PostgreSQL  │  │    RLS      │  │   Audit     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 身份认证与授权

### 1.1 JWT认证机制

#### 认证流程设计
```go
type AuthService struct {
    userRepo     UserRepository
    jwtSecret    string
    tokenExpiry  time.Duration
    refreshExpiry time.Duration
}

type JWTClaims struct {
    UserID   uint64 `json:"user_id"`
    Username string `json:"username"`
    Role     string `json:"role"`
    jwt.RegisteredClaims
}

// JWT Token结构
type TokenPair struct {
    AccessToken  string    `json:"access_token"`
    RefreshToken string    `json:"refresh_token"`
    ExpiresAt    time.Time `json:"expires_at"`
    TokenType    string    `json:"token_type"`
}
```

#### 安全特性
- **短期访问令牌**: Access Token有效期15分钟
- **长期刷新令牌**: Refresh Token有效期7天
- **令牌轮换**: 每次刷新生成新的Token对
- **设备绑定**: Token与设备指纹绑定
- **异地登录检测**: IP地址变化检测和通知

#### 实现代码
```go
func (s *AuthService) GenerateTokenPair(user *User) (*TokenPair, error) {
    // 生成Access Token
    accessClaims := &JWTClaims{
        UserID:   user.ID,
        Username: user.Username,
        Role:     user.Role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.tokenExpiry)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            NotBefore: jwt.NewNumericDate(time.Now()),
            Issuer:    "sical-api",
            Subject:   fmt.Sprintf("%d", user.ID),
        },
    }
    
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
    accessTokenString, err := accessToken.SignedString([]byte(s.jwtSecret))
    if err != nil {
        return nil, err
    }
    
    // 生成Refresh Token
    refreshClaims := &JWTClaims{
        UserID: user.ID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.refreshExpiry)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Issuer:    "sical-api",
            Subject:   fmt.Sprintf("%d", user.ID),
        },
    }
    
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
    refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtSecret))
    if err != nil {
        return nil, err
    }
    
    return &TokenPair{
        AccessToken:  accessTokenString,
        RefreshToken: refreshTokenString,
        ExpiresAt:    time.Now().Add(s.tokenExpiry),
        TokenType:    "Bearer",
    }, nil
}
```

### 1.2 基于角色的访问控制(RBAC)

#### 权限模型设计
```go
type Role struct {
    ID          uint64      `json:"id" gorm:"primaryKey"`
    Name        string      `json:"name" gorm:"size:50;unique;not null"`
    Description string      `json:"description" gorm:"size:200"`
    Permissions []Permission `json:"permissions" gorm:"many2many:role_permissions;"`
    CreatedAt   time.Time   `json:"created_at"`
    UpdatedAt   time.Time   `json:"updated_at"`
}

type Permission struct {
    ID          uint64    `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name" gorm:"size:50;unique;not null"`
    Resource    string    `json:"resource" gorm:"size:50;not null"`
    Action      string    `json:"action" gorm:"size:20;not null"`
    Description string    `json:"description" gorm:"size:200"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

type UserRole struct {
    UserID    uint64    `json:"user_id" gorm:"primaryKey"`
    RoleID    uint64    `json:"role_id" gorm:"primaryKey"`
    GrantedBy uint64    `json:"granted_by"`
    GrantedAt time.Time `json:"granted_at"`
    ExpiresAt *time.Time `json:"expires_at"`
}
```

#### 预定义角色
```go
var DefaultRoles = []Role{
    {
        Name:        "student",
        Description: "普通学生用户",
        Permissions: []Permission{
            {Resource: "learning_goal", Action: "create"},
            {Resource: "learning_goal", Action: "read"},
            {Resource: "learning_goal", Action: "update"},
            {Resource: "learning_path", Action: "read"},
            {Resource: "assessment", Action: "take"},
            {Resource: "note", Action: "create"},
            {Resource: "note", Action: "read"},
            {Resource: "note", Action: "update"},
            {Resource: "comment", Action: "create"},
            {Resource: "comment", Action: "read"},
        },
    },
    {
        Name:        "teacher",
        Description: "教师用户",
        Permissions: []Permission{
            {Resource: "assessment", Action: "create"},
            {Resource: "assessment", Action: "update"},
            {Resource: "question", Action: "create"},
            {Resource: "knowledge_point", Action: "create"},
            {Resource: "knowledge_point", Action: "update"},
            {Resource: "user_progress", Action: "read"},
        },
    },
    {
        Name:        "admin",
        Description: "系统管理员",
        Permissions: []Permission{
            {Resource: "*", Action: "*"},
        },
    },
}
```

#### 权限检查中间件
```go
func RequirePermission(resource, action string) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "未认证"})
            c.Abort()
            return
        }
        
        hasPermission, err := authService.CheckPermission(userID.(uint64), resource, action)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "权限检查失败"})
            c.Abort()
            return
        }
        
        if !hasPermission {
            c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

### 1.3 多因素认证(MFA)

#### TOTP实现
```go
type MFAService struct {
    issuer string
}

func (s *MFAService) GenerateSecret(userID uint64, username string) (*MFASecret, error) {
    secret := make([]byte, 20)
    _, err := rand.Read(secret)
    if err != nil {
        return nil, err
    }
    
    secretBase32 := base32.StdEncoding.EncodeToString(secret)
    
    // 生成QR码URL
    qrURL := fmt.Sprintf(
        "otpauth://totp/%s:%s?secret=%s&issuer=%s",
        s.issuer,
        username,
        secretBase32,
        s.issuer,
    )
    
    return &MFASecret{
        UserID:    userID,
        Secret:    secretBase32,
        QRCodeURL: qrURL,
        CreatedAt: time.Now(),
    }, nil
}

func (s *MFAService) VerifyTOTP(secret, token string) bool {
    secretBytes, err := base32.StdEncoding.DecodeString(secret)
    if err != nil {
        return false
    }
    
    now := time.Now().Unix() / 30
    
    // 检查当前时间窗口和前后各一个窗口
    for i := -1; i <= 1; i++ {
        timeStep := now + int64(i)
        expectedToken := s.generateTOTP(secretBytes, timeStep)
        if token == expectedToken {
            return true
        }
    }
    
    return false
}
```

## 🔒 数据安全保护

### 2.1 敏感数据加密

#### 字段级加密
```go
type EncryptionService struct {
    key []byte
}

func NewEncryptionService(key string) *EncryptionService {
    hash := sha256.Sum256([]byte(key))
    return &EncryptionService{key: hash[:]}
}

func (s *EncryptionService) Encrypt(plaintext string) (string, error) {
    block, err := aes.NewCipher(s.key)
    if err != nil {
        return "", err
    }
    
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    nonce := make([]byte, gcm.NonceSize())
    if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
        return "", err
    }
    
    ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func (s *EncryptionService) Decrypt(ciphertext string) (string, error) {
    data, err := base64.StdEncoding.DecodeString(ciphertext)
    if err != nil {
        return "", err
    }
    
    block, err := aes.NewCipher(s.key)
    if err != nil {
        return "", err
    }
    
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    nonceSize := gcm.NonceSize()
    if len(data) < nonceSize {
        return "", errors.New("ciphertext too short")
    }
    
    nonce, ciphertext := data[:nonceSize], data[nonceSize:]
    plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
    if err != nil {
        return "", err
    }
    
    return string(plaintext), nil
}
```

#### 数据库加密配置
```sql
-- 启用透明数据加密(TDE)
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';

-- 敏感字段加密存储
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 加密函数
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, current_setting('app.encryption_key'), 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 解密函数
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), current_setting('app.encryption_key'), 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.2 数据脱敏

#### 敏感数据脱敏策略
```go
type DataMaskingService struct{}

func (s *DataMaskingService) MaskEmail(email string) string {
    parts := strings.Split(email, "@")
    if len(parts) != 2 {
        return "***@***.***"
    }
    
    username := parts[0]
    domain := parts[1]
    
    if len(username) <= 2 {
        return "***@" + s.maskDomain(domain)
    }
    
    masked := username[:1] + strings.Repeat("*", len(username)-2) + username[len(username)-1:]
    return masked + "@" + s.maskDomain(domain)
}

func (s *DataMaskingService) MaskPhone(phone string) string {
    if len(phone) < 7 {
        return "***-****"
    }
    
    return phone[:3] + "-" + strings.Repeat("*", len(phone)-6) + phone[len(phone)-3:]
}

func (s *DataMaskingService) MaskIDCard(idCard string) string {
    if len(idCard) < 8 {
        return strings.Repeat("*", len(idCard))
    }
    
    return idCard[:4] + strings.Repeat("*", len(idCard)-8) + idCard[len(idCard)-4:]
}
```

### 2.3 数据访问控制

#### 行级安全策略(RLS)
```sql
-- 启用行级安全
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY user_data_policy ON user_notes
FOR ALL TO authenticated_users
USING (user_id = current_setting('app.current_user_id')::bigint);

CREATE POLICY learning_goals_policy ON learning_goals
FOR ALL TO authenticated_users
USING (user_id = current_setting('app.current_user_id')::bigint);

-- 教师可以查看学生进度
CREATE POLICY teacher_view_progress ON user_progress
FOR SELECT TO teacher_role
USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = current_setting('app.current_user_id')::bigint 
    AND r.name = 'teacher'
));
```

## 🛡️ API安全防护

### 3.1 输入验证与过滤

#### 请求验证中间件
```go
type ValidationService struct {
    validator *validator.Validate
}

func NewValidationService() *ValidationService {
    v := validator.New()
    
    // 自定义验证规则
    v.RegisterValidation("strong_password", validateStrongPassword)
    v.RegisterValidation("safe_content", validateSafeContent)
    
    return &ValidationService{validator: v}
}

func validateStrongPassword(fl validator.FieldLevel) bool {
    password := fl.Field().String()
    
    // 至少8位，包含大小写字母、数字和特殊字符
    if len(password) < 8 {
        return false
    }
    
    hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
    hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
    hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
    hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)
    
    return hasUpper && hasLower && hasNumber && hasSpecial
}

func validateSafeContent(fl validator.FieldLevel) bool {
    content := fl.Field().String()
    
    // 检查XSS攻击
    policy := bluemonday.UGCPolicy()
    sanitized := policy.Sanitize(content)
    
    return sanitized == content
}
```

#### SQL注入防护
```go
func (r *UserRepository) GetUserByEmail(email string) (*User, error) {
    var user User
    
    // 使用参数化查询防止SQL注入
    err := r.db.Where("email = ? AND deleted_at IS NULL", email).First(&user).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, ErrUserNotFound
        }
        return nil, err
    }
    
    return &user, nil
}

// 动态查询构建器
func (r *UserRepository) SearchUsers(criteria SearchCriteria) ([]User, error) {
    query := r.db.Model(&User{})
    
    // 安全的动态查询构建
    if criteria.Username != "" {
        query = query.Where("username ILIKE ?", "%"+criteria.Username+"%")
    }
    
    if criteria.Email != "" {
        query = query.Where("email ILIKE ?", "%"+criteria.Email+"%")
    }
    
    if criteria.Status != "" {
        query = query.Where("status = ?", criteria.Status)
    }
    
    var users []User
    err := query.Find(&users).Error
    return users, err
}
```

### 3.2 API限流与防护

#### 令牌桶限流
```go
type RateLimiter struct {
    redis  *redis.Client
    limits map[string]RateLimit
}

type RateLimit struct {
    Requests int           // 请求数量
    Window   time.Duration // 时间窗口
}

func NewRateLimiter(redis *redis.Client) *RateLimiter {
    return &RateLimiter{
        redis: redis,
        limits: map[string]RateLimit{
            "login":    {Requests: 5, Window: time.Minute},
            "register": {Requests: 3, Window: time.Minute},
            "api":      {Requests: 100, Window: time.Minute},
            "upload":   {Requests: 10, Window: time.Minute},
        },
    }
}

func (rl *RateLimiter) Allow(key, limitType string) (bool, error) {
    limit, exists := rl.limits[limitType]
    if !exists {
        return true, nil
    }
    
    redisKey := fmt.Sprintf("rate_limit:%s:%s", limitType, key)
    
    // 使用Redis的滑动窗口计数器
    pipe := rl.redis.Pipeline()
    now := time.Now().Unix()
    windowStart := now - int64(limit.Window.Seconds())
    
    // 清理过期记录
    pipe.ZRemRangeByScore(context.Background(), redisKey, "0", fmt.Sprintf("%d", windowStart))
    
    // 添加当前请求
    pipe.ZAdd(context.Background(), redisKey, &redis.Z{
        Score:  float64(now),
        Member: fmt.Sprintf("%d-%d", now, rand.Int63()),
    })
    
    // 计算当前窗口内的请求数
    pipe.ZCard(context.Background(), redisKey)
    
    // 设置过期时间
    pipe.Expire(context.Background(), redisKey, limit.Window)
    
    results, err := pipe.Exec(context.Background())
    if err != nil {
        return false, err
    }
    
    count := results[2].(*redis.IntCmd).Val()
    return count <= int64(limit.Requests), nil
}

// 限流中间件
func RateLimitMiddleware(limiter *RateLimiter, limitType string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 使用IP地址作为限流键
        key := c.ClientIP()
        
        // 如果用户已认证，使用用户ID
        if userID, exists := c.Get("user_id"); exists {
            key = fmt.Sprintf("user:%d", userID)
        }
        
        allowed, err := limiter.Allow(key, limitType)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "限流检查失败"})
            c.Abort()
            return
        }
        
        if !allowed {
            c.Header("Retry-After", "60")
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "请求过于频繁，请稍后再试",
                "retry_after": 60,
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

### 3.3 CORS与CSP配置

#### CORS配置
```go
func CORSMiddleware() gin.HandlerFunc {
    return cors.New(cors.Config{
        AllowOrigins: []string{
            "https://sical.example.com",
            "https://app.sical.example.com",
        },
        AllowMethods: []string{
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
        },
        AllowHeaders: []string{
            "Origin", "Content-Type", "Accept", "Authorization",
            "X-Requested-With", "X-CSRF-Token",
        },
        ExposeHeaders: []string{
            "Content-Length", "X-Total-Count",
        },
        AllowCredentials: true,
        MaxAge:          12 * time.Hour,
    })
}
```

#### 安全头设置
```go
func SecurityHeadersMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Content Security Policy
        c.Header("Content-Security-Policy", 
            "default-src 'self'; "+
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "+
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "+
            "font-src 'self' https://fonts.gstatic.com; "+
            "img-src 'self' data: https:; "+
            "connect-src 'self' https://api.sical.example.com")
        
        // 其他安全头
        c.Header("X-Content-Type-Options", "nosniff")
        c.Header("X-Frame-Options", "DENY")
        c.Header("X-XSS-Protection", "1; mode=block")
        c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
        c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        
        c.Next()
    }
}
```

## 🔍 安全监控与审计

### 4.1 安全事件监控

#### 安全事件定义
```go
type SecurityEvent struct {
    ID          uint64                 `json:"id" gorm:"primaryKey"`
    EventType   string                 `json:"event_type" gorm:"size:50;not null"`
    Severity    string                 `json:"severity" gorm:"size:20;not null"`
    UserID      *uint64                `json:"user_id" gorm:"index"`
    IPAddress   string                 `json:"ip_address" gorm:"size:45"`
    UserAgent   string                 `json:"user_agent" gorm:"type:text"`
    RequestID   string                 `json:"request_id" gorm:"size:100"`
    Description string                 `json:"description" gorm:"type:text"`
    Metadata    datatypes.JSON         `json:"metadata"`
    CreatedAt   time.Time              `json:"created_at"`
}

// 安全事件类型
const (
    EventTypeLoginFailure     = "login_failure"
    EventTypeLoginSuccess     = "login_success"
    EventTypePasswordChange   = "password_change"
    EventTypePermissionDenied = "permission_denied"
    EventTypeSuspiciousActivity = "suspicious_activity"
    EventTypeDataAccess       = "data_access"
    EventTypeRateLimitExceeded = "rate_limit_exceeded"
)

// 严重级别
const (
    SeverityLow      = "low"
    SeverityMedium   = "medium"
    SeverityHigh     = "high"
    SeverityCritical = "critical"
)
```

#### 安全监控服务
```go
type SecurityMonitor struct {
    eventRepo SecurityEventRepository
    alerter   AlertService
}

func (sm *SecurityMonitor) LogSecurityEvent(event *SecurityEvent) error {
    // 记录安全事件
    if err := sm.eventRepo.Create(event); err != nil {
        return err
    }
    
    // 检查是否需要告警
    if sm.shouldAlert(event) {
        return sm.alerter.SendAlert(event)
    }
    
    return nil
}

func (sm *SecurityMonitor) shouldAlert(event *SecurityEvent) bool {
    switch event.Severity {
    case SeverityCritical:
        return true
    case SeverityHigh:
        return true
    case SeverityMedium:
        // 检查频率
        return sm.checkEventFrequency(event)
    default:
        return false
    }
}

func (sm *SecurityMonitor) checkEventFrequency(event *SecurityEvent) bool {
    // 检查最近5分钟内同类事件数量
    count, err := sm.eventRepo.CountRecentEvents(
        event.EventType,
        event.IPAddress,
        time.Now().Add(-5*time.Minute),
    )
    if err != nil {
        return false
    }
    
    // 超过阈值则告警
    return count > 5
}
```

### 4.2 审计日志

#### 审计日志结构
```go
type AuditLog struct {
    ID           uint64                 `json:"id" gorm:"primaryKey"`
    UserID       *uint64                `json:"user_id" gorm:"index"`
    Action       string                 `json:"action" gorm:"size:100;not null"`
    ResourceType string                 `json:"resource_type" gorm:"size:50"`
    ResourceID   *uint64                `json:"resource_id"`
    OldValues    datatypes.JSON         `json:"old_values"`
    NewValues    datatypes.JSON         `json:"new_values"`
    IPAddress    string                 `json:"ip_address" gorm:"size:45"`
    UserAgent    string                 `json:"user_agent" gorm:"type:text"`
    RequestID    string                 `json:"request_id" gorm:"size:100"`
    CreatedAt    time.Time              `json:"created_at"`
}

// 审计中间件
func AuditMiddleware(auditService *AuditService) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 记录请求开始时间
        start := time.Now()
        
        // 创建响应写入器包装器
        writer := &responseWriter{ResponseWriter: c.Writer, body: &bytes.Buffer{}}
        c.Writer = writer
        
        // 处理请求
        c.Next()
        
        // 记录审计日志
        go func() {
            auditLog := &AuditLog{
                Action:    fmt.Sprintf("%s %s", c.Request.Method, c.Request.URL.Path),
                IPAddress: c.ClientIP(),
                UserAgent: c.Request.UserAgent(),
                RequestID: c.GetString("request_id"),
                CreatedAt: start,
            }
            
            if userID, exists := c.Get("user_id"); exists {
                uid := userID.(uint64)
                auditLog.UserID = &uid
            }
            
            auditService.Log(auditLog)
        }()
    }
}
```

### 4.3 异常检测

#### 异常行为检测
```go
type AnomalyDetector struct {
    redis *redis.Client
}

func (ad *AnomalyDetector) DetectLoginAnomaly(userID uint64, ipAddress string) (bool, error) {
    // 检查异地登录
    lastIP, err := ad.getLastLoginIP(userID)
    if err != nil {
        return false, err
    }
    
    if lastIP != "" && lastIP != ipAddress {
        // 检查IP地理位置差异
        if ad.isSignificantLocationChange(lastIP, ipAddress) {
            return true, nil
        }
    }
    
    // 检查登录频率异常
    loginCount, err := ad.getRecentLoginCount(userID, time.Hour)
    if err != nil {
        return false, err
    }
    
    if loginCount > 10 {
        return true, nil
    }
    
    // 检查失败登录次数
    failureCount, err := ad.getRecentFailureCount(ipAddress, 10*time.Minute)
    if err != nil {
        return false, err
    }
    
    if failureCount > 5 {
        return true, nil
    }
    
    return false, nil
}

func (ad *AnomalyDetector) DetectDataAccessAnomaly(userID uint64, resourceType string) (bool, error) {
    // 检查访问频率
    key := fmt.Sprintf("access:%d:%s", userID, resourceType)
    count, err := ad.redis.Incr(context.Background(), key).Result()
    if err != nil {
        return false, err
    }
    
    // 设置过期时间
    ad.redis.Expire(context.Background(), key, time.Hour)
    
    // 根据资源类型设置不同阈值
    threshold := ad.getAccessThreshold(resourceType)
    return count > threshold, nil
}
```

## 🔐 密码安全策略

### 5.1 密码策略

#### 密码强度要求
```go
type PasswordPolicy struct {
    MinLength        int
    RequireUppercase bool
    RequireLowercase bool
    RequireNumbers   bool
    RequireSymbols   bool
    MaxAge           time.Duration
    HistoryCount     int
    LockoutThreshold int
    LockoutDuration  time.Duration
}

var DefaultPasswordPolicy = PasswordPolicy{
    MinLength:        8,
    RequireUppercase: true,
    RequireLowercase: true,
    RequireNumbers:   true,
    RequireSymbols:   true,
    MaxAge:           90 * 24 * time.Hour, // 90天
    HistoryCount:     5,                   // 记住最近5个密码
    LockoutThreshold: 5,                   // 5次失败后锁定
    LockoutDuration:  30 * time.Minute,    // 锁定30分钟
}

func (pp *PasswordPolicy) ValidatePassword(password string) []string {
    var errors []string
    
    if len(password) < pp.MinLength {
        errors = append(errors, fmt.Sprintf("密码长度至少%d位", pp.MinLength))
    }
    
    if pp.RequireUppercase && !regexp.MustCompile(`[A-Z]`).MatchString(password) {
        errors = append(errors, "密码必须包含大写字母")
    }
    
    if pp.RequireLowercase && !regexp.MustCompile(`[a-z]`).MatchString(password) {
        errors = append(errors, "密码必须包含小写字母")
    }
    
    if pp.RequireNumbers && !regexp.MustCompile(`[0-9]`).MatchString(password) {
        errors = append(errors, "密码必须包含数字")
    }
    
    if pp.RequireSymbols && !regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password) {
        errors = append(errors, "密码必须包含特殊字符")
    }
    
    return errors
}
```

### 5.2 密码哈希

#### BCrypt实现
```go
type PasswordService struct {
    cost int
}

func NewPasswordService() *PasswordService {
    return &PasswordService{cost: 12}
}

func (ps *PasswordService) HashPassword(password string) (string, error) {
    hash, err := bcrypt.GenerateFromPassword([]byte(password), ps.cost)
    if err != nil {
        return "", err
    }
    return string(hash), nil
}

func (ps *PasswordService) VerifyPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

func (ps *PasswordService) NeedsRehash(hash string) bool {
    cost, err := bcrypt.Cost([]byte(hash))
    if err != nil {
        return true
    }
    return cost < ps.cost
}
```

## 🚨 安全事件响应

### 6.1 事件响应流程

#### 自动响应机制
```go
type SecurityResponse struct {
    alertService    AlertService
    userService     UserService
    sessionService  SessionService
}

func (sr *SecurityResponse) HandleSecurityEvent(event *SecurityEvent) error {
    switch event.EventType {
    case EventTypeLoginFailure:
        return sr.handleLoginFailure(event)
    case EventTypeSuspiciousActivity:
        return sr.handleSuspiciousActivity(event)
    case EventTypePermissionDenied:
        return sr.handlePermissionDenied(event)
    default:
        return sr.handleGenericEvent(event)
    }
}

func (sr *SecurityResponse) handleLoginFailure(event *SecurityEvent) error {
    // 检查失败次数
    failureCount := sr.getFailureCount(event.IPAddress)
    
    if failureCount >= 5 {
        // 临时封禁IP
        if err := sr.blockIP(event.IPAddress, 30*time.Minute); err != nil {
            return err
        }
        
        // 发送告警
        return sr.alertService.SendAlert(&Alert{
            Type:        "IP_BLOCKED",
            Severity:    SeverityHigh,
            Message:     fmt.Sprintf("IP %s 因多次登录失败被临时封禁", event.IPAddress),
            Metadata:    map[string]interface{}{"ip": event.IPAddress, "failures": failureCount},
            CreatedAt:   time.Now(),
        })
    }
    
    return nil
}

func (sr *SecurityResponse) handleSuspiciousActivity(event *SecurityEvent) error {
    if event.UserID != nil {
        // 强制用户重新登录
        if err := sr.sessionService.RevokeAllSessions(*event.UserID); err != nil {
            return err
        }
        
        // 要求用户验证身份
        if err := sr.userService.RequireIdentityVerification(*event.UserID); err != nil {
            return err
        }
    }
    
    // 发送高优先级告警
    return sr.alertService.SendAlert(&Alert{
        Type:      "SUSPICIOUS_ACTIVITY",
        Severity:  SeverityCritical,
        Message:   "检测到可疑活动",
        Metadata:  event.Metadata,
        CreatedAt: time.Now(),
    })
}
```

### 6.2 告警通知

#### 多渠道告警
```go
type AlertService struct {
    emailService    EmailService
    smsService      SMSService
    webhookService  WebhookService
    slackService    SlackService
}

type Alert struct {
    Type      string                 `json:"type"`
    Severity  string                 `json:"severity"`
    Message   string                 `json:"message"`
    Metadata  map[string]interface{} `json:"metadata"`
    CreatedAt time.Time              `json:"created_at"`
}

func (as *AlertService) SendAlert(alert *Alert) error {
    // 根据严重级别选择通知渠道
    switch alert.Severity {
    case SeverityCritical:
        // 关键告警：所有渠道
        go as.emailService.SendAlert(alert)
        go as.smsService.SendAlert(alert)
        go as.slackService.SendAlert(alert)
        return as.webhookService.SendAlert(alert)
        
    case SeverityHigh:
        // 高级告警：邮件和Slack
        go as.emailService.SendAlert(alert)
        return as.slackService.SendAlert(alert)
        
    case SeverityMedium:
        // 中级告警：仅Slack
        return as.slackService.SendAlert(alert)
        
    default:
        // 低级告警：记录日志
        log.Printf("Security Alert: %s - %s", alert.Type, alert.Message)
        return nil
    }
}
```

---

**文档维护**: 本文档随安全需求变化持续更新  
**最后更新**: 2024-01-15  
**负责人**: 安全架构师