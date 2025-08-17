# 评估系统数据库设计文档

## 1. 数据库架构概览

### 1.1 技术选型

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据库架构                                │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB (主数据库)     │  Redis (缓存)      │  Neo4j (知识图谱)  │
│  - 题库数据             │  - 会话缓存        │  - 知识点关系      │
│  - 试卷数据             │  - 用户状态        │  - 学习路径        │
│  - 评估会话             │  - 实时数据        │  - 能力模型        │
│  - 用户答案             │  - 计算结果        │                    │
│  - 评估结果             │                    │                    │
├─────────────────────────────────────────────────────────────────┤
│  Elasticsearch (搜索)   │  InfluxDB (时序)   │  MinIO (文件存储)  │
│  - 题目搜索             │  - 性能监控        │  - 图片资源        │
│  - 全文检索             │  - 行为数据        │  - 音频视频        │
│  - 智能推荐             │  - 统计分析        │  - 报告文件        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 数据分布策略

```javascript
const dataDistribution = {
  // 主数据库 - MongoDB
  primary: {
    database: 'sical_assessment',
    collections: {
      questions: 'questions',           // 题目数据
      papers: 'papers',                 // 试卷数据
      sessions: 'assessment_sessions',  // 评估会话
      answers: 'user_answers',          // 用户答案
      results: 'assessment_results',    // 评估结果
      analytics: 'question_analytics'   // 题目统计
    },
    sharding: {
      strategy: 'hash',
      shardKey: 'userId',
      chunks: 4
    }
  },
  
  // 缓存数据库 - Redis
  cache: {
    clusters: [
      {
        name: 'session-cache',
        purpose: '会话数据缓存',
        ttl: 7200,
        maxMemory: '4GB'
      },
      {
        name: 'question-cache',
        purpose: '题目数据缓存',
        ttl: 3600,
        maxMemory: '2GB'
      }
    ]
  },
  
  // 搜索引擎 - Elasticsearch
  search: {
    indices: {
      questions: 'assessment_questions',
      analytics: 'assessment_analytics'
    },
    replicas: 2,
    shards: 3
  }
};
```

### 1.3 数据一致性策略

```javascript
const consistencyStrategy = {
  // 强一致性
  strongConsistency: [
    'user_answers',      // 用户答案
    'assessment_results', // 评估结果
    'assessment_sessions' // 评估会话
  ],
  
  // 最终一致性
  eventualConsistency: [
    'question_analytics', // 题目统计
    'user_profiles',     // 用户画像
    'learning_paths'     // 学习路径
  ],
  
  // 缓存一致性
  cacheConsistency: {
    strategy: 'write-through',
    invalidation: 'event-driven',
    ttl: {
      questions: 3600,
      sessions: 1800,
      results: 86400
    }
  }
};
```

## 2. MongoDB 集合设计

### 2.1 题目集合 (questions)

```javascript
// 集合：questions
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  questionId: "q_123456789",
  type: "multiple_choice", // multiple_choice, short_answer, essay, coding
  subject: "数学",
  topic: "代数",
  subtopic: "一元一次方程",
  difficulty: 3, // 1-5级难度
  
  // 题目内容
  content: {
    question: "求解方程 2x + 3 = 7",
    options: [
      { id: "A", text: "x = 1", isCorrect: false },
      { id: "B", text: "x = 2", isCorrect: true },
      { id: "C", text: "x = 3", isCorrect: false },
      { id: "D", text: "x = 4", isCorrect: false }
    ],
    correctAnswer: "B",
    explanation: "移项得到 2x = 4，所以 x = 2",
    hints: [
      "先将常数项移到等号右边",
      "然后将x的系数化为1"
    ]
  },
  
  // 媒体资源
  media: {
    images: [
      {
        url: "https://cdn.sical.com/images/q_123456789_1.png",
        alt: "方程图示",
        position: "question"
      }
    ],
    audio: null,
    video: null
  },
  
  // IRT参数
  irtParameters: {
    discrimination: 1.2,  // 区分度
    difficulty: 0.5,      // 难度参数
    guessing: 0.25,       // 猜测参数
    slipping: 0.05        // 失误参数
  },
  
  // 认知模型
  cognitiveModel: {
    knowledgePoints: ["kp_001", "kp_002"],
    skills: ["algebraic_manipulation", "equation_solving"],
    prerequisites: ["kp_basic_algebra"],
    bloomsLevel: "application"
  },
  
  // 元数据
  metadata: {
    tags: ["基础代数", "一元一次方程"],
    estimatedTime: 120, // 秒
    language: "zh-CN",
    version: "1.0",
    author: "teacher_001",
    reviewer: "expert_001",
    source: "textbook_chapter_3"
  },
  
  // 质量控制
  quality: {
    status: "approved", // draft, review, approved, deprecated
    reviewScore: 4.5,
    reviewComments: "题目设计合理，难度适中",
    lastReviewed: ISODate("2024-01-15T10:30:00Z")
  },
  
  // 统计数据
  statistics: {
    totalAttempts: 1250,
    correctAttempts: 975,
    averageTime: 95,
    difficultyIndex: 0.78,
    discriminationIndex: 0.45,
    lastUpdated: ISODate("2024-01-15T12:00:00Z")
  },
  
  // 时间戳
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
  createdBy: "teacher_001",
  updatedBy: "admin_001"
}
```

**索引设计**:
```javascript
// 复合索引
db.questions.createIndex({ "subject": 1, "topic": 1, "difficulty": 1 });
db.questions.createIndex({ "type": 1, "quality.status": 1 });
db.questions.createIndex({ "cognitiveModel.knowledgePoints": 1 });
db.questions.createIndex({ "metadata.tags": 1 });

// 文本索引
db.questions.createIndex({
  "content.question": "text",
  "content.explanation": "text",
  "metadata.tags": "text"
});

// 地理空间索引（如果有地理相关题目）
db.questions.createIndex({ "metadata.location": "2dsphere" });
```

### 2.2 试卷集合 (papers)

```javascript
// 集合：papers
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  paperId: "p_123456789",
  title: "数学基础能力测试",
  description: "测试学生的基础数学能力",
  type: "adaptive", // fixed, adaptive, diagnostic
  subject: "数学",
  
  // 试卷配置
  config: {
    timeLimit: 3600, // 秒
    questionCount: 30,
    passingScore: 60,
    maxAttempts: 3,
    allowReview: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    showProgress: true,
    showTimer: true,
    allowPause: true,
    autoSubmit: true
  },
  
  // 题目配置
  questions: [
    {
      questionId: "q_123456789",
      order: 1,
      weight: 1.0,
      required: true,
      timeLimit: 120,
      points: 1
    }
  ],
  
  // 适应性测试配置
  adaptiveConfig: {
    enabled: true,
    algorithm: "CAT", // CAT, MST
    initialDifficulty: 0.0,
    terminationCriteria: {
      maxQuestions: 30,
      minQuestions: 10,
      targetSE: 0.3,
      maxTime: 3600
    },
    itemSelection: {
      method: "maximum_information",
      exposure: {
        control: true,
        maxRate: 0.3
      },
      contentBalancing: {
        enabled: true,
        constraints: {
          "代数": { min: 0.3, max: 0.5 },
          "几何": { min: 0.2, max: 0.4 },
          "概率": { min: 0.1, max: 0.3 }
        }
      }
    }
  },
  
  // 评分配置
  scoring: {
    method: "IRT", // classical, IRT, rubric
    scale: {
      min: 0,
      max: 100,
      passingScore: 60
    },
    weights: {
      "代数": 0.4,
      "几何": 0.4,
      "概率": 0.2
    },
    penalties: {
      wrongAnswer: 0,
      noAnswer: 0,
      timeOverrun: 0.1
    }
  },
  
  // 防作弊配置
  antiCheating: {
    enabled: true,
    proctoring: {
      requireFullscreen: true,
      detectTabSwitch: true,
      detectCopyPaste: true,
      enableWebcam: false,
      enableMicrophone: false
    },
    behaviorMonitoring: {
      trackMouse: true,
      trackKeyboard: true,
      trackFocus: true,
      trackTiming: true
    },
    restrictions: {
      allowCalculator: false,
      allowNotes: false,
      allowInternet: false
    }
  },
  
  // 目标群体
  targetAudience: {
    gradeLevel: ["grade_9", "grade_10"],
    abilityRange: { min: -2.0, max: 2.0 },
    prerequisites: ["basic_arithmetic"],
    estimatedDuration: 3600
  },
  
  // 质量控制
  quality: {
    status: "published", // draft, review, published, archived
    version: "1.2",
    reliability: 0.89,
    validity: {
      content: 0.92,
      construct: 0.88,
      criterion: 0.85
    },
    pilotResults: {
      sampleSize: 500,
      averageScore: 72.5,
      standardDeviation: 15.2,
      cronbachAlpha: 0.89
    }
  },
  
  // 使用统计
  usage: {
    totalAttempts: 5000,
    completionRate: 0.92,
    averageScore: 74.2,
    averageTime: 3200,
    lastUsed: ISODate("2024-01-15T14:30:00Z")
  },
  
  // 时间戳
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
  publishedAt: ISODate("2024-01-05T09:00:00Z"),
  createdBy: "teacher_001",
  updatedBy: "admin_001"
}
```

**索引设计**:
```javascript
db.papers.createIndex({ "subject": 1, "type": 1, "quality.status": 1 });
db.papers.createIndex({ "targetAudience.gradeLevel": 1 });
db.papers.createIndex({ "createdBy": 1, "createdAt": -1 });
db.papers.createIndex({ "title": "text", "description": "text" });
```

### 2.3 评估会话集合 (assessment_sessions)

```javascript
// 集合：assessment_sessions
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  sessionId: "s_123456789",
  userId: "u_123456789",
  paperId: "p_123456789",
  
  // 会话状态
  status: "active", // pending, active, paused, completed, terminated
  startTime: ISODate("2024-01-15T10:00:00Z"),
  endTime: null,
  lastActivity: ISODate("2024-01-15T10:30:00Z"),
  
  // 时间管理
  timing: {
    timeLimit: 3600,
    timeSpent: 1800,
    timeRemaining: 1800,
    pausedDuration: 0,
    pauseCount: 0,
    lastPause: null,
    extensions: []
  },
  
  // 进度跟踪
  progress: {
    currentQuestion: 15,
    totalQuestions: 30,
    completedQuestions: 14,
    skippedQuestions: 0,
    flaggedQuestions: [3, 7, 12],
    reviewQueue: []
  },
  
  // 适应性测试状态
  adaptiveState: {
    currentAbility: 0.35,
    standardError: 0.65,
    informationGained: 2.4,
    nextDifficulty: 0.4,
    terminationCriteria: {
      seReached: false,
      maxQuestionsReached: false,
      timeExpired: false
    },
    itemExposure: {
      "q_123": 1,
      "q_456": 1
    }
  },
  
  // 环境信息
  environment: {
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    screenResolution: "1920x1080",
    timezone: "Asia/Shanghai",
    language: "zh-CN",
    device: {
      type: "desktop",
      os: "Windows 10",
      browser: "Chrome 120.0"
    }
  },
  
  // 防作弊监控
  proctoring: {
    enabled: true,
    violations: [
      {
        type: "tab_switch",
        timestamp: ISODate("2024-01-15T10:15:00Z"),
        severity: "medium",
        data: {
          duration: 5000,
          destination: "unknown"
        }
      }
    ],
    riskScore: 0.25,
    flags: ["unusual_timing"],
    webcamEnabled: false,
    microphoneEnabled: false
  },
  
  // 行为数据
  behavior: {
    mouseEvents: 1250,
    keyboardEvents: 450,
    focusLost: 2,
    scrollEvents: 89,
    clickPattern: "normal",
    typingPattern: "consistent",
    navigationPattern: "sequential"
  },
  
  // 配置快照
  configSnapshot: {
    paperConfig: {}, // 试卷配置的快照
    userPreferences: {
      fontSize: "medium",
      theme: "light",
      language: "zh-CN"
    }
  },
  
  // 时间戳
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

**索引设计**:
```javascript
db.assessment_sessions.createIndex({ "userId": 1, "status": 1, "startTime": -1 });
db.assessment_sessions.createIndex({ "paperId": 1, "status": 1 });
db.assessment_sessions.createIndex({ "sessionId": 1 }, { unique: true });
db.assessment_sessions.createIndex({ "lastActivity": 1 }); // 用于清理过期会话
```

### 2.4 用户答案集合 (user_answers)

```javascript
// 集合：user_answers
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  answerId: "a_123456789",
  sessionId: "s_123456789",
  userId: "u_123456789",
  questionId: "q_123456789",
  
  // 答案内容
  answer: {
    type: "multiple_choice",
    value: "B",
    confidence: 0.8, // 用户自评信心度
    reasoning: "通过移项计算得出", // 可选的解题思路
    workingSteps: [ // 解题步骤（适用于数学题）
      "2x + 3 = 7",
      "2x = 7 - 3",
      "2x = 4",
      "x = 2"
    ]
  },
  
  // 评分结果
  scoring: {
    isCorrect: true,
    rawScore: 1.0,
    scaledScore: 1.0,
    partialCredit: null,
    rubricScores: null, // 主观题评分细则
    aiScore: {
      confidence: 0.95,
      reasoning: "答案完全正确",
      needsHumanReview: false
    }
  },
  
  // 时间分析
  timing: {
    startTime: ISODate("2024-01-15T10:05:00Z"),
    submitTime: ISODate("2024-01-15T10:06:35Z"),
    timeSpent: 95, // 秒
    thinkingTime: 75, // 实际思考时间
    idleTime: 20, // 空闲时间
    revisitCount: 1,
    revisitTime: 15
  },
  
  // 行为分析
  behavior: {
    mouseClicks: 5,
    keystrokes: 12,
    focusLost: 0,
    scrollEvents: 2,
    optionChanges: 1, // 选择题改选次数
    textRevisions: 0, // 文本题修改次数
    pattern: "confident" // confident, hesitant, random
  },
  
  // IRT分析
  irtAnalysis: {
    abilityBefore: 0.25,
    abilityAfter: 0.35,
    informationGained: 0.8,
    likelihood: 0.75,
    expectedScore: 0.72,
    surprise: 0.03 // 意外程度
  },
  
  // 学习分析
  learningAnalytics: {
    knowledgeState: {
      "kp_001": 0.8, // 知识点掌握度
      "kp_002": 0.6
    },
    skillDemonstrated: ["algebraic_manipulation"],
    misconceptions: [],
    learningGain: 0.1
  },
  
  // 反馈信息
  feedback: {
    immediate: "回答正确！",
    detailed: "你正确地应用了代数运算规则",
    hints: [],
    nextSteps: ["尝试更复杂的方程"],
    resources: [
      {
        type: "video",
        title: "代数基础",
        url: "/resources/algebra-basics"
      }
    ]
  },
  
  // 版本控制
  version: 1,
  revisions: [], // 答案修改历史
  
  // 时间戳
  createdAt: ISODate("2024-01-15T10:06:35Z"),
  updatedAt: ISODate("2024-01-15T10:06:35Z")
}
```

**索引设计**:
```javascript
db.user_answers.createIndex({ "sessionId": 1, "questionId": 1 });
db.user_answers.createIndex({ "userId": 1, "createdAt": -1 });
db.user_answers.createIndex({ "questionId": 1, "scoring.isCorrect": 1 });
db.user_answers.createIndex({ "answerId": 1 }, { unique: true });
```

### 2.5 评估结果集合 (assessment_results)

```javascript
// 集合：assessment_results
{
  _id: ObjectId("507f1f77bcf86cd799439015"),
  resultId: "r_123456789",
  sessionId: "s_123456789",
  userId: "u_123456789",
  paperId: "p_123456789",
  
  // 基本信息
  completedAt: ISODate("2024-01-15T11:30:00Z"),
  duration: 3600, // 总用时（秒）
  status: "completed", // completed, partial, terminated
  
  // 总体得分
  overallScore: {
    raw: 20, // 原始分数
    percentage: 80, // 百分比
    scaled: 650, // 标准分
    grade: "B+", // 等级
    percentile: 75, // 百分位
    zScore: 0.67 // 标准分数
  },
  
  // IRT能力估计
  abilityEstimate: {
    theta: 0.65, // 能力参数
    standardError: 0.25, // 标准误
    confidenceInterval: [0.15, 1.15], // 95%置信区间
    reliability: 0.89, // 信度
    measurement: {
      precision: "high",
      stability: 0.92
    }
  },
  
  // 主题分析
  topicAnalysis: [
    {
      topic: "代数",
      questions: 10,
      correct: 8,
      score: 0.8,
      ability: 0.75,
      mastery: "proficient", // novice, developing, proficient, advanced
      improvement: 0.15,
      recommendations: [
        "继续练习复杂方程",
        "学习二次方程"
      ]
    },
    {
      topic: "几何",
      questions: 10,
      correct: 7,
      score: 0.7,
      ability: 0.55,
      mastery: "developing",
      improvement: 0.05,
      recommendations: [
        "加强基础几何概念",
        "多做图形题练习"
      ]
    }
  ],
  
  // 技能分析
  skillAnalysis: [
    {
      skill: "problem_solving",
      level: 0.72,
      evidence: ["q_123", "q_456"],
      growth: 0.12
    },
    {
      skill: "mathematical_reasoning",
      level: 0.68,
      evidence: ["q_789"],
      growth: 0.08
    }
  ],
  
  // 时间分析
  timeAnalysis: {
    totalTime: 3600,
    effectiveTime: 3200, // 有效答题时间
    averagePerQuestion: 144,
    timeDistribution: {
      "easy": 85,
      "medium": 120,
      "hard": 180
    },
    efficiency: 0.78, // 时间效率
    timeManagement: "good", // poor, fair, good, excellent
    pacing: {
      consistent: true,
      rushingDetected: false,
      slowdownDetected: false
    }
  },
  
  // 行为分析
  behaviorAnalysis: {
    engagement: 0.85,
    persistence: 0.78,
    confidence: 0.72,
    patterns: {
      answerChanging: "minimal",
      reviewBehavior: "thorough",
      navigationStyle: "sequential"
    },
    anomalies: [],
    riskFactors: []
  },
  
  // 学习诊断
  learningDiagnosis: {
    strengths: [
      "代数运算能力强",
      "逻辑推理清晰"
    ],
    weaknesses: [
      "几何空间想象力待提高",
      "复杂问题分解能力不足"
    ],
    misconceptions: [
      {
        concept: "负数运算",
        evidence: ["q_234"],
        severity: "minor"
      }
    ],
    learningStyle: "visual", // visual, auditory, kinesthetic
    readiness: {
      "advanced_algebra": 0.8,
      "trigonometry": 0.4
    }
  },
  
  // 个性化建议
  recommendations: [
    {
      type: "improvement",
      priority: "high",
      topic: "几何",
      description: "建议加强几何基础概念的学习",
      resources: [
        {
          type: "course",
          title: "几何基础课程",
          url: "/courses/geometry-basics",
          estimatedTime: 1200
        },
        {
          type: "practice",
          title: "几何练习题集",
          url: "/practice/geometry",
          difficulty: "medium"
        }
      ],
      timeline: "2-3周"
    },
    {
      type: "enrichment",
      priority: "medium",
      topic: "代数",
      description: "可以尝试更高级的代数内容",
      resources: [
        {
          type: "challenge",
          title: "代数挑战题",
          url: "/challenges/algebra-advanced"
        }
      ]
    }
  ],
  
  // 比较分析
  comparison: {
    peerGroup: {
      averageScore: 72.5,
      percentile: 75,
      ranking: 125, // 在500人中的排名
      totalParticipants: 500
    },
    historical: {
      previousAttempts: [
        {
          date: ISODate("2024-01-01T00:00:00Z"),
          score: 70,
          improvement: 10
        }
      ],
      trend: "improving",
      growthRate: 0.14
    },
    normative: {
      gradeLevel: "grade_9",
      expectedScore: 75,
      performance: "above_average"
    }
  },
  
  // 质量指标
  quality: {
    dataQuality: 0.95,
    responseValidity: 0.92,
    engagementLevel: 0.88,
    effortLevel: 0.85,
    cheatingRisk: 0.05
  },
  
  // 报告生成
  reports: [
    {
      type: "student",
      format: "pdf",
      url: "https://cdn.sical.com/reports/r_123456789_student.pdf",
      generatedAt: ISODate("2024-01-15T11:35:00Z")
    },
    {
      type: "teacher",
      format: "pdf",
      url: "https://cdn.sical.com/reports/r_123456789_teacher.pdf",
      generatedAt: ISODate("2024-01-15T11:35:00Z")
    }
  ],
  
  // 时间戳
  createdAt: ISODate("2024-01-15T11:30:00Z"),
  updatedAt: ISODate("2024-01-15T11:35:00Z")
}
```

**索引设计**:
```javascript
db.assessment_results.createIndex({ "userId": 1, "completedAt": -1 });
db.assessment_results.createIndex({ "paperId": 1, "completedAt": -1 });
db.assessment_results.createIndex({ "resultId": 1 }, { unique: true });
db.assessment_results.createIndex({ "overallScore.percentile": 1 });
db.assessment_results.createIndex({ "abilityEstimate.theta": 1 });
```

## 3. Redis 缓存设计

### 3.1 缓存键命名规范

```javascript
const cacheKeys = {
  // 会话缓存
  session: {
    active: 'session:active:{sessionId}',
    state: 'session:state:{sessionId}',
    progress: 'session:progress:{sessionId}',
    behavior: 'session:behavior:{sessionId}'
  },
  
  // 题目缓存
  question: {
    content: 'question:content:{questionId}',
    analytics: 'question:analytics:{questionId}',
    irt: 'question:irt:{questionId}'
  },
  
  // 用户缓存
  user: {
    profile: 'user:profile:{userId}',
    ability: 'user:ability:{userId}:{subject}',
    history: 'user:history:{userId}',
    preferences: 'user:preferences:{userId}'
  },
  
  // 试卷缓存
  paper: {
    config: 'paper:config:{paperId}',
    questions: 'paper:questions:{paperId}',
    statistics: 'paper:statistics:{paperId}'
  },
  
  // 计算缓存
  computation: {
    irt: 'compute:irt:{userId}:{questionId}',
    recommendation: 'compute:recommend:{userId}',
    analytics: 'compute:analytics:{resultId}'
  }
};
```

### 3.2 缓存数据结构

```javascript
// 会话状态缓存
const sessionCache = {
  key: 'session:active:s_123456789',
  ttl: 7200, // 2小时
  data: {
    sessionId: 's_123456789',
    userId: 'u_123456789',
    paperId: 'p_123456789',
    status: 'active',
    currentQuestion: 15,
    timeRemaining: 1800,
    abilityEstimate: 0.35,
    standardError: 0.65
  }
};

// 题目内容缓存
const questionCache = {
  key: 'question:content:q_123456789',
  ttl: 3600, // 1小时
  data: {
    questionId: 'q_123456789',
    type: 'multiple_choice',
    content: {
      question: '求解方程 2x + 3 = 7',
      options: [...]
    },
    irtParameters: {
      discrimination: 1.2,
      difficulty: 0.5
    }
  }
};

// 用户能力缓存
const userAbilityCache = {
  key: 'user:ability:u_123456789:math',
  ttl: 86400, // 24小时
  data: {
    userId: 'u_123456789',
    subject: 'math',
    overallAbility: 0.65,
    topicAbilities: {
      algebra: 0.75,
      geometry: 0.55,
      probability: 0.60
    },
    lastUpdated: '2024-01-15T11:30:00Z'
  }
};
```

### 3.3 缓存策略配置

```javascript
const cacheStrategies = {
  // 写入策略
  writeStrategies: {
    'session:*': 'write-through',
    'question:*': 'write-behind',
    'user:ability:*': 'write-through',
    'compute:*': 'write-around'
  },
  
  // 失效策略
  evictionPolicies: {
    'session:*': 'TTL',
    'question:*': 'LRU',
    'user:*': 'LFU',
    'compute:*': 'TTL'
  },
  
  // 预热策略
  warmupStrategies: {
    questions: {
      enabled: true,
      criteria: 'popular',
      schedule: '0 2 * * *', // 每天凌晨2点
      batchSize: 1000
    },
    userProfiles: {
      enabled: true,
      criteria: 'active_users',
      schedule: '0 1 * * *',
      batchSize: 500
    }
  }
};
```

## 4. Elasticsearch 索引设计

### 4.1 题目搜索索引

```json
{
  "index": "assessment_questions",
  "mappings": {
    "properties": {
      "questionId": {
        "type": "keyword"
      },
      "type": {
        "type": "keyword"
      },
      "subject": {
        "type": "keyword"
      },
      "topic": {
        "type": "keyword"
      },
      "difficulty": {
        "type": "integer"
      },
      "content": {
        "properties": {
          "question": {
            "type": "text",
            "analyzer": "ik_max_word",
            "search_analyzer": "ik_smart"
          },
          "explanation": {
            "type": "text",
            "analyzer": "ik_max_word"
          }
        }
      },
      "tags": {
        "type": "keyword"
      },
      "knowledgePoints": {
        "type": "keyword"
      },
      "skills": {
        "type": "keyword"
      },
      "irtParameters": {
        "properties": {
          "discrimination": {
            "type": "float"
          },
          "difficulty": {
            "type": "float"
          }
        }
      },
      "statistics": {
        "properties": {
          "totalAttempts": {
            "type": "integer"
          },
          "correctRate": {
            "type": "float"
          },
          "averageTime": {
            "type": "integer"
          }
        }
      },
      "quality": {
        "properties": {
          "status": {
            "type": "keyword"
          },
          "reviewScore": {
            "type": "float"
          }
        }
      },
      "createdAt": {
        "type": "date"
      },
      "updatedAt": {
        "type": "date"
      }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "ik_max_word": {
          "type": "ik_max_word"
        },
        "ik_smart": {
          "type": "ik_smart"
        }
      }
    }
  }
}
```

### 4.2 学习分析索引

```json
{
  "index": "learning_analytics",
  "mappings": {
    "properties": {
      "userId": {
        "type": "keyword"
      },
      "sessionId": {
        "type": "keyword"
      },
      "questionId": {
        "type": "keyword"
      },
      "subject": {
        "type": "keyword"
      },
      "topic": {
        "type": "keyword"
      },
      "isCorrect": {
        "type": "boolean"
      },
      "timeSpent": {
        "type": "integer"
      },
      "abilityBefore": {
        "type": "float"
      },
      "abilityAfter": {
        "type": "float"
      },
      "difficulty": {
        "type": "float"
      },
      "timestamp": {
        "type": "date"
      },
      "behavior": {
        "properties": {
          "mouseClicks": {
            "type": "integer"
          },
          "keystrokes": {
            "type": "integer"
          },
          "focusLost": {
            "type": "integer"
          }
        }
      }
    }
  }
}
```

## 5. 数据一致性保证

### 5.1 MongoDB 事务

```javascript
class AssessmentTransaction {
  async submitAnswer(sessionId, questionId, answer) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 1. 更新会话状态
        await AssessmentSession.findOneAndUpdate(
          { sessionId },
          {
            $set: {
              'progress.currentQuestion': questionId,
              'adaptiveState.currentAbility': newAbility,
              lastActivity: new Date()
            }
          },
          { session }
        );
        
        // 2. 保存用户答案
        await UserAnswer.create([{
          sessionId,
          questionId,
          answer,
          scoring: scoringResult,
          timing: timingData
        }], { session });
        
        // 3. 更新题目统计
        await Question.findOneAndUpdate(
          { questionId },
          {
            $inc: {
              'statistics.totalAttempts': 1,
              'statistics.correctAttempts': isCorrect ? 1 : 0
            }
          },
          { session }
        );
      });
      
      // 4. 更新缓存
      await this.updateCache(sessionId, questionId);
      
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
```

### 5.2 缓存失效策略

```javascript
class CacheInvalidation {
  constructor() {
    this.redis = new Redis();
    this.eventBus = new EventEmitter();
  }
  
  // 基于事件的缓存失效
  async invalidateOnEvent(event, data) {
    switch (event) {
      case 'answer_submitted':
        await this.invalidateSessionCache(data.sessionId);
        await this.invalidateUserAbilityCache(data.userId);
        break;
        
      case 'question_updated':
        await this.invalidateQuestionCache(data.questionId);
        await this.invalidateRelatedPapers(data.questionId);
        break;
        
      case 'assessment_completed':
        await this.invalidateSessionCache(data.sessionId);
        await this.updateUserAbilityCache(data.userId);
        break;
    }
  }
  
  // 智能缓存预热
  async warmupCache() {
    // 预热热门题目
    const popularQuestions = await this.getPopularQuestions();
    for (const question of popularQuestions) {
      await this.preloadQuestionCache(question.questionId);
    }
    
    // 预热活跃用户数据
    const activeUsers = await this.getActiveUsers();
    for (const user of activeUsers) {
      await this.preloadUserCache(user.userId);
    }
  }
}
```

### 5.3 数据同步策略

```javascript
class DataSynchronization {
  constructor() {
    this.mongodb = new MongoClient();
    this.elasticsearch = new ElasticsearchClient();
    this.redis = new Redis();
  }
  
  // MongoDB 到 Elasticsearch 同步
  async syncToElasticsearch() {
    const changeStream = this.mongodb.db('sical_assessment')
      .collection('questions')
      .watch([], { fullDocument: 'updateLookup' });
    
    changeStream.on('change', async (change) => {
      try {
        switch (change.operationType) {
          case 'insert':
          case 'update':
            await this.indexQuestion(change.fullDocument);
            break;
          case 'delete':
            await this.deleteFromIndex(change.documentKey._id);
            break;
        }
      } catch (error) {
        console.error('Sync error:', error);
        // 记录失败的同步操作，稍后重试
        await this.recordSyncFailure(change);
      }
    });
  }
  
  // 数据一致性检查
  async checkConsistency() {
    const inconsistencies = [];
    
    // 检查 MongoDB 和 Elasticsearch 的一致性
    const mongoQuestions = await this.mongodb.db('sical_assessment')
      .collection('questions')
      .find({}, { projection: { questionId: 1, updatedAt: 1 } })
      .toArray();
    
    for (const question of mongoQuestions) {
      const esDoc = await this.elasticsearch.get({
        index: 'assessment_questions',
        id: question.questionId
      }).catch(() => null);
      
      if (!esDoc || esDoc._source.updatedAt !== question.updatedAt) {
        inconsistencies.push({
          type: 'elasticsearch_outdated',
          questionId: question.questionId
        });
      }
    }
    
    return inconsistencies;
  }
}
```

## 6. 性能优化策略

### 6.1 MongoDB 查询优化

```javascript
// 查询优化示例
class QueryOptimization {
  // 使用聚合管道优化复杂查询
  async getUserAssessmentSummary(userId, dateRange) {
    return await AssessmentResult.aggregate([
      {
        $match: {
          userId: userId,
          completedAt: {
            $gte: dateRange.start,
            $lte: dateRange.end
          }
        }
      },
      {
        $group: {
          _id: '$paperId',
          count: { $sum: 1 },
          avgScore: { $avg: '$overallScore.percentage' },
          maxScore: { $max: '$overallScore.percentage' },
          lastAttempt: { $max: '$completedAt' }
        }
      },
      {
        $lookup: {
          from: 'papers',
          localField: '_id',
          foreignField: 'paperId',
          as: 'paperInfo'
        }
      },
      {
        $sort: { lastAttempt: -1 }
      }
    ]);
  }
  
  // 使用投影减少数据传输
  async getQuestionList(filters, pagination) {
    return await Question.find(filters)
      .select('questionId type subject topic difficulty createdAt')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(); // 返回普通对象而非 Mongoose 文档
  }
}
```

### 6.2 Elasticsearch 查询优化

```javascript
class SearchOptimization {
  // 优化的题目搜索
  async searchQuestions(query, filters) {
    const searchBody = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query.keyword,
                fields: ['content.question^2', 'content.explanation', 'tags'],
                type: 'best_fields',
                fuzziness: 'AUTO'
              }
            }
          ],
          filter: [
            { term: { 'quality.status': 'approved' } },
            { range: { difficulty: { gte: filters.minDifficulty, lte: filters.maxDifficulty } } }
          ]
        }
      },
      aggs: {
        subjects: {
          terms: { field: 'subject' }
        },
        difficulties: {
          histogram: {
            field: 'difficulty',
            interval: 1
          }
        }
      },
      highlight: {
        fields: {
          'content.question': {},
          'content.explanation': {}
        }
      },
      sort: [
        { _score: { order: 'desc' } },
        { 'statistics.correctRate': { order: 'desc' } }
      ]
    };
    
    return await this.elasticsearch.search({
      index: 'assessment_questions',
      body: searchBody,
      size: query.size || 20,
      from: query.from || 0
    });
  }
}
```

### 6.3 多级缓存架构

```javascript
class MultiLevelCache {
  constructor() {
    this.l1Cache = new LRUCache({ max: 1000 }); // 内存缓存
    this.l2Cache = new Redis(); // Redis 缓存
    this.l3Cache = new MongoDB(); // 数据库
  }
  
  async get(key) {
    // L1: 内存缓存
    let value = this.l1Cache.get(key);
    if (value) {
      return value;
    }
    
    // L2: Redis 缓存
    value = await this.l2Cache.get(key);
    if (value) {
      this.l1Cache.set(key, JSON.parse(value));
      return JSON.parse(value);
    }
    
    // L3: 数据库
    value = await this.loadFromDatabase(key);
    if (value) {
      this.l1Cache.set(key, value);
      await this.l2Cache.setex(key, 3600, JSON.stringify(value));
      return value;
    }
    
    return null;
  }
  
  async set(key, value, ttl = 3600) {
    // 写入所有层级
    this.l1Cache.set(key, value);
    await this.l2Cache.setex(key, ttl, JSON.stringify(value));
    await this.saveToDatabase(key, value);
  }
}
```

## 7. 数据备份与恢复

### 7.1 MongoDB 备份策略

```bash
#!/bin/bash
# MongoDB 备份脚本

BACKUP_DIR="/backup/mongodb"
DATE=$(date +"%Y%m%d_%H%M%S")
DATABASE="sical_assessment"

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 备份数据库
mongodump --host localhost:27017 \
          --db $DATABASE \
          --out $BACKUP_DIR/$DATE

# 压缩备份文件
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# 删除临时目录
rm -rf $BACKUP_DIR/$DATE

# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

# 上传到云存储
aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://sical-backups/mongodb/
```

### 7.2 Elasticsearch 备份策略

```javascript
// Elasticsearch 快照备份
class ElasticsearchBackup {
  constructor() {
    this.client = new ElasticsearchClient();
  }
  
  async createSnapshot() {
    const snapshotName = `snapshot_${Date.now()}`;
    
    try {
      await this.client.snapshot.create({
        repository: 'sical_backup_repo',
        snapshot: snapshotName,
        body: {
          indices: 'assessment_*',
          ignore_unavailable: true,
          include_global_state: false,
          metadata: {
            taken_by: 'automated_backup',
            taken_because: 'scheduled_backup'
          }
        }
      });
      
      console.log(`Snapshot ${snapshotName} created successfully`);
      return snapshotName;
    } catch (error) {
      console.error('Snapshot creation failed:', error);
      throw error;
    }
  }
  
  async restoreSnapshot(snapshotName) {
    try {
      await this.client.snapshot.restore({
        repository: 'sical_backup_repo',
        snapshot: snapshotName,
        body: {
          indices: 'assessment_*',
          ignore_unavailable: true,
          include_global_state: false
        }
      });
      
      console.log(`Snapshot ${snapshotName} restored successfully`);
    } catch (error) {
      console.error('Snapshot restoration failed:', error);
      throw error;
    }
  }
}
```

### 7.3 数据恢复脚本

```javascript
// 数据恢复管理器
class DataRecovery {
  constructor() {
    this.mongodb = new MongoClient();
    this.elasticsearch = new ElasticsearchClient();
    this.redis = new Redis();
  }
  
  async recoverFromBackup(backupDate, options = {}) {
    try {
      console.log(`Starting recovery from backup: ${backupDate}`);
      
      // 1. 停止写入操作
      await this.enableMaintenanceMode();
      
      // 2. 恢复 MongoDB
      if (options.restoreMongoDB !== false) {
        await this.restoreMongoDB(backupDate);
      }
      
      // 3. 恢复 Elasticsearch
      if (options.restoreElasticsearch !== false) {
        await this.restoreElasticsearch(backupDate);
      }
      
      // 4. 清理缓存
      await this.clearAllCaches();
      
      // 5. 重建索引
      await this.rebuildIndices();
      
      // 6. 验证数据一致性
      const isConsistent = await this.verifyDataConsistency();
      if (!isConsistent) {
        throw new Error('Data consistency check failed');
      }
      
      // 7. 恢复正常操作
      await this.disableMaintenanceMode();
      
      console.log('Recovery completed successfully');
    } catch (error) {
      console.error('Recovery failed:', error);
      await this.rollbackRecovery();
      throw error;
    }
  }
}
```

## 8. 监控与维护

### 8.1 MongoDB 监控指标

```javascript
const mongodbMetrics = {
  // 性能指标
  performance: {
    operationsPerSecond: 'db.serverStatus().opcounters',
    queryExecutionTime: 'db.collection.explain().executionStats',
    indexUsage: 'db.collection.aggregate([{$indexStats: {}}])',
    connectionCount: 'db.serverStatus().connections'
  },
  
  // 资源使用
  resources: {
    memoryUsage: 'db.serverStatus().mem',
    diskUsage: 'db.stats()',
    cpuUsage: 'db.hostInfo().system',
    networkIO: 'db.serverStatus().network'
  },
  
  // 复制集状态
  replication: {
    replicaSetStatus: 'rs.status()',
    oplogSize: 'db.oplog.rs.stats()',
    replicationLag: 'rs.printSlaveReplicationInfo()'
  }
};

// 监控脚本
class MongoDBMonitor {
  async collectMetrics() {
    const metrics = {};
    
    // 收集操作统计
    const serverStatus = await this.db.admin().serverStatus();
    metrics.operations = {
      insert: serverStatus.opcounters.insert,
      query: serverStatus.opcounters.query,
      update: serverStatus.opcounters.update,
      delete: serverStatus.opcounters.delete
    };
    
    // 收集性能统计
    metrics.performance = {
      avgQueryTime: await this.getAverageQueryTime(),
      slowQueries: await this.getSlowQueries(),
      indexHitRatio: await this.getIndexHitRatio()
    };
    
    return metrics;
  }
  
  async getAverageQueryTime() {
    const stats = await this.db.runCommand({ dbStats: 1 });
    return stats.avgObjSize;
  }
  
  async getSlowQueries() {
    return await this.db.admin().command({
      currentOp: true,
      "secs_running": { "$gte": 5 }
    });
  }
  
  async getIndexHitRatio() {
    const serverStatus = await this.db.admin().serverStatus();
    const hits = serverStatus.indexCounters.hits;
    const misses = serverStatus.indexCounters.misses;
    return hits / (hits + misses) * 100;
  }
}
```

#### Elasticsearch 监控指标

```yaml
# Elasticsearch 监控配置
elasticsearch_monitoring:
  cluster_health:
    status_check_interval: 30s
    alert_on_yellow: true
    alert_on_red: true
  
  performance_metrics:
    - name: "search_latency"
      threshold: 200ms
      alert: true
    
    - name: "indexing_rate"
      threshold: 1000/s
      alert: false
    
    - name: "memory_usage"
      threshold: 85%
      alert: true
```

#### 定期清理任务

```javascript
// 数据清理脚本
const cleanupTasks = {
  // 清理过期的评估会话
  cleanExpiredSessions: {
    schedule: '0 2 * * *', // 每天凌晨2点
    query: {
      status: 'abandoned',
      updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    collection: 'assessment_sessions'
  },
  
  // 清理旧的用户答案记录
  cleanOldAnswers: {
    schedule: '0 3 * * 0', // 每周日凌晨3点
    query: {
      createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    },
    collection: 'user_answers',
    keepLatest: 100 // 保留最近100条记录
  },
  
  // 清理Redis过期缓存
  cleanRedisCache: {
    schedule: '0 4 * * *', // 每天凌晨4点
    patterns: [
      'assessment:session:expired:*',
      'assessment:temp:*'
    ]
  }
};
```

## 7. 安全考虑

### 7.1 数据加密

#### 字段级加密

```javascript
// 敏感数据加密配置
const encryptionConfig = {
  // 用户答案加密
  userAnswers: {
    fields: ['answer_content', 'user_input'],
    algorithm: 'AES-256-GCM',
    keyRotation: '30d'
  },
  
  // 评估结果加密
  assessmentResults: {
    fields: ['detailed_analysis', 'weakness_analysis'],
    algorithm: 'AES-256-GCM',
    keyRotation: '30d'
  }
};

// 加密实现
class DataEncryption {
  static encrypt(data, field) {
    const config = encryptionConfig[field];
    if (!config) return data;
    
    // 使用当前密钥加密
    return crypto.encrypt(data, getCurrentKey(config.algorithm));
  }
  
  static decrypt(encryptedData, field) {
    const config = encryptionConfig[field];
    if (!config) return encryptedData;
    
    // 尝试所有有效密钥解密
    return crypto.decrypt(encryptedData, getValidKeys(config.algorithm));
  }
}
```

### 7.2 访问控制

#### 数据库访问权限

```javascript
// MongoDB 角色权限配置
const mongoRoles = {
  // 评估服务只读权限
  assessmentReader: {
    role: 'read',
    db: 'sical_assessment',
    collections: ['questions', 'question_banks', 'assessment_templates']
  },
  
  // 评估服务读写权限
  assessmentWriter: {
    role: 'readWrite',
    db: 'sical_assessment',
    collections: ['assessment_sessions', 'user_answers', 'assessment_results']
  },
  
  // 分析服务只读权限
  analyticsReader: {
    role: 'read',
    db: 'sical_assessment',
    collections: ['assessment_results', 'user_answers']
  }
};

// Redis 访问控制
const redisACL = {
  assessmentService: {
    commands: ['+get', '+set', '+del', '+exists', '+expire'],
    keyPatterns: ['assessment:*', 'cache:assessment:*']
  },
  
  analyticsService: {
    commands: ['+get', '+mget'],
    keyPatterns: ['analytics:*', 'cache:analytics:*']
  }
};
```

### 7.3 数据脱敏

```javascript
// 数据脱敏规则
const dataMaskingRules = {
  // 用户信息脱敏
  userInfo: {
    email: (email) => email.replace(/(.{2}).*(@.*)/, '$1***$2'),
    phone: (phone) => phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    name: (name) => name.replace(/(.{1}).*(.{1})/, '$1***$2')
  },
  
  // 答案内容脱敏（用于日志）
  answerContent: {
    text: (text) => text.length > 50 ? text.substring(0, 50) + '...' : text,
    code: (code) => '/* code content masked */'
  }
};
```

## 8. 扩展性设计

### 8.1 MongoDB 分片配置

```javascript
// 分片键策略
const shardingStrategy = {
  // 评估会话按用户ID分片
  assessment_sessions: {
    shardKey: { userId: 1, createdAt: 1 },
    strategy: 'hashed',
    balancer: true
  },
  
  // 用户答案按会话ID分片
  user_answers: {
    shardKey: { sessionId: 1 },
    strategy: 'ranged',
    balancer: true
  },
  
  // 评估结果按用户ID和时间分片
  assessment_results: {
    shardKey: { userId: 1, completedAt: 1 },
    strategy: 'hashed',
    balancer: true
  }
};

// 分片集群配置
const shardClusterConfig = {
  configServers: {
    replicas: 3,
    resources: {
      cpu: '1',
      memory: '2Gi',
      storage: '20Gi'
    }
  },
  
  shards: [
    {
      name: 'shard01',
      replicas: 3,
      resources: {
        cpu: '2',
        memory: '4Gi',
        storage: '100Gi'
      }
    },
    {
      name: 'shard02',
      replicas: 3,
      resources: {
        cpu: '2',
        memory: '4Gi',
        storage: '100Gi'
      }
    }
  ],
  
  mongos: {
    replicas: 2,
    resources: {
      cpu: '1',
      memory: '2Gi'
    }
  }
};
```

### 8.2 读写分离配置

```javascript
// MongoDB 读写分离
const readWriteSeparation = {
  // 写操作连接配置
  writeConnection: {
    hosts: ['mongo-primary-1:27017', 'mongo-primary-2:27017'],
    readPreference: 'primary',
    writeConcern: { w: 'majority', j: true }
  },
  
  // 读操作连接配置
  readConnection: {
    hosts: ['mongo-secondary-1:27017', 'mongo-secondary-2:27017'],
    readPreference: 'secondaryPreferred',
    readConcern: { level: 'majority' }
  },
  
  // 路由规则
  routingRules: {
    // 实时数据读取使用主库
    realTimeReads: {
      collections: ['assessment_sessions'],
      connection: 'writeConnection'
    },
    
    // 分析查询使用从库
    analyticsReads: {
      collections: ['assessment_results', 'user_answers'],
      connection: 'readConnection'
    }
  }
};
```

### 8.3 Elasticsearch 集群扩展

```yaml
# Elasticsearch 集群配置
elasticsearch_cluster:
  master_nodes: 3
  data_nodes: 6
  ingest_nodes: 2
  
  node_configuration:
    master:
      heap_size: "2g"
      cpu: "1"
      memory: "4Gi"
      storage: "20Gi"
    
    data:
      heap_size: "4g"
      cpu: "2"
      memory: "8Gi"
      storage: "200Gi"
    
    ingest:
      heap_size: "2g"
      cpu: "1"
      memory: "4Gi"
      storage: "20Gi"
  
  index_settings:
    number_of_shards: 3
    number_of_replicas: 1
    refresh_interval: "30s"
    
  auto_scaling:
    enabled: true
    min_data_nodes: 3
    max_data_nodes: 12
    scale_up_threshold: 80%
    scale_down_threshold: 30%
```

## 9. 总结

评估系统的数据库设计采用了多数据库架构，充分发挥了各数据库的优势：

### 9.1 架构优势

1. **MongoDB**：作为主数据库，存储结构化的评估数据，支持复杂查询和事务
2. **Redis**：提供高性能缓存，显著提升系统响应速度
3. **Elasticsearch**：支持全文搜索和复杂的数据分析查询
4. **Neo4j**：构建知识图谱，支持智能推荐和关联分析

### 9.2 技术特色

1. **智能分片**：基于业务特征的分片策略，确保数据均匀分布
2. **多级缓存**：L1本地缓存 + L2Redis缓存 + L3数据库，层次化缓存架构
3. **数据一致性**：通过事务、缓存失效和数据同步保证数据一致性
4. **安全防护**：字段级加密、访问控制和数据脱敏的全方位安全保护

### 9.3 性能保障

1. **查询优化**：合理的索引设计和查询优化策略
2. **读写分离**：分离读写操作，提升并发处理能力
3. **自动扩展**：支持水平扩展和自动伸缩
4. **监控告警**：全面的监控指标和自动化运维

这个数据库设计为评估系统提供了高性能、高可用、高安全的数据存储解决方案，能够支撑大规模用户的在线评估需求。