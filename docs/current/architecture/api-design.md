---
version: "1.0.0"
last_updated: "2024-01-15"
author: "后端开发团队"
reviewers: ["架构师", "前端开发"]
status: "approved"
changelog:
  - version: "1.0.0"
    date: "2024-01-15"
    changes: ["定义RESTful API规范", "设计核心接口", "制定安全策略"]
---

# API接口设计文档

## 1. API设计概述

### 1.1 设计原则
- **RESTful风格** - 遵循REST架构风格
- **统一接口** - 一致的API设计规范
- **无状态** - 每个请求包含完整信息
- **可缓存** - 支持HTTP缓存机制
- **分层系统** - 支持负载均衡和代理

### 1.2 API版本管理
- 版本号格式：`v1`, `v2`, `v3`
- 版本控制方式：URL路径版本控制
- 向后兼容策略：保持旧版本API可用
- 废弃通知：提前通知API废弃计划

### 1.3 基础URL
```
开发环境: http://localhost:5001/api/v1
测试环境: https://test-api.sical.com/api/v1
生产环境: https://api.sical.com/api/v1
```

## 2. 通用规范

### 2.1 HTTP方法
- `GET` - 获取资源
- `POST` - 创建资源
- `PUT` - 更新资源（完整更新）
- `PATCH` - 更新资源（部分更新）
- `DELETE` - 删除资源

### 2.2 状态码
```
成功响应:
200 OK - 请求成功
201 Created - 资源创建成功
204 No Content - 请求成功，无返回内容

客户端错误:
400 Bad Request - 请求参数错误
401 Unauthorized - 未授权
403 Forbidden - 禁止访问
404 Not Found - 资源不存在
409 Conflict - 资源冲突
422 Unprocessable Entity - 请求格式正确但语义错误

服务器错误:
500 Internal Server Error - 服务器内部错误
502 Bad Gateway - 网关错误
503 Service Unavailable - 服务不可用
```

### 2.3 请求头
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
Accept: application/json
User-Agent: SiCal-Client/1.0
```

### 2.4 响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid"
}
```

### 2.5 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid"
}
```

### 2.6 分页格式
```json
{
  "success": true,
  "data": {
    "items": [],
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

## 3. 认证授权API

### 3.1 用户注册
```
POST /auth/register

Request Body:
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "profession": "string"
  }
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "profile": {}
    },
    "token": "jwt_token"
  }
}
```

### 3.2 用户登录
```
POST /auth/login

Request Body:
{
  "email": "string",
  "password": "string",
  "rememberMe": "boolean"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "profile": {},
      "roles": ["string"]
    },
    "token": "jwt_token",
    "refreshToken": "string",
    "expiresIn": "number"
  }
}
```

### 3.3 刷新令牌
```
POST /auth/refresh

Request Body:
{
  "refreshToken": "string"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "expiresIn": "number"
  }
}
```

### 3.4 用户登出
```
POST /auth/logout

Headers:
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "登出成功"
}
```

## 4. 用户管理API

### 4.1 获取用户信息
```
GET /users/profile

Headers:
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "profile": {
      "firstName": "string",
      "lastName": "string",
      "avatar": "string",
      "profession": "string",
      "bio": "string",
      "location": "string"
    },
    "preferences": {
      "language": "string",
      "timezone": "string",
      "notifications": {}
    },
    "stats": {
      "totalLearningTime": "number",
      "completedCourses": "number",
      "averageScore": "number"
    }
  }
}
```

### 4.2 更新用户信息
```
PUT /users/profile

Headers:
Authorization: Bearer <jwt_token>

Request Body:
{
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "profession": "string",
    "bio": "string",
    "location": "string"
  }
}

Response:
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

### 4.3 上传头像
```
POST /users/avatar

Headers:
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Request Body:
FormData with 'avatar' file field

Response:
{
  "success": true,
  "data": {
    "avatarUrl": "string"
  }
}
```

### 4.4 修改密码
```
PUT /users/password

Headers:
Authorization: Bearer <jwt_token>

Request Body:
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}

Response:
{
  "success": true,
  "message": "密码修改成功"
}
```

## 5. 知识库API

### 5.1 获取知识分类
```
GET /knowledge/categories

Query Parameters:
- level: number (分类层级)
- parent: string (父分类ID)

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "level": "number",
      "parentId": "string",
      "children": [],
      "knowledgeCount": "number"
    }
  ]
}
```

### 5.2 搜索知识内容
```
GET /knowledge/search

Query Parameters:
- q: string (搜索关键词)
- category: string (分类ID)
- tags: string[] (标签)
- difficulty: string (难度级别)
- page: number (页码)
- limit: number (每页数量)

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "summary": "string",
        "category": {},
        "tags": [],
        "difficulty": "string",
        "viewCount": "number",
        "rating": "number",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {},
    "facets": {
      "categories": [],
      "tags": [],
      "difficulties": []
    }
  }
}
```

### 5.3 获取知识详情
```
GET /knowledge/:id

Path Parameters:
- id: string (知识ID)

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "summary": "string",
    "category": {},
    "tags": [],
    "difficulty": "string",
    "prerequisites": [],
    "relatedKnowledge": [],
    "multimedia": {
      "images": [],
      "videos": [],
      "animations": []
    },
    "metadata": {
      "author": "string",
      "reviewers": [],
      "version": "string",
      "lastReviewed": "string"
    },
    "stats": {
      "viewCount": "number",
      "rating": "number",
      "ratingCount": "number",
      "bookmarkCount": "number"
    }
  }
}
```

### 5.4 创建知识内容
```
POST /knowledge

Headers:
Authorization: Bearer <jwt_token>

Request Body:
{
  "title": "string",
  "content": "string",
  "summary": "string",
  "categoryId": "string",
  "tags": ["string"],
  "difficulty": "string",
  "prerequisites": ["string"]
}

Response:
{
  "success": true,
  "data": {
    "knowledge": {}
  }
}
```

## 6. 学习路径API

### 6.1 获取学习路径列表
```
GET /learning-paths

Query Parameters:
- category: string (分类)
- difficulty: string (难度)
- duration: string (时长)
- page: number
- limit: number

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "string",
        "difficulty": "string",
        "estimatedDuration": "number",
        "knowledgeCount": "number",
        "enrollmentCount": "number",
        "rating": "number",
        "thumbnail": "string",
        "tags": []
      }
    ],
    "pagination": {}
  }
}
```

### 6.2 获取学习路径详情
```
GET /learning-paths/:id

Path Parameters:
- id: string (路径ID)

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "objectives": ["string"],
    "prerequisites": ["string"],
    "difficulty": "string",
    "estimatedDuration": "number",
    "modules": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "order": "number",
        "knowledgeItems": [],
        "assessments": [],
        "estimatedDuration": "number"
      }
    ],
    "metadata": {
      "author": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "version": "string"
    }
  }
}
```

### 6.3 注册学习路径
```
POST /learning-paths/:id/enroll

Headers:
Authorization: Bearer <jwt_token>

Path Parameters:
- id: string (路径ID)

Response:
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "string",
      "pathId": "string",
      "userId": "string",
      "enrolledAt": "string",
      "status": "active",
      "progress": {
        "completedModules": 0,
        "totalModules": 10,
        "completionPercentage": 0
      }
    }
  }
}
```

### 6.4 获取学习进度
```
GET /learning-paths/:id/progress

Headers:
Authorization: Bearer <jwt_token>

Path Parameters:
- id: string (路径ID)

Response:
{
  "success": true,
  "data": {
    "pathId": "string",
    "userId": "string",
    "overallProgress": {
      "completionPercentage": "number",
      "completedModules": "number",
      "totalModules": "number",
      "timeSpent": "number",
      "lastAccessedAt": "string"
    },
    "moduleProgress": [
      {
        "moduleId": "string",
        "status": "completed|in_progress|not_started",
        "completionPercentage": "number",
        "timeSpent": "number",
        "knowledgeProgress": [],
        "assessmentScores": []
      }
    ]
  }
}
```

## 7. 评估系统API

### 7.1 获取考试列表
```
GET /assessments

Query Parameters:
- type: string (考试类型)
- category: string (分类)
- difficulty: string (难度)
- status: string (状态)

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "type": "quiz|exam|practice",
        "category": "string",
        "difficulty": "string",
        "duration": "number",
        "questionCount": "number",
        "passingScore": "number",
        "attempts": "number",
        "availableFrom": "string",
        "availableTo": "string"
      }
    ]
  }
}
```

### 7.2 开始考试
```
POST /assessments/:id/start

Headers:
Authorization: Bearer <jwt_token>

Path Parameters:
- id: string (考试ID)

Response:
{
  "success": true,
  "data": {
    "session": {
      "id": "string",
      "assessmentId": "string",
      "userId": "string",
      "startedAt": "string",
      "expiresAt": "string",
      "status": "active",
      "currentQuestionIndex": 0,
      "totalQuestions": "number"
    },
    "firstQuestion": {
      "id": "string",
      "type": "single_choice|multiple_choice|true_false|fill_blank",
      "content": "string",
      "options": [],
      "multimedia": {},
      "timeLimit": "number"
    }
  }
}
```

### 7.3 提交答案
```
POST /assessments/sessions/:sessionId/answer

Headers:
Authorization: Bearer <jwt_token>

Path Parameters:
- sessionId: string (会话ID)

Request Body:
{
  "questionId": "string",
  "answer": "string|string[]|boolean",
  "timeSpent": "number"
}

Response:
{
  "success": true,
  "data": {
    "nextQuestion": {
      "id": "string",
      "type": "string",
      "content": "string",
      "options": []
    },
    "progress": {
      "currentQuestionIndex": "number",
      "totalQuestions": "number",
      "answeredQuestions": "number",
      "remainingTime": "number"
    }
  }
}
```

### 7.4 完成考试
```
POST /assessments/sessions/:sessionId/finish

Headers:
Authorization: Bearer <jwt_token>

Path Parameters:
- sessionId: string (会话ID)

Response:
{
  "success": true,
  "data": {
    "result": {
      "id": "string",
      "sessionId": "string",
      "score": "number",
      "percentage": "number",
      "passed": "boolean",
      "totalQuestions": "number",
      "correctAnswers": "number",
      "timeSpent": "number",
      "completedAt": "string",
      "breakdown": {
        "byCategory": [],
        "byDifficulty": [],
        "byQuestionType": []
      }
    }
  }
}
```

### 7.5 获取考试结果
```
GET /assessments/results/:resultId

Headers:
Authorization: Bearer <jwt_token>

Path Parameters:
- resultId: string (结果ID)

Response:
{
  "success": true,
  "data": {
    "result": {
      "id": "string",
      "assessment": {},
      "score": "number",
      "percentage": "number",
      "passed": "boolean",
      "completedAt": "string",
      "detailedAnalysis": {
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recommendations": ["string"]
      },
      "questionResults": [
        {
          "questionId": "string",
          "question": "string",
          "userAnswer": "string",
          "correctAnswer": "string",
          "isCorrect": "boolean",
          "explanation": "string",
          "category": "string",
          "difficulty": "string"
        }
      ]
    }
  }
}
```

## 8. 错误代码定义

### 8.1 认证错误
```
AUTH_001: 用户名或密码错误
AUTH_002: 账户已被禁用
AUTH_003: 令牌已过期
AUTH_004: 令牌无效
AUTH_005: 权限不足
AUTH_006: 邮箱已存在
AUTH_007: 用户名已存在
```

### 8.2 验证错误
```
VALID_001: 请求参数缺失
VALID_002: 参数格式错误
VALID_003: 参数值超出范围
VALID_004: 邮箱格式不正确
VALID_005: 密码强度不够
```

### 8.3 业务错误
```
BUSINESS_001: 资源不存在
BUSINESS_002: 资源已存在
BUSINESS_003: 操作不被允许
BUSINESS_004: 状态不正确
BUSINESS_005: 配额已用完
```

### 8.4 系统错误
```
SYSTEM_001: 数据库连接失败
SYSTEM_002: 外部服务不可用
SYSTEM_003: 文件上传失败
SYSTEM_004: 缓存服务异常
SYSTEM_005: 内部服务错误
```

## 9. API限流和安全

### 9.1 限流策略
```
全局限流: 1000 requests/hour per IP
用户限流: 500 requests/hour per user
登录限流: 10 attempts/hour per IP
上传限流: 100 MB/hour per user
```

### 9.2 安全措施
- HTTPS强制加密
- JWT令牌认证
- API密钥验证
- 请求签名验证
- SQL注入防护
- XSS攻击防护
- CSRF令牌验证

## 10. API文档和测试

### 10.1 文档工具
- Swagger/OpenAPI 3.0
- 自动生成API文档
- 交互式API测试
- 代码示例生成

### 10.2 测试工具
- Postman集合
- 自动化测试套件
- 性能测试脚本
- 安全测试用例

## 11. 更新记录

- 2024-01-XX - 初始版本创建
- 2024-01-XX - 添加认证授权API
- 2024-01-XX - 完善用户管理API
- 2024-01-XX - 添加知识库API
- 2024-01-XX - 完善学习路径API
- 2024-01-XX - 添加评估系统API
- 2024-01-XX - 完善错误处理和安全措施