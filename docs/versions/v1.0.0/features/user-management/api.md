# 用户管理API接口文档

## 版本信息
- **版本号**: 1.0.0
- **最后更新**: 2024-01-15
- **作者**: SiCal开发团队
- **评审人**: API架构师
- **状态**: 草稿

## 更新日志
- v1.0.0 (2024-01-15): 初始版本，定义用户管理API接口

---

## 1. 接口概览

### 1.1 基础信息
- **Base URL**: `https://api.sical.edu/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: JWT Bearer Token

### 1.2 通用响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": {}, // 响应数据
  "message": "操作成功",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {} // 错误详情
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### 1.3 分页响应格式
```javascript
{
  "success": true,
  "data": {
    "items": [], // 数据列表
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 2. 认证授权接口

### 2.1 用户注册

**接口地址**: `POST /auth/register`

**请求参数**:
```javascript
{
  "email": "user@example.com",        // 必填，邮箱地址
  "username": "username",             // 必填，用户名
  "password": "password123",          // 必填，密码
  "confirmPassword": "password123",   // 必填，确认密码
  "realName": "张三",                 // 必填，真实姓名
  "userType": "student",              // 必填，用户类型：student/teacher
  "phone": "13800138000",             // 选填，手机号
  "institution": "某某大学",           // 选填，所属机构
  "major": "临床医学",                 // 选填，专业方向
  "studyStage": "undergraduate"       // 选填，学习阶段
}
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username",
    "status": "pending_verification"
  },
  "message": "注册成功，请查收验证邮件"
}
```

**错误码**:
- `EMAIL_ALREADY_EXISTS`: 邮箱已存在
- `USERNAME_ALREADY_EXISTS`: 用户名已存在
- `INVALID_EMAIL_FORMAT`: 邮箱格式错误
- `WEAK_PASSWORD`: 密码强度不足
- `PASSWORD_MISMATCH`: 密码不匹配

### 2.2 邮箱验证

**接口地址**: `GET /auth/verify-email`

**请求参数**:
```javascript
// Query参数
{
  "token": "verification_token_here"  // 必填，验证令牌
}
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "verified": true
  },
  "message": "邮箱验证成功"
}
```

### 2.3 重发验证邮件

**接口地址**: `POST /auth/resend-verification`

**请求参数**:
```javascript
{
  "email": "user@example.com"  // 必填，邮箱地址
}
```

### 2.4 用户登录

**接口地址**: `POST /auth/login`

**请求参数**:
```javascript
{
  "email": "user@example.com",     // 必填，邮箱或用户名
  "password": "password123",       // 必填，密码
  "rememberMe": true,              // 选填，记住登录状态
  "captcha": "ABCD",              // 条件必填，验证码（失败3次后需要）
  "captchaId": "captcha_id_123"   // 条件必填，验证码ID
}
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "username",
      "realName": "张三",
      "role": "student",
      "avatar": "https://cdn.sical.edu/avatars/user.jpg",
      "lastLoginAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJSUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
      "expiresIn": 900  // 15分钟
    }
  },
  "message": "登录成功"
}
```

**错误码**:
- `INVALID_CREDENTIALS`: 用户名或密码错误
- `ACCOUNT_NOT_VERIFIED`: 账户未验证
- `ACCOUNT_LOCKED`: 账户被锁定
- `ACCOUNT_DISABLED`: 账户被禁用
- `TOO_MANY_ATTEMPTS`: 登录尝试次数过多
- `CAPTCHA_REQUIRED`: 需要验证码
- `INVALID_CAPTCHA`: 验证码错误

### 2.5 刷新令牌

**接口地址**: `POST /auth/refresh`

**请求参数**:
```javascript
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."  // 必填，刷新令牌
}
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### 2.6 用户登出

**接口地址**: `POST /auth/logout`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "allDevices": false  // 选填，是否登出所有设备
}
```

### 2.7 忘记密码

**接口地址**: `POST /auth/forgot-password`

**请求参数**:
```javascript
{
  "email": "user@example.com"  // 必填，邮箱地址
}
```

### 2.8 重置密码

**接口地址**: `POST /auth/reset-password`

**请求参数**:
```javascript
{
  "token": "reset_token_here",     // 必填，重置令牌
  "newPassword": "newpassword123", // 必填，新密码
  "confirmPassword": "newpassword123" // 必填，确认新密码
}
```

### 2.9 获取验证码

**接口地址**: `GET /auth/captcha`

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "captchaId": "captcha_id_123",
    "captchaImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

## 3. 用户信息接口

### 3.1 获取当前用户信息

**接口地址**: `GET /users/profile`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username",
    "profile": {
      "realName": "张三",
      "nickname": "小张",
      "avatar": "https://cdn.sical.edu/avatars/user.jpg",
      "gender": "male",
      "birthday": "1995-06-15",
      "phone": "13800138000",
      "institution": "某某大学",
      "major": "临床医学",
      "studyStage": "undergraduate",
      "bio": "热爱学习的医学生"
    },
    "role": "student",
    "status": "active",
    "emailVerified": true,
    "phoneVerified": false,
    "lastLoginAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "stats": {
      "loginCount": 25,
      "studyDays": 30,
      "completedCourses": 5
    }
  }
}
```

### 3.2 更新用户信息

**接口地址**: `PUT /users/profile`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "nickname": "新昵称",
  "gender": "female",
  "birthday": "1995-06-15",
  "institution": "新的大学",
  "major": "药学",
  "studyStage": "graduate",
  "bio": "更新的个人简介"
}
```

### 3.3 上传头像

**接口地址**: `POST /users/avatar`

**请求头**:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**请求参数**:
```
avatar: <file>  // 图片文件，支持JPG/PNG，最大2MB
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.sical.edu/avatars/507f1f77bcf86cd799439011.jpg"
  }
}
```

### 3.4 修改密码

**接口地址**: `PUT /users/password`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "currentPassword": "oldpassword",   // 必填，当前密码
  "newPassword": "newpassword123",   // 必填，新密码
  "confirmPassword": "newpassword123" // 必填，确认新密码
}
```

### 3.5 绑定手机号

**接口地址**: `POST /users/bind-phone`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "phone": "13800138000",    // 必填，手机号
  "verificationCode": "123456" // 必填，验证码
}
```

### 3.6 发送手机验证码

**接口地址**: `POST /users/send-phone-code`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "phone": "13800138000"  // 必填，手机号
}
```

### 3.7 获取用户会话列表

**接口地址**: `GET /users/sessions`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_id_123",
        "deviceInfo": {
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "ip": "192.168.1.100",
          "location": "北京市",
          "deviceType": "desktop"
        },
        "isActive": true,
        "isCurrent": true,
        "lastActiveAt": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ]
  }
}
```

### 3.8 终止会话

**接口地址**: `DELETE /users/sessions/:sessionId`

**请求头**:
```
Authorization: Bearer <access_token>
```

## 4. 管理员接口

### 4.1 获取用户列表

**接口地址**: `GET /admin/users`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
// Query参数
{
  "page": 1,                    // 选填，页码，默认1
  "limit": 20,                  // 选填，每页数量，默认20
  "role": "student",            // 选填，用户角色筛选
  "status": "active",           // 选填，用户状态筛选
  "search": "张三",              // 选填，搜索关键词
  "sortBy": "createdAt",        // 选填，排序字段
  "sortOrder": "desc"           // 选填，排序方向
}
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "username": "username",
        "realName": "张三",
        "role": "student",
        "status": "active",
        "emailVerified": true,
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 4.2 获取用户详情

**接口地址**: `GET /admin/users/:userId`

**请求头**:
```
Authorization: Bearer <access_token>
```

### 4.3 更新用户状态

**接口地址**: `PUT /admin/users/:userId/status`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "status": "active",     // 必填，状态：active/locked/disabled
  "reason": "违规操作"    // 选填，操作原因
}
```

### 4.4 分配用户角色

**接口地址**: `PUT /admin/users/:userId/role`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "role": "teacher",     // 必填，角色：student/teacher/admin
  "reason": "角色升级"   // 选填，操作原因
}
```

### 4.5 重置用户密码

**接口地址**: `POST /admin/users/:userId/reset-password`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "newPassword": "newpassword123",  // 必填，新密码
  "notifyUser": true                // 选填，是否通知用户
}
```

### 4.6 获取用户统计信息

**接口地址**: `GET /admin/users/stats`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "totalUsers": 10000,
    "activeUsers": 8500,
    "newUsersToday": 50,
    "newUsersThisWeek": 300,
    "usersByRole": {
      "student": 8000,
      "teacher": 1500,
      "admin": 500
    },
    "usersByStatus": {
      "active": 8500,
      "pending": 1000,
      "locked": 300,
      "disabled": 200
    }
  }
}
```

## 5. 权限管理接口

### 5.1 获取角色列表

**接口地址**: `GET /admin/roles`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "role_id_123",
        "name": "student",
        "displayName": "学生",
        "description": "普通学生用户",
        "permissions": [
          "read:courses",
          "read:assessments",
          "write:progress"
        ],
        "isSystem": true,
        "userCount": 8000
      }
    ]
  }
}
```

### 5.2 获取权限列表

**接口地址**: `GET /admin/permissions`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": "perm_id_123",
        "name": "read:courses",
        "resource": "courses",
        "action": "read",
        "description": "查看课程内容",
        "category": "content"
      }
    ]
  }
}
```

### 5.3 检查用户权限

**接口地址**: `POST /users/check-permission`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
{
  "permission": "write:courses",  // 必填，权限名称
  "resource": "course_id_123"     // 选填，资源ID
}
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "hasPermission": true,
    "reason": "用户具有teacher角色"
  }
}
```

## 6. 审计日志接口

### 6.1 获取用户操作日志

**接口地址**: `GET /admin/audit-logs`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:
```javascript
// Query参数
{
  "userId": "507f1f77bcf86cd799439011", // 选填，用户ID
  "action": "login",                   // 选填，操作类型
  "startDate": "2024-01-01",           // 选填，开始日期
  "endDate": "2024-01-15",             // 选填，结束日期
  "page": 1,
  "limit": 20
}
```

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "log_id_123",
        "userId": "507f1f77bcf86cd799439011",
        "username": "username",
        "action": "login",
        "resource": "auth",
        "details": {
          "ip": "192.168.1.100",
          "userAgent": "Mozilla/5.0...",
          "success": true
        },
        "result": "success",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000
    }
  }
}
```

## 7. 错误码说明

### 7.1 通用错误码
- `INVALID_REQUEST`: 请求参数错误
- `UNAUTHORIZED`: 未授权访问
- `FORBIDDEN`: 权限不足
- `NOT_FOUND`: 资源不存在
- `INTERNAL_ERROR`: 服务器内部错误
- `RATE_LIMIT_EXCEEDED`: 请求频率超限

### 7.2 认证相关错误码
- `INVALID_CREDENTIALS`: 用户名或密码错误
- `ACCOUNT_NOT_VERIFIED`: 账户未验证
- `ACCOUNT_LOCKED`: 账户被锁定
- `ACCOUNT_DISABLED`: 账户被禁用
- `TOKEN_EXPIRED`: 令牌已过期
- `TOKEN_INVALID`: 令牌无效
- `EMAIL_ALREADY_EXISTS`: 邮箱已存在
- `USERNAME_ALREADY_EXISTS`: 用户名已存在

### 7.3 验证相关错误码
- `INVALID_EMAIL_FORMAT`: 邮箱格式错误
- `INVALID_PHONE_FORMAT`: 手机号格式错误
- `WEAK_PASSWORD`: 密码强度不足
- `PASSWORD_MISMATCH`: 密码不匹配
- `VERIFICATION_CODE_INVALID`: 验证码无效
- `VERIFICATION_CODE_EXPIRED`: 验证码已过期

## 8. 限流策略

### 8.1 接口限流
- **注册接口**: 每IP每小时最多5次
- **登录接口**: 每IP每分钟最多10次
- **密码重置**: 每邮箱每小时最多3次
- **发送验证码**: 每手机号每分钟最多1次
- **其他接口**: 每用户每分钟最多100次

### 8.2 限流响应
```javascript
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求频率超限，请稍后再试",
    "details": {
      "retryAfter": 60  // 秒
    }
  }
}
```

## 9. 安全说明

### 9.1 HTTPS要求
所有API接口必须通过HTTPS访问，HTTP请求将被重定向到HTTPS。

### 9.2 请求签名
对于敏感操作，可能需要额外的请求签名验证。

### 9.3 IP白名单
管理员接口支持IP白名单限制。

### 9.4 审计日志
所有API调用都会记录审计日志，包括请求参数、响应结果、用户信息等。

## 10. SDK和工具

### 10.1 官方SDK
- JavaScript SDK
- Python SDK
- Java SDK

### 10.2 API测试工具
- Postman Collection
- Swagger UI
- API文档站点

### 10.3 开发工具
- API Mock服务
- 接口测试平台
- 性能监控工具