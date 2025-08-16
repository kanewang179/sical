# 用户管理数据库设计

## 版本信息
- **版本号**: 1.0.0
- **最后更新**: 2024-01-15
- **作者**: SiCal开发团队
- **评审人**: 数据库架构师
- **状态**: 草稿

## 更新日志
- v1.0.0 (2024-01-15): 初始版本，定义用户管理数据库设计

---

## 1. 数据库架构概览

### 1.1 技术选型
- **主数据库**: MongoDB 6.0+
- **缓存数据库**: Redis 7.0+
- **搜索引擎**: Elasticsearch 8.0+
- **文件存储**: GridFS (MongoDB)

### 1.2 数据分布
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   Redis Cache   │    │  Elasticsearch  │
│   主要数据      │    │   会话/缓存     │    │   搜索索引      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • users         │    │ • sessions      │    │ • user_search   │
│ • roles         │    │ • login_attempts│    │ • audit_search  │
│ • permissions   │    │ • rate_limits   │    │                 │
│ • audit_logs    │    │ • user_cache    │    │                 │
│ • user_sessions │    │ • email_tokens  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. MongoDB 集合设计

### 2.1 用户集合 (users)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  
  // 基本认证信息
  email: "user@example.com",           // 邮箱（唯一索引）
  username: "username",                // 用户名（唯一索引）
  passwordHash: "$2b$12$...",          // bcrypt加密密码
  passwordHistory: [                   // 密码历史（最近5个）
    {
      hash: "$2b$12$...",
      createdAt: ISODate("2024-01-01T00:00:00Z")
    }
  ],
  
  // 个人资料
  profile: {
    realName: "张三",                   // 真实姓名
    nickname: "小张",                   // 昵称
    avatar: "avatars/507f1f77bcf86cd799439011.jpg", // 头像路径
    gender: "male",                     // 性别：male/female/other
    birthday: ISODate("1995-06-15T00:00:00Z"), // 生日
    phone: "13800138000",               // 手机号
    institution: "某某大学",             // 所属机构
    major: "临床医学",                   // 专业方向
    studyStage: "undergraduate",        // 学习阶段
    bio: "热爱学习的医学生",             // 个人简介
    location: {                         // 地理位置
      country: "中国",
      province: "北京市",
      city: "北京市"
    }
  },
  
  // 账户状态
  role: "student",                     // 用户角色
  status: "active",                    // 账户状态：pending/active/locked/disabled/deleted
  emailVerified: true,                 // 邮箱验证状态
  phoneVerified: false,                // 手机验证状态
  
  // 安全设置
  security: {
    twoFactorEnabled: false,           // 双因子认证
    loginNotification: true,           // 登录通知
    passwordChangeRequired: false,     // 强制修改密码
    lastPasswordChange: ISODate("2024-01-01T00:00:00Z")
  },
  
  // 隐私设置
  privacy: {
    profileVisibility: "public",       // 资料可见性：public/friends/private
    showEmail: false,                  // 是否显示邮箱
    showPhone: false,                  // 是否显示手机
    allowMessages: true,               // 是否允许私信
    showOnlineStatus: true             // 是否显示在线状态
  },
  
  // 偏好设置
  preferences: {
    language: "zh-CN",                 // 语言偏好
    timezone: "Asia/Shanghai",         // 时区
    theme: "light",                    // 主题：light/dark/auto
    emailNotifications: {              // 邮件通知设置
      login: true,
      courseUpdates: true,
      assessmentReminders: true,
      systemAnnouncements: true
    },
    studyReminders: {                  // 学习提醒
      enabled: true,
      frequency: "daily",              // daily/weekly
      time: "09:00"
    }
  },
  
  // 统计信息
  stats: {
    loginCount: 25,                    // 登录次数
    lastLoginAt: ISODate("2024-01-15T10:30:00Z"), // 最后登录时间
    lastActiveAt: ISODate("2024-01-15T11:00:00Z"), // 最后活跃时间
    registrationSource: "web",         // 注册来源
    studyDays: 30,                     // 学习天数
    totalStudyTime: 7200,              // 总学习时间（秒）
    completedCourses: 5,               // 完成课程数
    averageScore: 85.5                 // 平均分数
  },
  
  // 第三方账户绑定
  socialAccounts: [
    {
      provider: "wechat",              // 第三方平台
      providerId: "wx_openid_123",     // 第三方ID
      email: "user@wechat.com",        // 第三方邮箱
      nickname: "微信昵称",             // 第三方昵称
      avatar: "https://wx.qlogo.cn/...", // 第三方头像
      boundAt: ISODate("2024-01-01T00:00:00Z")
    }
  ],
  
  // 时间戳
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
  deletedAt: null                      // 软删除时间戳
}
```

**索引设计**:
```javascript
// 唯一索引
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })

// 查询索引
db.users.createIndex({ "status": 1 })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "emailVerified": 1 })
db.users.createIndex({ "createdAt": -1 })
db.users.createIndex({ "stats.lastActiveAt": -1 })
db.users.createIndex({ "profile.institution": 1 })

// 复合索引
db.users.createIndex({ "role": 1, "status": 1 })
db.users.createIndex({ "status": 1, "createdAt": -1 })

// 文本搜索索引
db.users.createIndex({
  "profile.realName": "text",
  "profile.nickname": "text",
  "username": "text",
  "email": "text"
})
```

### 2.2 角色集合 (roles)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  name: "student",                     // 角色名称（唯一）
  displayName: "学生",                 // 显示名称
  description: "普通学生用户，可以学习课程和参与评估",
  
  // 权限列表
  permissions: [
    "read:courses",
    "read:assessments",
    "write:progress",
    "read:profile",
    "write:profile"
  ],
  
  // 角色属性
  isSystem: true,                      // 是否系统角色
  isDefault: false,                    // 是否默认角色
  priority: 1,                         // 优先级（数字越大优先级越高）
  
  // 角色限制
  limitations: {
    maxCourses: 100,                   // 最大课程数
    maxAssessments: 50,                // 最大评估数
    storageQuota: 1073741824,          // 存储配额（字节）
    apiRateLimit: 1000                 // API调用限制（每小时）
  },
  
  // 统计信息
  userCount: 8000,                     // 用户数量
  
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

**索引设计**:
```javascript
db.roles.createIndex({ "name": 1 }, { unique: true })
db.roles.createIndex({ "isSystem": 1 })
db.roles.createIndex({ "priority": -1 })
```

### 2.3 权限集合 (permissions)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  name: "read:courses",                // 权限名称（唯一）
  resource: "courses",                 // 资源名称
  action: "read",                      // 操作类型：create/read/update/delete
  description: "查看课程内容",          // 权限描述
  category: "content",                 // 权限分类：content/user/admin/system
  
  // 权限属性
  isSystem: true,                      // 是否系统权限
  requiresOwnership: false,            // 是否需要资源所有权
  
  // 权限条件
  conditions: {
    timeRestriction: null,             // 时间限制
    ipRestriction: null,               // IP限制
    deviceRestriction: null            // 设备限制
  },
  
  createdAt: ISODate("2024-01-01T00:00:00Z")
}
```

**索引设计**:
```javascript
db.permissions.createIndex({ "name": 1 }, { unique: true })
db.permissions.createIndex({ "resource": 1, "action": 1 })
db.permissions.createIndex({ "category": 1 })
```

### 2.4 用户会话集合 (user_sessions)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  userId: ObjectId("507f1f77bcf86cd799439011"), // 用户ID
  
  // 令牌信息
  accessToken: "eyJhbGciOiJSUzI1NiIs...",    // 访问令牌（哈希存储）
  refreshToken: "eyJhbGciOiJSUzI1NiIs...",   // 刷新令牌（哈希存储）
  tokenFamily: "family_uuid_123",           // 令牌族ID（用于刷新令牌轮换）
  
  // 设备信息
  deviceInfo: {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ip: "192.168.1.100",
    location: {
      country: "中国",
      region: "北京市",
      city: "北京市",
      isp: "中国电信"
    },
    deviceType: "desktop",               // desktop/mobile/tablet
    os: "Windows 10",
    browser: "Chrome 120.0",
    fingerprint: "device_fingerprint_hash" // 设备指纹
  },
  
  // 会话状态
  isActive: true,                         // 是否活跃
  isRemembered: true,                     // 是否记住登录
  
  // 安全信息
  loginMethod: "password",                // 登录方式：password/sso/social
  riskScore: 0.1,                        // 风险评分（0-1）
  isVerified: true,                      // 是否已验证
  
  // 时间信息
  expiresAt: ISODate("2024-01-22T10:30:00Z"), // 过期时间
  lastActiveAt: ISODate("2024-01-15T11:00:00Z"), // 最后活跃时间
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

**索引设计**:
```javascript
db.user_sessions.createIndex({ "userId": 1 })
db.user_sessions.createIndex({ "accessToken": 1 })
db.user_sessions.createIndex({ "refreshToken": 1 })
db.user_sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
db.user_sessions.createIndex({ "isActive": 1, "lastActiveAt": -1 })
db.user_sessions.createIndex({ "deviceInfo.ip": 1 })
```

### 2.5 审计日志集合 (audit_logs)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439015"),
  
  // 用户信息
  userId: ObjectId("507f1f77bcf86cd799439011"), // 用户ID（可为null）
  username: "username",                       // 用户名
  userRole: "student",                        // 用户角色
  
  // 操作信息
  action: "login",                            // 操作类型
  resource: "auth",                           // 操作资源
  resourceId: null,                           // 资源ID
  
  // 操作详情
  details: {
    method: "POST",
    endpoint: "/api/auth/login",
    requestId: "req_123456789",
    sessionId: "session_123",
    userAgent: "Mozilla/5.0...",
    ip: "192.168.1.100",
    location: "北京市",
    requestBody: {                            // 脱敏后的请求体
      email: "u***@example.com"
    },
    responseStatus: 200,
    responseTime: 150,                        // 响应时间（毫秒）
    errorCode: null,
    errorMessage: null
  },
  
  // 操作结果
  result: "success",                          // success/failure/error
  severity: "info",                          // info/warning/error/critical
  
  // 安全相关
  riskLevel: "low",                          // low/medium/high/critical
  flags: [],                                 // 安全标记：suspicious_ip/multiple_failures/etc
  
  // 时间戳
  timestamp: ISODate("2024-01-15T10:30:00Z")
}
```

**索引设计**:
```javascript
db.audit_logs.createIndex({ "userId": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "action": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "resource": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "result": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "severity": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "details.ip": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "timestamp": -1 })

// TTL索引（日志保留90天）
db.audit_logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 7776000 })
```

### 2.6 邮箱验证令牌集合 (email_tokens)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439016"),
  userId: ObjectId("507f1f77bcf86cd799439011"), // 用户ID
  email: "user@example.com",                   // 邮箱地址
  token: "verification_token_hash",            // 令牌哈希
  type: "email_verification",                  // 令牌类型：email_verification/password_reset
  
  // 令牌状态
  isUsed: false,                               // 是否已使用
  attempts: 0,                                 // 使用尝试次数
  
  // 时间信息
  expiresAt: ISODate("2024-01-16T10:30:00Z"), // 过期时间
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  usedAt: null                                 // 使用时间
}
```

**索引设计**:
```javascript
db.email_tokens.createIndex({ "token": 1 }, { unique: true })
db.email_tokens.createIndex({ "userId": 1, "type": 1 })
db.email_tokens.createIndex({ "email": 1, "type": 1 })
db.email_tokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

## 3. Redis 缓存设计

### 3.1 会话缓存
```redis
# 用户会话信息
KEY: session:{token_hash}
VALUE: {
  "userId": "507f1f77bcf86cd799439011",
  "username": "username",
  "role": "student",
  "permissions": ["read:courses", "write:progress"],
  "deviceInfo": {...},
  "lastActiveAt": "2024-01-15T11:00:00Z"
}
TTL: 900 (15分钟)

# 刷新令牌
KEY: refresh_token:{token_hash}
VALUE: {
  "userId": "507f1f77bcf86cd799439011",
  "sessionId": "507f1f77bcf86cd799439014",
  "tokenFamily": "family_uuid_123"
}
TTL: 604800 (7天)
```

### 3.2 用户信息缓存
```redis
# 用户基本信息
KEY: user:profile:{userId}
VALUE: {
  "id": "507f1f77bcf86cd799439011",
  "username": "username",
  "email": "user@example.com",
  "profile": {...},
  "role": "student",
  "status": "active"
}
TTL: 1800 (30分钟)

# 用户权限缓存
KEY: user:permissions:{userId}
VALUE: ["read:courses", "write:progress", "read:profile"]
TTL: 3600 (1小时)
```

### 3.3 安全相关缓存
```redis
# 登录失败次数
KEY: login_attempts:{ip}
VALUE: 3
TTL: 1800 (30分钟)

# 登录失败次数（用户）
KEY: login_attempts:user:{userId}
VALUE: 2
TTL: 1800 (30分钟)

# 验证码
KEY: captcha:{captchaId}
VALUE: "ABCD"
TTL: 300 (5分钟)

# 邮件发送限制
KEY: email_limit:{email}:{type}
VALUE: 1
TTL: 3600 (1小时)

# API限流
KEY: rate_limit:{userId}:{endpoint}
VALUE: 10
TTL: 60 (1分钟)
```

### 3.4 在线用户缓存
```redis
# 在线用户集合
KEY: online_users
TYPE: SET
VALUE: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]

# 用户在线状态
KEY: user:online:{userId}
VALUE: {
  "status": "online",
  "lastSeen": "2024-01-15T11:00:00Z",
  "deviceCount": 2
}
TTL: 300 (5分钟)
```

## 4. Elasticsearch 搜索索引

### 4.1 用户搜索索引
```json
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "username": {
        "type": "text",
        "analyzer": "ik_max_word",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "email": { "type": "keyword" },
      "realName": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "nickname": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "institution": {
        "type": "text",
        "analyzer": "ik_max_word",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "major": { "type": "keyword" },
      "role": { "type": "keyword" },
      "status": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "lastActiveAt": { "type": "date" }
    }
  }
}
```

### 4.2 审计日志搜索索引
```json
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "username": { "type": "keyword" },
      "action": { "type": "keyword" },
      "resource": { "type": "keyword" },
      "result": { "type": "keyword" },
      "severity": { "type": "keyword" },
      "ip": { "type": "ip" },
      "userAgent": {
        "type": "text",
        "analyzer": "standard"
      },
      "details": {
        "type": "object",
        "enabled": false
      },
      "timestamp": { "type": "date" }
    }
  },
  "settings": {
    "index": {
      "lifecycle": {
        "name": "audit_logs_policy",
        "rollover_alias": "audit_logs"
      }
    }
  }
}
```

## 5. 数据一致性保证

### 5.1 事务处理
```javascript
// 用户注册事务示例
async function registerUser(userData) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // 1. 创建用户
      const user = await User.create([userData], { session });
      
      // 2. 创建邮箱验证令牌
      const token = await EmailToken.create([{
        userId: user[0]._id,
        email: userData.email,
        token: generateToken(),
        type: 'email_verification'
      }], { session });
      
      // 3. 记录审计日志
      await AuditLog.create([{
        userId: user[0]._id,
        action: 'register',
        resource: 'user',
        result: 'success'
      }], { session });
    });
  } finally {
    await session.endSession();
  }
}
```

### 5.2 缓存一致性
```javascript
// 用户信息更新时的缓存同步
async function updateUserProfile(userId, updateData) {
  // 1. 更新数据库
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
  // 2. 更新缓存
  await redis.setex(`user:profile:${userId}`, 1800, JSON.stringify(user));
  
  // 3. 清除相关缓存
  await redis.del(`user:permissions:${userId}`);
  
  // 4. 更新搜索索引
  await elasticsearch.index({
    index: 'users',
    id: userId,
    body: {
      userId: user._id,
      username: user.username,
      realName: user.profile.realName,
      // ... 其他字段
    }
  });
}
```

## 6. 性能优化策略

### 6.1 查询优化
```javascript
// 分页查询优化
function getUserList(page, limit, filters) {
  const skip = (page - 1) * limit;
  
  return User.find(filters)
    .select('username email profile.realName role status createdAt') // 只选择必要字段
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // 返回普通对象而非Mongoose文档
}

// 聚合查询优化
function getUserStats() {
  return User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        activeCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        }
      }
    }
  ]);
}
```

### 6.2 索引优化
```javascript
// 复合索引使用示例
// 查询活跃学生用户，按创建时间排序
db.users.find({
  role: 'student',
  status: 'active'
}).sort({ createdAt: -1 })

// 对应的复合索引
db.users.createIndex({ role: 1, status: 1, createdAt: -1 })
```

### 6.3 缓存策略
```javascript
// 多级缓存策略
class UserService {
  async getUserProfile(userId) {
    // 1. 尝试从本地缓存获取
    let user = this.localCache.get(`user:${userId}`);
    if (user) return user;
    
    // 2. 尝试从Redis获取
    user = await redis.get(`user:profile:${userId}`);
    if (user) {
      user = JSON.parse(user);
      this.localCache.set(`user:${userId}`, user, 300); // 本地缓存5分钟
      return user;
    }
    
    // 3. 从数据库获取
    user = await User.findById(userId).lean();
    if (user) {
      // 更新缓存
      await redis.setex(`user:profile:${userId}`, 1800, JSON.stringify(user));
      this.localCache.set(`user:${userId}`, user, 300);
    }
    
    return user;
  }
}
```

## 7. 数据备份与恢复

### 7.1 备份策略
```bash
# MongoDB备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"

# 全量备份
mongodump --host localhost:27017 --db sical_users --out $BACKUP_DIR/full_$DATE

# 压缩备份文件
tar -czf $BACKUP_DIR/full_$DATE.tar.gz $BACKUP_DIR/full_$DATE
rm -rf $BACKUP_DIR/full_$DATE

# 清理7天前的备份
find $BACKUP_DIR -name "full_*.tar.gz" -mtime +7 -delete
```

### 7.2 恢复策略
```bash
# MongoDB恢复脚本
#!/bin/bash
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# 解压备份文件
tar -xzf $BACKUP_FILE

# 恢复数据
mongorestore --host localhost:27017 --db sical_users --drop ./sical_users

# 重建索引
mongo sical_users --eval "db.users.reIndex(); db.audit_logs.reIndex();"
```

## 8. 监控与维护

### 8.1 性能监控
```javascript
// 数据库性能监控
function monitorDatabasePerformance() {
  setInterval(async () => {
    // 监控慢查询
    const slowQueries = await db.runCommand({
      currentOp: true,
      "secs_running": { $gte: 5 }
    });
    
    // 监控连接数
    const serverStatus = await db.runCommand({ serverStatus: 1 });
    const connections = serverStatus.connections;
    
    // 监控索引使用情况
    const indexStats = await db.users.aggregate([
      { $indexStats: {} }
    ]).toArray();
    
    // 发送监控数据到监控系统
    sendMetrics({
      slowQueries: slowQueries.inprog.length,
      connections: connections.current,
      indexUsage: indexStats
    });
  }, 60000); // 每分钟检查一次
}
```

### 8.2 数据清理
```javascript
// 定期数据清理任务
class DataCleanupService {
  async cleanupExpiredTokens() {
    // 清理过期的邮箱验证令牌
    await EmailToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
  
  async cleanupInactiveSessions() {
    // 清理非活跃会话
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await UserSession.deleteMany({
      lastActiveAt: { $lt: thirtyDaysAgo },
      isActive: false
    });
  }
  
  async archiveOldAuditLogs() {
    // 归档90天前的审计日志
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const oldLogs = await AuditLog.find({
      timestamp: { $lt: ninetyDaysAgo }
    });
    
    // 导出到归档存储
    await exportToArchive(oldLogs);
    
    // 删除原始数据
    await AuditLog.deleteMany({
      timestamp: { $lt: ninetyDaysAgo }
    });
  }
}
```

## 9. 安全考虑

### 9.1 数据加密
```javascript
// 敏感数据加密
const crypto = require('crypto');

class EncryptionService {
  constructor(secretKey) {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = crypto.scryptSync(secretKey, 'salt', 32);
  }
  
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.secretKey,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 9.2 数据脱敏
```javascript
// 日志数据脱敏
function sanitizeLogData(data) {
  const sensitiveFields = ['password', 'token', 'email', 'phone'];
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      if (field === 'email') {
        sanitized[field] = sanitized[field].replace(/(.{2}).*(@.*)/, '$1***$2');
      } else if (field === 'phone') {
        sanitized[field] = sanitized[field].replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      } else {
        sanitized[field] = '***';
      }
    }
  }
  
  return sanitized;
}
```

## 10. 扩展性设计

### 10.1 分片策略
```javascript
// MongoDB分片配置
// 基于用户ID的哈希分片
sh.shardCollection("sical_users.users", { "_id": "hashed" })

// 基于时间的范围分片（审计日志）
sh.shardCollection("sical_users.audit_logs", { "timestamp": 1 })

// 分片标签
sh.addShardTag("shard0000", "recent")
sh.addShardTag("shard0001", "archive")

// 分片范围
sh.addTagRange(
  "sical_users.audit_logs",
  { "timestamp": ISODate("2024-01-01") },
  { "timestamp": ISODate("2024-12-31") },
  "recent"
)
```

### 10.2 读写分离
```javascript
// MongoDB读写分离配置
const mongoose = require('mongoose');

// 主库连接（写操作）
const primaryDB = mongoose.createConnection('mongodb://primary:27017/sical_users', {
  readPreference: 'primary'
});

// 从库连接（读操作）
const secondaryDB = mongoose.createConnection('mongodb://secondary:27017/sical_users', {
  readPreference: 'secondary'
});

// 使用示例
class UserRepository {
  async createUser(userData) {
    // 写操作使用主库
    return primaryDB.model('User').create(userData);
  }
  
  async findUser(query) {
    // 读操作使用从库
    return secondaryDB.model('User').findOne(query);
  }
}
```