# 学习路径功能 API 接口文档

## 1. 接口概览

### 1.1 基础信息
- **API版本**: v1
- **基础URL**: `https://api.sical.com/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "参数验证失败",
    "details": {
      "field": "title",
      "reason": "标题不能为空"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### 1.3 分页响应格式
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 1.4 请求头要求
```http
Authorization: Bearer {access_token}
Content-Type: application/json
X-Request-ID: {unique_request_id}
X-Client-Version: 1.0.0
```

---

## 2. 学习路径管理接口

### 2.1 创建学习路径

**接口地址**: `POST /learning-paths`

**请求参数**:
```json
{
  "title": "Python数据科学入门",
  "description": "从零开始学习Python数据科学，包含基础语法、数据处理、可视化等内容",
  "category": "data-science",
  "tags": ["python", "数据科学", "机器学习"],
  "difficulty": "beginner",
  "estimatedDuration": 120,
  "structure": {
    "nodes": [
      {
        "id": "node_1",
        "type": "knowledge",
        "title": "Python基础语法",
        "contentId": "content_123",
        "position": { "x": 100, "y": 100 },
        "estimatedTime": 20,
        "prerequisites": [],
        "isOptional": false,
        "metadata": {
          "contentType": "video",
          "difficulty": "beginner"
        }
      }
    ],
    "edges": [
      {
        "from": "node_1",
        "to": "node_2",
        "type": "sequential",
        "condition": {
          "type": "completion",
          "threshold": 80
        }
      }
    ]
  },
  "isPublic": true,
  "isTemplate": false
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "pathId": "path_123456",
    "title": "Python数据科学入门",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z",
    "creator": {
      "userId": "user_789",
      "username": "张老师",
      "avatar": "https://cdn.sical.com/avatars/user_789.jpg"
    }
  }
}
```

### 2.2 获取学习路径详情

**接口地址**: `GET /learning-paths/{pathId}`

**路径参数**:
- `pathId`: 学习路径ID

**查询参数**:
- `includeStats`: 是否包含统计信息 (true/false)
- `includeProgress`: 是否包含用户进度 (true/false)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "pathId": "path_123456",
    "title": "Python数据科学入门",
    "description": "从零开始学习Python数据科学",
    "category": "data-science",
    "tags": ["python", "数据科学"],
    "difficulty": "beginner",
    "estimatedDuration": 120,
    "structure": {
      "nodes": [...],
      "edges": [...]
    },
    "creator": {
      "userId": "user_789",
      "username": "张老师",
      "avatar": "https://cdn.sical.com/avatars/user_789.jpg"
    },
    "stats": {
      "enrollments": 1250,
      "completions": 890,
      "averageRating": 4.6,
      "averageCompletionTime": 115,
      "successRate": 0.712
    },
    "userProgress": {
      "isEnrolled": true,
      "status": "in_progress",
      "overallProgress": 45.5,
      "currentNodeId": "node_3",
      "startedAt": "2024-01-10T09:00:00Z",
      "lastAccessedAt": "2024-01-15T08:30:00Z"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2.3 更新学习路径

**接口地址**: `PUT /learning-paths/{pathId}`

**请求参数**: 与创建接口相同，支持部分更新

**响应示例**:
```json
{
  "success": true,
  "data": {
    "pathId": "path_123456",
    "updatedAt": "2024-01-15T10:30:00Z",
    "version": 2
  }
}
```

### 2.4 删除学习路径

**接口地址**: `DELETE /learning-paths/{pathId}`

**响应示例**:
```json
{
  "success": true,
  "message": "学习路径已删除"
}
```

### 2.5 获取学习路径列表

**接口地址**: `GET /learning-paths`

**查询参数**:
- `page`: 页码 (默认: 1)
- `pageSize`: 每页数量 (默认: 20, 最大: 100)
- `category`: 分类筛选
- `difficulty`: 难度筛选
- `tags`: 标签筛选 (逗号分隔)
- `creator`: 创建者筛选
- `sortBy`: 排序字段 (created_at/updated_at/popularity/rating)
- `sortOrder`: 排序方向 (asc/desc)
- `search`: 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "pathId": "path_123456",
        "title": "Python数据科学入门",
        "description": "从零开始学习Python数据科学",
        "category": "data-science",
        "difficulty": "beginner",
        "estimatedDuration": 120,
        "creator": {
          "username": "张老师",
          "avatar": "https://cdn.sical.com/avatars/user_789.jpg"
        },
        "stats": {
          "enrollments": 1250,
          "averageRating": 4.6
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 3. 智能推荐接口

### 3.1 生成个性化学习路径

**接口地址**: `POST /recommendations/generate-path`

**请求参数**:
```json
{
  "goals": [
    {
      "title": "掌握机器学习基础",
      "description": "学习机器学习的基本概念和常用算法",
      "category": "machine-learning",
      "priority": "high",
      "targetDate": "2024-06-01",
      "currentLevel": "beginner",
      "targetLevel": "intermediate"
    }
  ],
  "constraints": {
    "maxDuration": 100,
    "preferredDifficulty": "intermediate",
    "availableTimePerDay": 2,
    "preferredContentTypes": ["video", "practice"],
    "excludeTopics": ["深度学习"]
  },
  "preferences": {
    "learningStyle": "visual",
    "pace": "normal",
    "interactivity": "high"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "generatedPath": {
      "title": "个性化机器学习学习路径",
      "description": "根据您的目标和偏好定制的机器学习学习路径",
      "estimatedDuration": 95,
      "difficulty": "intermediate",
      "structure": {
        "nodes": [...],
        "edges": [...]
      },
      "milestones": [
        {
          "nodeId": "node_5",
          "title": "完成基础概念学习",
          "progress": 25
        }
      ]
    },
    "alternatives": [
      {
        "title": "快速入门路径",
        "estimatedDuration": 60,
        "difficulty": "beginner",
        "score": 0.85
      }
    ],
    "generationMetadata": {
      "algorithmsUsed": ["collaborative_filtering", "content_based"],
      "confidence": 0.92,
      "generatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 3.2 获取内容推荐

**接口地址**: `GET /recommendations/content`

**查询参数**:
- `type`: 推荐类型 (path/knowledge/practice/assessment)
- `limit`: 推荐数量 (默认: 10, 最大: 50)
- `context`: 推荐上下文 (homepage/learning/search)
- `excludeCompleted`: 是否排除已完成内容 (true/false)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "itemId": "path_789",
        "itemType": "learning_path",
        "title": "深度学习进阶",
        "description": "深入学习神经网络和深度学习算法",
        "score": 0.95,
        "reason": "基于您对机器学习的兴趣推荐",
        "algorithm": "collaborative_filtering",
        "metadata": {
          "category": "deep-learning",
          "difficulty": "advanced",
          "estimatedDuration": 80
        }
      }
    ],
    "context": {
      "userId": "user_123",
      "sessionId": "session_456",
      "generatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 3.3 获取相似用户推荐

**接口地址**: `GET /recommendations/similar-users`

**查询参数**:
- `limit`: 推荐数量 (默认: 10)
- `includeStats`: 是否包含统计信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "similarUsers": [
      {
        "userId": "user_456",
        "username": "李同学",
        "avatar": "https://cdn.sical.com/avatars/user_456.jpg",
        "similarity": 0.87,
        "commonInterests": ["python", "数据科学", "机器学习"],
        "stats": {
          "completedPaths": 15,
          "totalStudyTime": 240,
          "averageRating": 4.5
        }
      }
    ]
  }
}
```

### 3.4 推荐反馈

**接口地址**: `POST /recommendations/{recommendationId}/feedback`

**请求参数**:
```json
{
  "action": "clicked",
  "rating": 4,
  "feedback": "推荐很准确，内容很有帮助",
  "context": {
    "position": 1,
    "pageType": "homepage",
    "sessionId": "session_456"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "反馈已记录，谢谢您的反馈"
}
```

---

## 4. 学习进度管理接口

### 4.1 注册学习路径

**接口地址**: `POST /learning-paths/{pathId}/enroll`

**请求参数**:
```json
{
  "settings": {
    "dailyGoal": 60,
    "reminderTime": "09:00",
    "preferredDifficulty": "normal",
    "learningPace": "normal"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "enrollmentId": "enrollment_123",
    "pathId": "path_456",
    "status": "enrolled",
    "startedAt": "2024-01-15T10:30:00Z",
    "estimatedCompletionDate": "2024-03-15T10:30:00Z"
  }
}
```

### 4.2 更新学习进度

**接口地址**: `POST /progress/update`

**请求参数**:
```json
{
  "pathId": "path_123",
  "nodeId": "node_456",
  "progress": 75,
  "timeSpent": 30,
  "score": 85,
  "status": "in_progress",
  "metadata": {
    "attempts": 2,
    "hints_used": 1,
    "completion_method": "practice"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "nodeProgress": {
      "nodeId": "node_456",
      "progress": 75,
      "status": "in_progress",
      "timeSpent": 30,
      "score": 85
    },
    "overallProgress": 45.5,
    "milestones": [
      {
        "type": "progress_milestone",
        "value": 50,
        "achieved": false,
        "estimatedDate": "2024-01-20T10:30:00Z"
      }
    ],
    "achievements": [
      {
        "id": "first_practice",
        "title": "初次实践",
        "description": "完成第一个实践练习",
        "earnedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 4.3 获取学习进度

**接口地址**: `GET /users/{userId}/progress/{pathId}`

**查询参数**:
- `includeDetails`: 是否包含详细进度信息
- `includeStats`: 是否包含统计信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "pathId": "path_123",
    "userId": "user_456",
    "status": "in_progress",
    "overallProgress": 45.5,
    "currentNodeId": "node_3",
    "nodeProgress": [
      {
        "nodeId": "node_1",
        "status": "completed",
        "progress": 100,
        "timeSpent": 25,
        "score": 92,
        "completedAt": "2024-01-12T14:30:00Z"
      },
      {
        "nodeId": "node_2",
        "status": "completed",
        "progress": 100,
        "timeSpent": 35,
        "score": 88,
        "completedAt": "2024-01-14T16:45:00Z"
      },
      {
        "nodeId": "node_3",
        "status": "in_progress",
        "progress": 60,
        "timeSpent": 20,
        "lastAccessedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "stats": {
      "totalTimeSpent": 80,
      "sessionsCount": 8,
      "averageSessionTime": 10,
      "streakDays": 5,
      "lastStudyDate": "2024-01-15T10:30:00Z"
    },
    "achievements": [
      {
        "id": "consistent_learner",
        "title": "坚持学习者",
        "description": "连续学习5天",
        "earnedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "startedAt": "2024-01-10T09:00:00Z",
    "lastUpdatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4.4 获取学习统计

**接口地址**: `GET /users/{userId}/analytics`

**查询参数**:
- `timeRange`: 时间范围 (7d/30d/90d/1y)
- `pathId`: 特定路径ID (可选)
- `metrics`: 指标类型 (time/progress/performance/habits)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "timeRange": "30d",
    "summary": {
      "totalStudyTime": 1200,
      "activeDays": 22,
      "completedNodes": 45,
      "averageScore": 87.5,
      "streakDays": 7
    },
    "studyHabits": {
      "averageSessionLength": 25,
      "preferredStudyTimes": ["09:00-11:00", "19:00-21:00"],
      "studyFrequency": 0.73,
      "consistencyScore": 0.85,
      "peakPerformanceTime": "10:00-11:00"
    },
    "learningEfficiency": {
      "averageTimeToCompletion": 28,
      "retentionRate": 0.82,
      "errorRate": 0.15,
      "improvementTrend": 0.12
    },
    "progressTrend": [
      {
        "date": "2024-01-01",
        "studyTime": 30,
        "nodesCompleted": 2,
        "averageScore": 85
      }
    ],
    "recommendations": [
      {
        "type": "habit",
        "message": "建议在上午10-11点学习，这是您的高效时段",
        "priority": "medium"
      }
    ]
  }
}
```

### 4.5 获取学习报告

**接口地址**: `GET /users/{userId}/reports/learning`

**查询参数**:
- `format`: 报告格式 (json/pdf/excel)
- `timeRange`: 时间范围
- `pathIds`: 路径ID列表 (可选)
- `includeCharts`: 是否包含图表

**响应示例**:
```json
{
  "success": true,
  "data": {
    "reportId": "report_123",
    "generatedAt": "2024-01-15T10:30:00Z",
    "timeRange": "30d",
    "summary": {
      "totalPaths": 3,
      "completedPaths": 1,
      "inProgressPaths": 2,
      "totalStudyTime": 1200,
      "averageScore": 87.5
    },
    "pathDetails": [
      {
        "pathId": "path_123",
        "title": "Python数据科学入门",
        "status": "completed",
        "progress": 100,
        "timeSpent": 480,
        "averageScore": 89,
        "completedAt": "2024-01-10T15:30:00Z"
      }
    ],
    "achievements": [
      {
        "id": "path_master",
        "title": "路径大师",
        "description": "完成第一个学习路径",
        "earnedAt": "2024-01-10T15:30:00Z"
      }
    ],
    "downloadUrl": "https://api.sical.com/reports/download/report_123.pdf"
  }
}
```

---

## 5. 社交学习接口

### 5.1 创建学习小组

**接口地址**: `POST /learning-groups`

**请求参数**:
```json
{
  "name": "Python学习小组",
  "description": "一起学习Python编程",
  "pathId": "path_123",
  "maxMembers": 20,
  "isPublic": true,
  "settings": {
    "allowInvite": true,
    "requireApproval": false,
    "enableChat": true,
    "enableProgress": true
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "groupId": "group_123",
    "name": "Python学习小组",
    "inviteCode": "PYTHON2024",
    "createdAt": "2024-01-15T10:30:00Z",
    "creator": {
      "userId": "user_456",
      "username": "张同学"
    }
  }
}
```

### 5.2 加入学习小组

**接口地址**: `POST /learning-groups/{groupId}/join`

**请求参数**:
```json
{
  "inviteCode": "PYTHON2024",
  "message": "希望和大家一起学习Python"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "membershipId": "membership_789",
    "status": "active",
    "joinedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5.3 获取小组进度排行

**接口地址**: `GET /learning-groups/{groupId}/leaderboard`

**查询参数**:
- `metric`: 排行指标 (progress/time/score)
- `timeRange`: 时间范围 (7d/30d/all)
- `limit`: 返回数量

**响应示例**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user_123",
        "username": "李同学",
        "avatar": "https://cdn.sical.com/avatars/user_123.jpg",
        "progress": 85.5,
        "studyTime": 240,
        "averageScore": 92,
        "badge": "学习之星"
      }
    ],
    "userRank": {
      "rank": 5,
      "progress": 65.2,
      "studyTime": 180
    },
    "groupStats": {
      "totalMembers": 15,
      "activeMembers": 12,
      "averageProgress": 58.7,
      "totalStudyTime": 2400
    }
  }
}
```

### 5.4 导师匹配

**接口地址**: `POST /mentorship/match`

**请求参数**:
```json
{
  "role": "mentee",
  "subjects": ["python", "数据科学"],
  "level": "beginner",
  "preferences": {
    "communicationStyle": "patient",
    "availability": ["weekday_evening", "weekend"],
    "language": "chinese"
  },
  "goals": "希望在3个月内掌握Python数据分析"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "mentorId": "user_789",
        "username": "王老师",
        "avatar": "https://cdn.sical.com/avatars/user_789.jpg",
        "expertise": ["python", "数据科学", "机器学习"],
        "experience": "5年数据科学经验",
        "rating": 4.8,
        "matchScore": 0.92,
        "availability": ["weekday_evening"],
        "bio": "资深数据科学家，擅长Python教学"
      }
    ],
    "matchingCriteria": {
      "subjectMatch": 1.0,
      "levelMatch": 0.9,
      "styleMatch": 0.85,
      "availabilityMatch": 0.8
    }
  }
}
```

---

## 6. 评估与测试接口

### 6.1 创建能力评估

**接口地址**: `POST /assessments`

**请求参数**:
```json
{
  "title": "Python基础能力评估",
  "description": "评估Python编程基础能力",
  "type": "adaptive",
  "domain": "python",
  "difficulty": "adaptive",
  "estimatedTime": 30,
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Python中哪个关键字用于定义函数？",
      "options": ["def", "function", "func", "define"],
      "correctAnswer": "def",
      "difficulty": "easy",
      "points": 1
    }
  ],
  "settings": {
    "shuffleQuestions": true,
    "allowReview": false,
    "timeLimit": 1800,
    "passingScore": 70
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "assessmentId": "assessment_123",
    "title": "Python基础能力评估",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 6.2 开始评估

**接口地址**: `POST /assessments/{assessmentId}/start`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "sessionId": "session_456",
    "assessmentId": "assessment_123",
    "startedAt": "2024-01-15T10:30:00Z",
    "timeLimit": 1800,
    "totalQuestions": 20,
    "firstQuestion": {
      "questionId": "q1",
      "type": "multiple_choice",
      "question": "Python中哪个关键字用于定义函数？",
      "options": ["def", "function", "func", "define"],
      "timeLimit": 90
    }
  }
}
```

### 6.3 提交答案

**接口地址**: `POST /assessments/sessions/{sessionId}/answer`

**请求参数**:
```json
{
  "questionId": "q1",
  "answer": "def",
  "timeSpent": 15,
  "confidence": 0.9
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "points": 1,
    "explanation": "正确！def是Python中定义函数的关键字。",
    "nextQuestion": {
      "questionId": "q2",
      "type": "coding",
      "question": "编写一个函数计算两个数的和",
      "template": "def add_numbers(a, b):\n    # 在这里编写代码\n    pass",
      "timeLimit": 300
    },
    "progress": {
      "current": 2,
      "total": 20,
      "percentage": 10
    }
  }
}
```

### 6.4 获取评估结果

**接口地址**: `GET /assessments/sessions/{sessionId}/result`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "sessionId": "session_456",
    "assessmentId": "assessment_123",
    "status": "completed",
    "score": {
      "total": 85,
      "percentage": 85,
      "grade": "B+",
      "passed": true
    },
    "timing": {
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T11:00:00Z",
      "totalTime": 1800,
      "averageTimePerQuestion": 90
    },
    "performance": {
      "correctAnswers": 17,
      "totalQuestions": 20,
      "accuracy": 0.85,
      "difficultyProgression": {
        "easy": { "correct": 8, "total": 8 },
        "medium": { "correct": 7, "total": 9 },
        "hard": { "correct": 2, "total": 3 }
      }
    },
    "abilityEstimate": {
      "domain": "python",
      "level": "intermediate",
      "confidence": 0.87,
      "strengths": ["基础语法", "函数定义"],
      "weaknesses": ["面向对象", "异常处理"]
    },
    "recommendations": [
      {
        "type": "learning_path",
        "title": "Python面向对象编程",
        "reason": "基于您在面向对象方面的薄弱环节推荐"
      }
    ],
    "certificate": {
      "available": true,
      "downloadUrl": "https://api.sical.com/certificates/session_456.pdf"
    }
  }
}
```

---

## 7. 错误码说明

### 7.1 通用错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| SUCCESS | 200 | 请求成功 |
| INVALID_PARAMETER | 400 | 参数验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| METHOD_NOT_ALLOWED | 405 | 请求方法不允许 |
| CONFLICT | 409 | 资源冲突 |
| RATE_LIMITED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务不可用 |

### 7.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| PATH_NOT_FOUND | 学习路径不存在 |
| PATH_ACCESS_DENIED | 学习路径访问被拒绝 |
| ALREADY_ENROLLED | 已经注册该学习路径 |
| NOT_ENROLLED | 未注册该学习路径 |
| PROGRESS_UPDATE_FAILED | 进度更新失败 |
| ASSESSMENT_NOT_AVAILABLE | 评估不可用 |
| ASSESSMENT_ALREADY_COMPLETED | 评估已完成 |
| GROUP_FULL | 学习小组已满 |
| MENTOR_NOT_AVAILABLE | 导师不可用 |
| RECOMMENDATION_EXPIRED | 推荐已过期 |

### 7.3 验证错误码

| 错误码 | 说明 |
|--------|------|
| REQUIRED_FIELD_MISSING | 必填字段缺失 |
| INVALID_FORMAT | 格式不正确 |
| VALUE_OUT_OF_RANGE | 值超出范围 |
| INVALID_ENUM_VALUE | 枚举值无效 |
| STRING_TOO_LONG | 字符串过长 |
| STRING_TOO_SHORT | 字符串过短 |
| INVALID_DATE_FORMAT | 日期格式无效 |
| INVALID_EMAIL_FORMAT | 邮箱格式无效 |

---

## 8. 限流策略

### 8.1 接口限流

| 接口类型 | 限流规则 | 说明 |
|----------|----------|------|
| 查询接口 | 1000次/小时 | 用户级别限流 |
| 创建接口 | 100次/小时 | 用户级别限流 |
| 更新接口 | 200次/小时 | 用户级别限流 |
| 推荐接口 | 50次/小时 | 用户级别限流 |
| 评估接口 | 10次/小时 | 用户级别限流 |

### 8.2 限流响应

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "请求频率超限，请稍后再试",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetTime": "2024-01-15T11:30:00Z"
    }
  }
}
```

---

## 9. 安全说明

### 9.1 HTTPS要求
- 所有API请求必须使用HTTPS协议
- 支持TLS 1.2及以上版本
- 强制使用安全的加密套件

### 9.2 请求签名
对于敏感操作，需要进行请求签名验证：

```javascript
// 签名算法示例
const signature = HMAC_SHA256(
  method + '\n' +
  uri + '\n' +
  timestamp + '\n' +
  body,
  secretKey
);
```

### 9.3 IP白名单
- 支持配置IP白名单
- 可按用户或应用级别设置
- 支持CIDR格式的IP段

### 9.4 审计日志
- 记录所有API调用
- 包含用户ID、IP地址、操作类型等信息
- 支持日志查询和分析

---

## 10. SDK与工具

### 10.1 官方SDK

- **JavaScript SDK**: `npm install @sical/learning-path-sdk`
- **Python SDK**: `pip install sical-learning-path`
- **Java SDK**: Maven依赖配置
- **Go SDK**: `go get github.com/sical/learning-path-go`

### 10.2 Postman集合

提供完整的Postman API集合，包含：
- 所有接口的示例请求
- 环境变量配置
- 自动化测试脚本

下载地址：`https://api.sical.com/docs/postman/learning-path.json`

### 10.3 OpenAPI规范

提供标准的OpenAPI 3.0规范文档：
- 完整的接口定义
- 数据模型描述
- 示例代码生成

访问地址：`https://api.sical.com/docs/openapi/learning-path.yaml`

---

## 11. 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持学习路径管理
- 智能推荐系统
- 进度跟踪功能
- 社交学习功能
- 评估与测试系统

### 后续版本规划
- v1.1.0: 增加AI助手功能
- v1.2.0: 支持多语言学习路径
- v1.3.0: 增加VR/AR学习体验
- v2.0.0: 全面升级推荐算法

---

本API文档为学习路径功能提供了完整的接口规范，确保开发者能够高效地集成和使用相关功能。如有疑问，请联系技术支持团队。