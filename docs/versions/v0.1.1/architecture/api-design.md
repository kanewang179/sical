# 智能学习规划应用 - API设计规范 v0.1.1

## 📋 文档信息

| 项目 | 智能学习规划应用 API设计 |
|------|-------------------------|
| **版本** | v0.1.1 |
| **API版本** | v1 |
| **更新日期** | 2024-01-15 |
| **状态** | 开发中 |

## 🎯 API设计原则

### RESTful设计
- 遵循REST架构风格
- 使用HTTP动词表示操作(GET/POST/PUT/DELETE)
- 资源导向的URL设计
- 统一的响应格式

### 安全性
- JWT Token认证
- HTTPS加密传输
- 输入参数验证
- 访问频率限制

### 性能优化
- 响应数据压缩
- 分页查询支持
- 缓存策略
- 异步处理长时间操作

## 🌐 API基础规范

### 基础URL
```
开发环境: http://localhost:8080/api/v1
测试环境: https://test-api.sical.com/api/v1
生产环境: https://api.sical.com/api/v1
```

### 通用响应格式
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

### 错误响应格式
```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误",
  "error": {
    "type": "ValidationError",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

### HTTP状态码规范
- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 无权限
- `404 Not Found`: 资源不存在
- `422 Unprocessable Entity`: 业务逻辑错误
- `429 Too Many Requests`: 请求频率超限
- `500 Internal Server Error`: 服务器内部错误

## 🔐 认证授权

### JWT Token认证
```http
Authorization: Bearer <jwt_token>
```

### Token获取
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Token刷新
```http
POST /api/v1/auth/refresh
Authorization: Bearer <refresh_token>
```

## 👤 用户管理模块 API

### 用户注册
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "profile": {
    "full_name": "John Doe",
    "age": 25,
    "education_level": "undergraduate",
    "interests": ["programming", "data_science"]
  }
}
```

### 用户登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 获取用户信息
```http
GET /api/v1/users/profile
Authorization: Bearer <jwt_token>
```

### 更新用户信息
```http
PUT /api/v1/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "profile": {
    "full_name": "John Smith",
    "age": 26,
    "bio": "Software Developer"
  }
}
```

### 修改密码
```http
PUT /api/v1/users/password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "current_password": "old_password",
  "new_password": "new_password",
  "confirm_password": "new_password"
}
```

## 🎯 学习目标分析模块 API

### 提交学习目标
```http
POST /api/v1/learning/analyze-goal
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "goal_text": "我想学习Python数据分析",
  "goal_type": "learning", // learning | exam_prep
  "difficulty_preference": "beginner", // beginner | intermediate | advanced
  "time_commitment": "2-3 hours per week",
  "background": {
    "programming_experience": "none",
    "math_level": "high_school",
    "related_knowledge": []
  }
}
```

### 获取分析结果
```http
GET /api/v1/learning/analysis/{analysis_id}
Authorization: Bearer <jwt_token>
```

### 重新分析目标
```http
PUT /api/v1/learning/analysis/{analysis_id}/reanalyze
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "goal_text": "更新后的学习目标",
  "additional_requirements": "新增的要求"
}
```

## 🗺️ 学习路径模块 API

### 生成学习路径
```http
POST /api/v1/learning-paths/generate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "analysis_id": "analysis_123",
  "customization": {
    "focus_areas": ["practical_projects", "theory"],
    "skip_topics": [],
    "preferred_learning_style": "hands_on"
  }
}
```

### 获取学习路径
```http
GET /api/v1/learning-paths/{path_id}
Authorization: Bearer <jwt_token>
```

### 获取用户所有学习路径
```http
GET /api/v1/learning-paths
Authorization: Bearer <jwt_token>
?page=1&limit=10&status=active
```

### 更新学习进度
```http
PUT /api/v1/learning-paths/{path_id}/progress
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "node_id": "node_123",
  "status": "completed", // not_started | in_progress | completed
  "completion_time": "2024-01-15T10:30:00Z",
  "notes": "学习笔记"
}
```

### 获取路径统计
```http
GET /api/v1/learning-paths/{path_id}/statistics
Authorization: Bearer <jwt_token>
```

## 📚 知识点模块 API

### 获取知识点内容
```http
GET /api/v1/knowledge/{node_id}/content
Authorization: Bearer <jwt_token>
?difficulty=beginner&format=detailed
```

### 生成知识点内容
```http
POST /api/v1/knowledge/{node_id}/generate-content
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content_type": "explanation", // explanation | example | exercise
  "difficulty_level": "beginner",
  "learning_style": "visual",
  "additional_context": "重点关注实际应用"
}
```

### 保存学习笔记
```http
POST /api/v1/knowledge/{node_id}/notes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "我的学习笔记内容",
  "tags": ["重要", "难点"],
  "is_public": false
}
```

### 获取学习笔记
```http
GET /api/v1/knowledge/{node_id}/notes
Authorization: Bearer <jwt_token>
```

### 搜索知识点
```http
GET /api/v1/knowledge/search
Authorization: Bearer <jwt_token>
?q=Python基础&category=programming&difficulty=beginner
```

## 📝 评估测试模块 API

### 生成练习题
```http
POST /api/v1/assessments/generate-questions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "knowledge_node_ids": ["node_123", "node_124"],
  "question_types": ["multiple_choice", "short_answer"],
  "difficulty_level": "beginner",
  "question_count": 10
}
```

### 提交答案
```http
POST /api/v1/assessments/{assessment_id}/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "answers": [
    {
      "question_id": "q_123",
      "answer": "A",
      "time_spent": 30
    },
    {
      "question_id": "q_124",
      "answer": "Python是一种编程语言",
      "time_spent": 120
    }
  ],
  "total_time": 900
}
```

### 获取评估结果
```http
GET /api/v1/assessments/{assessment_id}/results
Authorization: Bearer <jwt_token>
```

### 获取错题集
```http
GET /api/v1/assessments/wrong-questions
Authorization: Bearer <jwt_token>
?knowledge_node_id=node_123&page=1&limit=20
```

### 创建自定义考试
```http
POST /api/v1/assessments/custom-exam
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Python基础测试",
  "description": "测试Python基础知识掌握情况",
  "knowledge_nodes": ["node_123", "node_124"],
  "question_count": 20,
  "time_limit": 3600,
  "difficulty_distribution": {
    "easy": 40,
    "medium": 40,
    "hard": 20
  }
}
```

## 💬 评论互动模块 API

### 发布评论
```http
POST /api/v1/comments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "target_type": "knowledge_node", // knowledge_node | learning_path | assessment
  "target_id": "node_123",
  "content": "这个知识点讲解得很清楚",
  "parent_id": null, // 回复评论时填写父评论ID
  "rating": 5
}
```

### 获取评论列表
```http
GET /api/v1/comments
?target_type=knowledge_node&target_id=node_123&page=1&limit=20&sort=latest
```

### 点赞/取消点赞
```http
POST /api/v1/comments/{comment_id}/like
Authorization: Bearer <jwt_token>
```

### 举报评论
```http
POST /api/v1/comments/{comment_id}/report
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reason": "inappropriate_content",
  "description": "包含不当内容"
}
```

## 📊 个人知识库模块 API

### 获取个人知识库
```http
GET /api/v1/knowledge-base
Authorization: Bearer <jwt_token>
?category=all&mastery_level=all&page=1&limit=20
```

### 搜索知识库
```http
GET /api/v1/knowledge-base/search
Authorization: Bearer <jwt_token>
?q=Python&type=notes&date_range=last_month
```

### 获取复习推荐
```http
GET /api/v1/knowledge-base/review-recommendations
Authorization: Bearer <jwt_token>
```

### 标记复习完成
```http
POST /api/v1/knowledge-base/review-completed
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "knowledge_node_id": "node_123",
  "review_type": "flashcard", // flashcard | practice | re_read
  "mastery_level": "proficient", // not_mastered | basic | proficient | expert
  "notes": "复习笔记"
}
```

## 📈 数据统计模块 API

### 获取学习统计
```http
GET /api/v1/statistics/learning
Authorization: Bearer <jwt_token>
?period=last_month&granularity=daily
```

### 获取进度报告
```http
GET /api/v1/statistics/progress
Authorization: Bearer <jwt_token>
?learning_path_id=path_123
```

### 获取成就徽章
```http
GET /api/v1/statistics/achievements
Authorization: Bearer <jwt_token>
```

## 📢 通知系统模块 API

### 获取用户通知
```http
GET /api/v1/notifications
Authorization: Bearer <jwt_token>
?page=1&limit=20&type=all&status=unread
```

### 标记通知已读
```http
PUT /api/v1/notifications/{notification_id}/read
Authorization: Bearer <jwt_token>
```

### 批量标记已读
```http
PUT /api/v1/notifications/mark-all-read
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notification_ids": ["notif_123", "notif_124"],
  "mark_all": false
}
```

### 获取通知设置
```http
GET /api/v1/notifications/settings
Authorization: Bearer <jwt_token>
```

### 更新通知设置
```http
PUT /api/v1/notifications/settings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email_notifications": true,
  "push_notifications": true,
  "learning_reminders": true,
  "achievement_notifications": true,
  "comment_notifications": false
}
```

## 🔍 全局搜索模块 API

### 全局搜索
```http
GET /api/v1/search
Authorization: Bearer <jwt_token>
?q=Python&type=all&category=all&page=1&limit=20
```

### 搜索建议
```http
GET /api/v1/search/suggestions
Authorization: Bearer <jwt_token>
?q=Pyth&limit=10
```

### 搜索历史
```http
GET /api/v1/search/history
Authorization: Bearer <jwt_token>
?limit=20
```

### 清除搜索历史
```http
DELETE /api/v1/search/history
Authorization: Bearer <jwt_token>
```

## 👥 学习小组模块 API

### 创建学习小组
```http
POST /api/v1/groups
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Python学习小组",
  "description": "一起学习Python编程",
  "is_public": true,
  "max_members": 50,
  "learning_goals": ["goal_123"],
  "tags": ["Python", "编程"]
}
```

### 获取学习小组列表
```http
GET /api/v1/groups
Authorization: Bearer <jwt_token>
?page=1&limit=20&type=public&category=programming
```

### 加入学习小组
```http
POST /api/v1/groups/{group_id}/join
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "希望加入小组一起学习"
}
```

### 获取小组成员
```http
GET /api/v1/groups/{group_id}/members
Authorization: Bearer <jwt_token>
?page=1&limit=20&role=all
```

### 小组讨论
```http
POST /api/v1/groups/{group_id}/discussions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "关于Python装饰器的讨论",
  "content": "大家对装饰器有什么理解？",
  "tags": ["Python", "装饰器"]
}
```

### 小组学习PK
```http
POST /api/v1/groups/{group_id}/challenges
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "本周学习挑战",
  "description": "完成Python基础课程",
  "start_date": "2024-01-15",
  "end_date": "2024-01-21",
  "target_type": "learning_hours",
  "target_value": 10
}
```

## 📤 数据导入导出模块 API

### 导出个人数据
```http
POST /api/v1/data/export
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "data_types": ["profile", "learning_progress", "notes", "achievements"],
  "format": "json", // json, csv, pdf
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
}
```

### 获取导出状态
```http
GET /api/v1/data/exports/{export_id}
Authorization: Bearer <jwt_token>
```

### 下载导出文件
```http
GET /api/v1/data/exports/{export_id}/download
Authorization: Bearer <jwt_token>
```

### 导入学习数据
```http
POST /api/v1/data/import
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <学习数据文件>
data_type: learning_progress
format: json
```

### 获取导入历史
```http
GET /api/v1/data/imports
Authorization: Bearer <jwt_token>
?page=1&limit=20&status=all
```

## 🏆 完整成就系统模块 API

### 解锁成就
```http
POST /api/v1/achievements/unlock
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "achievement_type": "learning_streak",
  "trigger_data": {
    "consecutive_days": 7,
    "learning_hours": 10
  }
}
```

### 更新成就进度
```http
PUT /api/v1/achievements/{achievement_id}/progress
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "progress_increment": 1,
  "metadata": {
    "action": "completed_assessment",
    "score": 95
  }
}
```

### 获取成就排行榜
```http
GET /api/v1/achievements/leaderboard
Authorization: Bearer <jwt_token>
?type=total_points&period=monthly&limit=50
```

### 分享成就
```http
POST /api/v1/achievements/{achievement_id}/share
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "platform": "social", // social, group, public
  "message": "刚刚解锁了新成就！"
}
```

## 🔧 系统管理模块 API

### 健康检查
```http
GET /api/v1/health
```

### 系统信息
```http
GET /api/v1/system/info
Authorization: Bearer <admin_token>
```

### 缓存管理
```http
DELETE /api/v1/system/cache
Authorization: Bearer <admin_token>
?pattern=user:*
```

## 📝 分页和排序

### 分页参数
- `page`: 页码，从1开始
- `limit`: 每页数量，默认20，最大100
- `sort`: 排序字段
- `order`: 排序方向，asc/desc

### 分页响应格式
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## 🚀 性能优化

### 缓存策略
- 用户信息缓存：30分钟
- 知识点内容缓存：1小时
- 学习路径缓存：15分钟
- 评估结果缓存：永久(直到更新)

### 限流策略
- 登录接口：5次/分钟
- 内容生成接口：10次/分钟
- 普通查询接口：100次/分钟
- 文件上传接口：20次/分钟

## 📋 API版本管理

### 版本策略
- URL路径版本控制：`/api/v1/`
- 向后兼容性保证
- 废弃API提前通知
- 版本迁移指南

### 版本生命周期
- v1.0: 当前版本
- v1.1: 开发中
- v0.9: 维护模式(6个月后废弃)

---

**文档维护**: 本文档随API开发进度持续更新  
**最后更新**: 2024-01-15  
**负责人**: 后端开发团队