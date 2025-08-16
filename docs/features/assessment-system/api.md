# 评估系统 API 接口文档

## 1. 接口概览

### 1.1 基础信息

- **API版本**: v1
- **基础URL**: `https://api.sical.com/v1/assessment`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: JWT Token

### 1.2 通用响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### 1.3 分页响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
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

### 1.4 请求头

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Request-ID: <unique_request_id>
X-Client-Version: 1.0.0
```

## 2. 题库管理接口

### 2.1 创建题目

**接口地址**: `POST /questions`

**请求参数**:
```json
{
  "type": "multiple_choice",
  "subject": "数学",
  "topic": "代数",
  "difficulty": 3,
  "content": {
    "question": "求解方程 2x + 3 = 7",
    "options": [
      {"id": "A", "text": "x = 1"},
      {"id": "B", "text": "x = 2"},
      {"id": "C", "text": "x = 3"},
      {"id": "D", "text": "x = 4"}
    ],
    "correctAnswer": "B",
    "explanation": "移项得到 2x = 4，所以 x = 2"
  },
  "tags": ["基础代数", "一元一次方程"],
  "estimatedTime": 120,
  "irtParameters": {
    "discrimination": 1.2,
    "difficulty": 0.5,
    "guessing": 0.25
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 201,
  "message": "题目创建成功",
  "data": {
    "questionId": "q_123456789",
    "type": "multiple_choice",
    "subject": "数学",
    "difficulty": 3,
    "createdAt": "2024-01-15T10:30:00Z",
    "status": "draft"
  }
}
```

### 2.2 获取题目详情

**接口地址**: `GET /questions/{questionId}`

**路径参数**:
- `questionId`: 题目ID

**查询参数**:
- `includeAnswer`: 是否包含答案 (boolean, 默认false)
- `includeAnalytics`: 是否包含统计数据 (boolean, 默认false)

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "questionId": "q_123456789",
    "type": "multiple_choice",
    "subject": "数学",
    "topic": "代数",
    "difficulty": 3,
    "content": {
      "question": "求解方程 2x + 3 = 7",
      "options": [
        {"id": "A", "text": "x = 1"},
        {"id": "B", "text": "x = 2"},
        {"id": "C", "text": "x = 3"},
        {"id": "D", "text": "x = 4"}
      ]
    },
    "tags": ["基础代数", "一元一次方程"],
    "estimatedTime": 120,
    "analytics": {
      "totalAttempts": 1250,
      "correctRate": 0.78,
      "averageTime": 95,
      "difficultyIndex": 0.22
    }
  }
}
```

### 2.3 搜索题目

**接口地址**: `GET /questions`

**查询参数**:
- `subject`: 学科
- `topic`: 主题
- `difficulty`: 难度等级
- `type`: 题目类型
- `tags`: 标签 (多个用逗号分隔)
- `keyword`: 关键词搜索
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认20)

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "items": [
      {
        "questionId": "q_123456789",
        "type": "multiple_choice",
        "subject": "数学",
        "topic": "代数",
        "difficulty": 3,
        "tags": ["基础代数"],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## 3. 试卷管理接口

### 3.1 创建试卷

**接口地址**: `POST /papers`

**请求参数**:
```json
{
  "title": "数学基础能力测试",
  "description": "测试学生的基础数学能力",
  "subject": "数学",
  "type": "adaptive",
  "config": {
    "timeLimit": 3600,
    "questionCount": 30,
    "passingScore": 60,
    "allowReview": true,
    "shuffleQuestions": true,
    "showProgress": true
  },
  "questions": [
    {
      "questionId": "q_123456789",
      "weight": 1.0,
      "required": true
    }
  ],
  "adaptiveConfig": {
    "initialDifficulty": 0.0,
    "terminationCriteria": {
      "maxQuestions": 30,
      "minQuestions": 10,
      "targetSE": 0.3
    }
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 201,
  "message": "试卷创建成功",
  "data": {
    "paperId": "p_123456789",
    "title": "数学基础能力测试",
    "type": "adaptive",
    "questionCount": 30,
    "estimatedTime": 3600,
    "createdAt": "2024-01-15T10:30:00Z",
    "status": "draft"
  }
}
```

### 3.2 智能组卷

**接口地址**: `POST /papers/generate`

**请求参数**:
```json
{
  "subject": "数学",
  "topics": ["代数", "几何", "概率"],
  "difficulty": {
    "min": 2,
    "max": 4,
    "distribution": "normal"
  },
  "questionCount": 30,
  "timeLimit": 3600,
  "constraints": {
    "topicDistribution": {
      "代数": 0.4,
      "几何": 0.4,
      "概率": 0.2
    },
    "typeDistribution": {
      "multiple_choice": 0.6,
      "short_answer": 0.3,
      "essay": 0.1
    }
  },
  "optimization": {
    "targetReliability": 0.85,
    "balanceDifficulty": true,
    "avoidSimilar": true
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "paperId": "p_987654321",
    "title": "智能生成试卷 - 数学",
    "questions": [
      {
        "questionId": "q_123456789",
        "order": 1,
        "weight": 1.0,
        "estimatedTime": 120
      }
    ],
    "statistics": {
      "totalQuestions": 30,
      "averageDifficulty": 3.2,
      "estimatedReliability": 0.87,
      "topicCoverage": {
        "代数": 12,
        "几何": 12,
        "概率": 6
      }
    }
  }
}
```

## 4. 评估会话接口

### 4.1 开始评估

**接口地址**: `POST /sessions`

**请求参数**:
```json
{
  "paperId": "p_123456789",
  "userId": "u_123456789",
  "config": {
    "allowPause": true,
    "enableProctoring": true,
    "recordBehavior": true,
    "antiCheating": {
      "detectTabSwitch": true,
      "detectCopyPaste": true,
      "requireFullscreen": true,
      "enableWebcam": false
    }
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 201,
  "data": {
    "sessionId": "s_123456789",
    "paperId": "p_123456789",
    "userId": "u_123456789",
    "status": "active",
    "startTime": "2024-01-15T10:30:00Z",
    "timeLimit": 3600,
    "currentQuestion": {
      "questionId": "q_123456789",
      "order": 1,
      "totalQuestions": 30
    },
    "proctoring": {
      "enabled": true,
      "requirements": ["fullscreen", "no_tab_switch"]
    }
  }
}
```

### 4.2 获取下一题

**接口地址**: `GET /sessions/{sessionId}/next-question`

**路径参数**:
- `sessionId`: 会话ID

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "question": {
      "questionId": "q_987654321",
      "type": "multiple_choice",
      "content": {
        "question": "下列哪个是质数？",
        "options": [
          {"id": "A", "text": "4"},
          {"id": "B", "text": "6"},
          {"id": "C", "text": "7"},
          {"id": "D", "text": "8"}
        ]
      },
      "estimatedTime": 90
    },
    "progress": {
      "current": 2,
      "total": 30,
      "percentage": 6.67
    },
    "timeRemaining": 3480,
    "adaptive": {
      "currentAbility": 0.2,
      "standardError": 0.8,
      "nextDifficulty": 0.3
    }
  }
}
```

### 4.3 提交答案

**接口地址**: `POST /sessions/{sessionId}/answers`

**请求参数**:
```json
{
  "questionId": "q_123456789",
  "answer": "B",
  "timeSpent": 95,
  "confidence": 0.8,
  "behavior": {
    "mouseClicks": 5,
    "keystrokes": 12,
    "focusLost": 0,
    "scrollEvents": 3
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "answerId": "a_123456789",
    "questionId": "q_123456789",
    "isCorrect": true,
    "score": 1.0,
    "feedback": {
      "immediate": "回答正确！",
      "explanation": "2x + 3 = 7，移项得到 2x = 4，所以 x = 2"
    },
    "adaptive": {
      "abilityEstimate": 0.35,
      "standardError": 0.65,
      "nextDifficulty": 0.4
    },
    "nextAction": "continue"
  }
}
```

### 4.4 暂停评估

**接口地址**: `POST /sessions/{sessionId}/pause`

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "评估已暂停",
  "data": {
    "sessionId": "s_123456789",
    "status": "paused",
    "pausedAt": "2024-01-15T11:00:00Z",
    "timeRemaining": 3000,
    "canResume": true,
    "maxPauseDuration": 600
  }
}
```

### 4.5 恢复评估

**接口地址**: `POST /sessions/{sessionId}/resume`

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "评估已恢复",
  "data": {
    "sessionId": "s_123456789",
    "status": "active",
    "resumedAt": "2024-01-15T11:05:00Z",
    "timeRemaining": 2700,
    "currentQuestion": {
      "questionId": "q_987654321",
      "order": 5
    }
  }
}
```

### 4.6 完成评估

**接口地址**: `POST /sessions/{sessionId}/complete`

**请求参数**:
```json
{
  "reason": "finished",
  "feedback": {
    "difficulty": 4,
    "clarity": 5,
    "fairness": 5,
    "comments": "题目设计合理，难度适中"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "sessionId": "s_123456789",
    "status": "completed",
    "completedAt": "2024-01-15T11:30:00Z",
    "duration": 3600,
    "summary": {
      "totalQuestions": 25,
      "correctAnswers": 20,
      "accuracy": 0.8,
      "averageTime": 144,
      "finalAbility": 0.65,
      "standardError": 0.25
    },
    "resultId": "r_123456789"
  }
}
```

## 5. 结果分析接口

### 5.1 获取评估结果

**接口地址**: `GET /results/{resultId}`

**路径参数**:
- `resultId`: 结果ID

**查询参数**:
- `includeDetails`: 是否包含详细分析 (boolean, 默认false)
- `includeRecommendations`: 是否包含学习建议 (boolean, 默认false)

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "resultId": "r_123456789",
    "sessionId": "s_123456789",
    "userId": "u_123456789",
    "paperId": "p_123456789",
    "completedAt": "2024-01-15T11:30:00Z",
    "overallScore": {
      "raw": 20,
      "percentage": 80,
      "scaled": 650,
      "grade": "B+",
      "percentile": 75
    },
    "abilityEstimate": {
      "theta": 0.65,
      "standardError": 0.25,
      "confidenceInterval": [0.15, 1.15],
      "reliability": 0.89
    },
    "topicAnalysis": [
      {
        "topic": "代数",
        "score": 0.85,
        "questions": 10,
        "correct": 8,
        "mastery": "proficient"
      },
      {
        "topic": "几何",
        "score": 0.75,
        "questions": 10,
        "correct": 7,
        "mastery": "developing"
      }
    ],
    "timeAnalysis": {
      "totalTime": 3600,
      "averagePerQuestion": 144,
      "efficiency": 0.78,
      "timeManagement": "good"
    },
    "recommendations": [
      {
        "type": "improvement",
        "topic": "几何",
        "priority": "high",
        "description": "建议加强几何基础概念的学习",
        "resources": [
          {
            "type": "course",
            "title": "几何基础课程",
            "url": "/courses/geometry-basics"
          }
        ]
      }
    ]
  }
}
```

### 5.2 生成详细报告

**接口地址**: `POST /results/{resultId}/report`

**请求参数**:
```json
{
  "format": "pdf",
  "language": "zh-CN",
  "sections": [
    "overview",
    "detailed_analysis",
    "recommendations",
    "comparison"
  ],
  "includeCharts": true,
  "includeAnswerSheet": false
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "reportId": "rpt_123456789",
    "format": "pdf",
    "status": "generating",
    "estimatedTime": 30,
    "downloadUrl": null,
    "expiresAt": "2024-01-16T11:30:00Z"
  }
}
```

### 5.3 获取报告状态

**接口地址**: `GET /reports/{reportId}/status`

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "reportId": "rpt_123456789",
    "status": "completed",
    "progress": 100,
    "downloadUrl": "https://cdn.sical.com/reports/rpt_123456789.pdf",
    "fileSize": 2048576,
    "expiresAt": "2024-01-16T11:30:00Z"
  }
}
```

## 6. 统计分析接口

### 6.1 获取用户评估历史

**接口地址**: `GET /users/{userId}/assessments`

**查询参数**:
- `subject`: 学科筛选
- `dateFrom`: 开始日期
- `dateTo`: 结束日期
- `status`: 状态筛选
- `page`: 页码
- `pageSize`: 每页数量

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "items": [
      {
        "sessionId": "s_123456789",
        "paperId": "p_123456789",
        "paperTitle": "数学基础能力测试",
        "subject": "数学",
        "status": "completed",
        "score": 80,
        "duration": 3600,
        "completedAt": "2024-01-15T11:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 15,
      "totalPages": 1
    },
    "statistics": {
      "totalAssessments": 15,
      "averageScore": 78.5,
      "improvementTrend": 0.12,
      "strongestSubject": "数学",
      "weakestSubject": "物理"
    }
  }
}
```

### 6.2 获取能力发展趋势

**接口地址**: `GET /users/{userId}/ability-trend`

**查询参数**:
- `subject`: 学科
- `period`: 时间周期 (week/month/quarter/year)
- `dateFrom`: 开始日期
- `dateTo`: 结束日期

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "userId": "u_123456789",
    "subject": "数学",
    "period": "month",
    "trend": [
      {
        "date": "2024-01-01",
        "ability": 0.45,
        "standardError": 0.35,
        "assessmentCount": 3
      },
      {
        "date": "2024-01-15",
        "ability": 0.65,
        "standardError": 0.25,
        "assessmentCount": 2
      }
    ],
    "analysis": {
      "overallTrend": "improving",
      "improvementRate": 0.44,
      "consistency": 0.78,
      "prediction": {
        "nextMonth": 0.75,
        "confidence": 0.82
      }
    }
  }
}
```

## 7. 防作弊接口

### 7.1 行为监控

**接口地址**: `POST /sessions/{sessionId}/behavior`

**请求参数**:
```json
{
  "events": [
    {
      "type": "tab_switch",
      "timestamp": "2024-01-15T10:35:00Z",
      "data": {
        "fromTab": "assessment",
        "toTab": "unknown",
        "duration": 5000
      }
    },
    {
      "type": "copy_paste",
      "timestamp": "2024-01-15T10:36:00Z",
      "data": {
        "action": "paste",
        "content": "[REDACTED]",
        "source": "external"
      }
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "sessionId": "s_123456789",
    "riskLevel": "medium",
    "violations": [
      {
        "type": "tab_switch",
        "severity": "medium",
        "count": 1,
        "lastOccurrence": "2024-01-15T10:35:00Z"
      }
    ],
    "actions": [
      {
        "type": "warning",
        "message": "检测到切换标签页，请保持专注"
      }
    ]
  }
}
```

### 7.2 获取作弊检测报告

**接口地址**: `GET /sessions/{sessionId}/cheating-report`

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "sessionId": "s_123456789",
    "overallRisk": "low",
    "riskScore": 0.25,
    "violations": [
      {
        "type": "unusual_timing",
        "description": "答题时间异常短",
        "severity": "low",
        "evidence": {
          "averageTime": 15,
          "expectedTime": 120,
          "questionIds": ["q_123", "q_456"]
        }
      }
    ],
    "behaviorAnalysis": {
      "mouseMovement": "normal",
      "keystrokePattern": "consistent",
      "focusPattern": "stable",
      "timingPattern": "slightly_fast"
    },
    "recommendation": "结果可信度较高，建议接受"
  }
}
```

## 8. 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式和必填字段 |
| 401 | 未授权访问 | 检查JWT Token是否有效 |
| 403 | 权限不足 | 确认用户权限 |
| 404 | 资源不存在 | 检查资源ID是否正确 |
| 409 | 资源冲突 | 检查是否重复操作 |
| 422 | 业务逻辑错误 | 检查业务规则 |
| 429 | 请求频率超限 | 降低请求频率 |
| 500 | 服务器内部错误 | 联系技术支持 |
| 503 | 服务不可用 | 稍后重试 |

## 9. 限流策略

### 9.1 API限流规则

| 接口类型 | 限制 | 时间窗口 |
|----------|------|----------|
| 题目查询 | 100次/分钟 | 1分钟 |
| 答案提交 | 1次/秒 | 1秒 |
| 报告生成 | 5次/小时 | 1小时 |
| 文件下载 | 20次/分钟 | 1分钟 |

### 9.2 限流响应

```json
{
  "success": false,
  "code": 429,
  "message": "请求频率超限",
  "data": {
    "limit": 100,
    "remaining": 0,
    "resetTime": "2024-01-15T10:31:00Z",
    "retryAfter": 60
  }
}
```

## 10. 安全说明

### 10.1 数据加密
- 传输加密：使用TLS 1.3
- 存储加密：敏感数据AES-256加密
- 密钥管理：使用HSM硬件安全模块

### 10.2 访问控制
- JWT Token认证
- 基于角色的权限控制(RBAC)
- API密钥管理
- IP白名单限制

### 10.3 审计日志
- 所有API调用记录
- 敏感操作审计
- 异常行为监控
- 合规性报告

## 11. SDK与工具

### 11.1 官方SDK

```javascript
// JavaScript SDK
import { AssessmentAPI } from '@sical/assessment-sdk';

const api = new AssessmentAPI({
  baseURL: 'https://api.sical.com/v1/assessment',
  apiKey: 'your-api-key',
  timeout: 30000
});

// 开始评估
const session = await api.sessions.create({
  paperId: 'p_123456789',
  userId: 'u_123456789'
});

// 提交答案
const result = await api.sessions.submitAnswer(session.sessionId, {
  questionId: 'q_123456789',
  answer: 'B'
});
```

### 11.2 Postman集合

提供完整的Postman API集合，包含所有接口的示例请求。

下载地址：`https://api.sical.com/docs/postman-collection.json`

## 12. 更新日志

### v1.2.0 (2024-01-15)
- 新增适应性测试支持
- 优化AI评分算法
- 增强防作弊检测
- 改进报告生成功能

### v1.1.0 (2024-01-01)
- 新增智能组卷功能
- 支持多种题型
- 优化性能监控
- 增加批量操作接口

### v1.0.0 (2023-12-01)
- 初始版本发布
- 基础评估功能
- 题库管理
- 结果分析

---

**联系我们**
- 技术支持：tech-support@sical.com
- API文档：https://docs.sical.com/assessment
- 开发者社区：https://community.sical.com