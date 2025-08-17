---
version: "1.0.0"
last_updated: "2024-01-15"
author: "数据库管理员"
reviewers: ["架构师", "后端开发"]
status: "approved"
changelog:
  - version: "1.0.0"
    date: "2024-01-15"
    changes: ["设计MongoDB数据模型", "定义索引策略", "制定性能优化方案"]
---

# 数据库设计文档

## 1. 数据库架构概述

### 1.1 数据库选型
- **主数据库**: MongoDB 6.0+
- **缓存数据库**: Redis 7.0+ (未来)
- **搜索引擎**: Elasticsearch 8.0+ (未来)
- **文件存储**: GridFS / 云存储

### 1.2 设计原则
- **文档导向** - 利用MongoDB的文档特性
- **嵌入优先** - 减少关联查询
- **索引优化** - 提高查询性能
- **数据一致性** - 保证数据完整性
- **可扩展性** - 支持水平扩展

### 1.3 数据库结构
```
SiCal Database
├── users (用户集合)
├── knowledge (知识库集合)
├── categories (分类集合)
├── learning_paths (学习路径集合)
├── assessments (评估集合)
├── questions (题目集合)
├── user_progress (学习进度集合)
├── assessment_results (考试结果集合)
├── comments (评论集合)
├── notifications (通知集合)
└── system_logs (系统日志集合)
```

## 2. 核心数据模型

### 2.1 用户模型 (users)
```javascript
{
  _id: ObjectId,
  username: String, // 用户名，唯一
  email: String, // 邮箱，唯一
  passwordHash: String, // 密码哈希
  profile: {
    firstName: String,
    lastName: String,
    avatar: String, // 头像URL
    profession: String, // 职业
    bio: String, // 个人简介
    location: String, // 地理位置
    dateOfBirth: Date,
    gender: String // 'male' | 'female' | 'other'
  },
  preferences: {
    language: String, // 'zh-CN' | 'en-US'
    timezone: String,
    theme: String, // 'light' | 'dark' | 'auto'
    notifications: {
      email: Boolean,
      push: Boolean,
      sms: Boolean
    },
    privacy: {
      profileVisibility: String, // 'public' | 'private'
      showProgress: Boolean,
      showAchievements: Boolean
    }
  },
  roles: [String], // ['student', 'teacher', 'admin']
  status: String, // 'active' | 'inactive' | 'suspended'
  emailVerified: Boolean,
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  loginCount: Number,
  createdAt: Date,
  updatedAt: Date,
  
  // 学习统计
  stats: {
    totalLearningTime: Number, // 总学习时间（分钟）
    completedCourses: Number, // 完成课程数
    completedAssessments: Number, // 完成评估数
    averageScore: Number, // 平均分数
    streak: Number, // 连续学习天数
    lastActiveDate: Date
  },
  
  // 成就和徽章
  achievements: [{
    type: String,
    name: String,
    description: String,
    earnedAt: Date,
    metadata: Object
  }]
}
```

### 2.2 知识库模型 (knowledge)
```javascript
{
  _id: ObjectId,
  title: String, // 知识标题
  slug: String, // URL友好的标识符
  content: String, // 主要内容（Markdown格式）
  summary: String, // 摘要
  categoryId: ObjectId, // 分类ID
  tags: [String], // 标签数组
  difficulty: String, // 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: Number, // 预估阅读时间（分钟）
  
  // 内容结构
  sections: [{
    id: String,
    title: String,
    content: String,
    order: Number,
    type: String // 'text' | 'image' | 'video' | 'interactive'
  }],
  
  // 多媒体资源
  multimedia: {
    images: [{
      url: String,
      caption: String,
      alt: String,
      size: Number
    }],
    videos: [{
      url: String,
      title: String,
      duration: Number,
      thumbnail: String
    }],
    animations: [{
      url: String,
      title: String,
      type: String // '3d' | '2d' | 'interactive'
    }],
    documents: [{
      url: String,
      title: String,
      type: String, // 'pdf' | 'doc' | 'ppt'
      size: Number
    }]
  },
  
  // 知识关系
  prerequisites: [ObjectId], // 前置知识ID数组
  relatedKnowledge: [ObjectId], // 相关知识ID数组
  nextSteps: [ObjectId], // 后续学习建议
  
  // 元数据
  metadata: {
    author: ObjectId, // 作者ID
    contributors: [ObjectId], // 贡献者ID数组
    reviewers: [ObjectId], // 审核者ID数组
    version: String,
    lastReviewed: Date,
    reviewStatus: String, // 'draft' | 'review' | 'approved' | 'published'
    sources: [{
      title: String,
      url: String,
      type: String // 'book' | 'journal' | 'website' | 'other'
    }]
  },
  
  // 统计信息
  stats: {
    viewCount: Number,
    uniqueViewCount: Number,
    rating: Number, // 平均评分
    ratingCount: Number,
    bookmarkCount: Number,
    shareCount: Number,
    commentCount: Number
  },
  
  // SEO和搜索
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  status: String, // 'draft' | 'published' | 'archived'
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 分类模型 (categories)
```javascript
{
  _id: ObjectId,
  name: String, // 分类名称
  slug: String, // URL友好标识符
  description: String, // 分类描述
  parentId: ObjectId, // 父分类ID，null表示顶级分类
  level: Number, // 分类层级，0表示顶级
  path: String, // 分类路径，如 "/medical/anatomy/cardiovascular"
  order: Number, // 排序权重
  
  // 分类元数据
  metadata: {
    icon: String, // 图标URL或类名
    color: String, // 主题颜色
    image: String, // 分类图片
    keywords: [String] // 关键词
  },
  
  // 统计信息
  stats: {
    knowledgeCount: Number, // 知识条目数量
    subcategoryCount: Number, // 子分类数量
    totalViewCount: Number // 总浏览量
  },
  
  status: String, // 'active' | 'inactive'
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 学习路径模型 (learning_paths)
```javascript
{
  _id: ObjectId,
  title: String, // 路径标题
  slug: String, // URL友好标识符
  description: String, // 路径描述
  objectives: [String], // 学习目标
  prerequisites: [String], // 前置要求
  
  // 路径属性
  category: String, // 分类
  difficulty: String, // 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: Number, // 预估完成时间（小时）
  language: String, // 语言
  
  // 路径结构
  modules: [{
    id: String,
    title: String,
    description: String,
    order: Number,
    estimatedDuration: Number, // 模块预估时间
    
    // 模块内容
    knowledgeItems: [{
      knowledgeId: ObjectId,
      order: Number,
      required: Boolean, // 是否必修
      estimatedTime: Number
    }],
    
    // 模块评估
    assessments: [{
      assessmentId: ObjectId,
      type: String, // 'quiz' | 'exam' | 'project'
      order: Number,
      required: Boolean,
      passingScore: Number
    }],
    
    // 模块完成条件
    completionCriteria: {
      knowledgeCompletion: Number, // 知识完成百分比
      assessmentPassing: Boolean, // 是否需要通过评估
      minimumScore: Number // 最低分数要求
    }
  }],
  
  // 路径元数据
  metadata: {
    author: ObjectId,
    contributors: [ObjectId],
    version: String,
    thumbnail: String,
    tags: [String],
    targetAudience: [String] // 目标受众
  },
  
  // 统计信息
  stats: {
    enrollmentCount: Number, // 注册人数
    completionCount: Number, // 完成人数
    averageRating: Number,
    ratingCount: Number,
    averageCompletionTime: Number // 平均完成时间
  },
  
  status: String, // 'draft' | 'published' | 'archived'
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 用户学习进度模型 (user_progress)
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // 用户ID
  pathId: ObjectId, // 学习路径ID
  
  // 注册信息
  enrolledAt: Date,
  status: String, // 'active' | 'completed' | 'paused' | 'dropped'
  
  // 整体进度
  overallProgress: {
    completionPercentage: Number, // 完成百分比
    completedModules: Number,
    totalModules: Number,
    timeSpent: Number, // 已花费时间（分钟）
    lastAccessedAt: Date,
    estimatedTimeRemaining: Number
  },
  
  // 模块进度
  moduleProgress: [{
    moduleId: String,
    status: String, // 'not_started' | 'in_progress' | 'completed'
    completionPercentage: Number,
    timeSpent: Number,
    startedAt: Date,
    completedAt: Date,
    
    // 知识点进度
    knowledgeProgress: [{
      knowledgeId: ObjectId,
      status: String, // 'not_started' | 'in_progress' | 'completed'
      timeSpent: Number,
      viewCount: Number,
      lastViewedAt: Date,
      bookmarked: Boolean,
      notes: String // 用户笔记
    }],
    
    // 评估成绩
    assessmentScores: [{
      assessmentId: ObjectId,
      attempts: [{
        attemptNumber: Number,
        score: Number,
        percentage: Number,
        passed: Boolean,
        completedAt: Date,
        timeSpent: Number
      }],
      bestScore: Number,
      passed: Boolean
    }]
  }],
  
  // 学习行为分析
  learningBehavior: {
    preferredStudyTime: [String], // 偏好学习时间段
    averageSessionDuration: Number, // 平均学习时长
    studyFrequency: Number, // 学习频率（天/周）
    difficultyPreference: String, // 难度偏好
    learningStyle: String // 学习风格
  },
  
  // 成就和里程碑
  achievements: [{
    type: String,
    name: String,
    earnedAt: Date,
    moduleId: String
  }],
  
  updatedAt: Date
}
```

### 2.6 评估模型 (assessments)
```javascript
{
  _id: ObjectId,
  title: String, // 评估标题
  description: String, // 评估描述
  type: String, // 'quiz' | 'exam' | 'practice' | 'adaptive'
  
  // 评估配置
  config: {
    duration: Number, // 时长（分钟）
    questionCount: Number, // 题目数量
    passingScore: Number, // 及格分数
    maxAttempts: Number, // 最大尝试次数
    shuffleQuestions: Boolean, // 是否打乱题目
    shuffleOptions: Boolean, // 是否打乱选项
    showResults: Boolean, // 是否显示结果
    showCorrectAnswers: Boolean, // 是否显示正确答案
    allowReview: Boolean, // 是否允许回顾
    timeLimit: Number // 单题时间限制
  },
  
  // 题目配置
  questions: [{
    questionId: ObjectId,
    order: Number,
    points: Number, // 分值
    required: Boolean
  }],
  
  // 自适应配置（仅自适应测试）
  adaptiveConfig: {
    algorithm: String, // 'irt' | 'cat' | 'kst'
    startingDifficulty: Number,
    minQuestions: Number,
    maxQuestions: Number,
    precisionTarget: Number,
    stopCriteria: [String]
  },
  
  // 分类和标签
  category: String,
  tags: [String],
  difficulty: String,
  knowledgeAreas: [ObjectId], // 关联知识领域
  
  // 可用性设置
  availability: {
    startDate: Date,
    endDate: Date,
    timezone: String,
    accessControl: String, // 'public' | 'enrolled' | 'invited'
    allowedUsers: [ObjectId] // 允许的用户ID
  },
  
  // 元数据
  metadata: {
    author: ObjectId,
    reviewers: [ObjectId],
    version: String,
    instructions: String, // 考试说明
    materials: [String] // 允许使用的材料
  },
  
  // 统计信息
  stats: {
    attemptCount: Number,
    averageScore: Number,
    passRate: Number,
    averageDuration: Number,
    difficultyIndex: Number, // 难度指数
    discriminationIndex: Number // 区分度
  },
  
  status: String, // 'draft' | 'published' | 'archived'
  createdAt: Date,
  updatedAt: Date
}
```

### 2.7 题目模型 (questions)
```javascript
{
  _id: ObjectId,
  type: String, // 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching'
  
  // 题目内容
  content: {
    question: String, // 题目文本
    instruction: String, // 答题说明
    context: String, // 题目背景
    multimedia: {
      images: [{
        url: String,
        caption: String,
        position: String // 'above' | 'below' | 'inline'
      }],
      videos: [{
        url: String,
        startTime: Number,
        endTime: Number
      }],
      audio: [{
        url: String,
        transcript: String
      }]
    }
  },
  
  // 选项（选择题）
  options: [{
    id: String,
    text: String,
    isCorrect: Boolean,
    explanation: String,
    multimedia: {
      image: String,
      audio: String
    }
  }],
  
  // 正确答案
  correctAnswer: {
    value: String, // 或 [String] 对于多选题
    explanation: String,
    references: [{
      title: String,
      url: String,
      page: String
    }]
  },
  
  // 评分标准（主观题）
  rubric: [{
    criterion: String,
    description: String,
    points: Number,
    levels: [{
      level: String,
      description: String,
      points: Number
    }]
  }],
  
  // 题目属性
  properties: {
    difficulty: Number, // 1-5 难度等级
    discriminationIndex: Number, // 区分度
    points: Number, // 分值
    timeLimit: Number, // 时间限制（秒）
    category: String,
    knowledgePoints: [String], // 知识点
    cognitiveLevel: String, // 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
    tags: [String]
  },
  
  // IRT参数（项目反应理论）
  irtParameters: {
    difficulty: Number, // b参数
    discrimination: Number, // a参数
    guessing: Number // c参数
  },
  
  // 统计信息
  stats: {
    usageCount: Number, // 使用次数
    correctRate: Number, // 正确率
    averageTime: Number, // 平均答题时间
    lastUsed: Date
  },
  
  // 元数据
  metadata: {
    author: ObjectId,
    reviewers: [ObjectId],
    source: String, // 题目来源
    version: String,
    lastReviewed: Date,
    reviewStatus: String // 'draft' | 'review' | 'approved'
  },
  
  status: String, // 'active' | 'inactive' | 'archived'
  createdAt: Date,
  updatedAt: Date
}
```

### 2.8 考试结果模型 (assessment_results)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  assessmentId: ObjectId,
  sessionId: String, // 考试会话ID
  
  // 基本信息
  startedAt: Date,
  completedAt: Date,
  timeSpent: Number, // 总用时（秒）
  
  // 成绩信息
  score: {
    raw: Number, // 原始分数
    percentage: Number, // 百分比
    scaled: Number, // 标准化分数
    grade: String, // 等级 'A' | 'B' | 'C' | 'D' | 'F'
    passed: Boolean
  },
  
  // 答题详情
  responses: [{
    questionId: ObjectId,
    answer: String, // 或 [String] 或 Object
    isCorrect: Boolean,
    points: Number, // 获得分数
    timeSpent: Number, // 答题用时
    attempts: Number, // 尝试次数（如果允许）
    confidence: Number, // 信心度（1-5）
    flagged: Boolean // 是否标记
  }],
  
  // 分析结果
  analysis: {
    // 按分类统计
    byCategory: [{
      category: String,
      totalQuestions: Number,
      correctAnswers: Number,
      percentage: Number
    }],
    
    // 按难度统计
    byDifficulty: [{
      difficulty: String,
      totalQuestions: Number,
      correctAnswers: Number,
      percentage: Number
    }],
    
    // 按认知层次统计
    byCognitiveLevel: [{
      level: String,
      totalQuestions: Number,
      correctAnswers: Number,
      percentage: Number
    }],
    
    // 强项和弱项
    strengths: [String],
    weaknesses: [String],
    
    // 学习建议
    recommendations: [{
      type: String, // 'review' | 'practice' | 'study'
      content: String,
      knowledgeIds: [ObjectId],
      priority: String // 'high' | 'medium' | 'low'
    }]
  },
  
  // 自适应测试结果
  adaptiveResults: {
    abilityEstimate: Number, // 能力估计值
    standardError: Number, // 标准误
    reliability: Number, // 信度
    questionsAdministered: Number,
    stopReason: String // 停止原因
  },
  
  // 作弊检测
  integrityCheck: {
    suspiciousActivity: Boolean,
    flags: [{
      type: String, // 'time_anomaly' | 'pattern_matching' | 'browser_switch'
      description: String,
      severity: String // 'low' | 'medium' | 'high'
    }],
    riskScore: Number // 0-100
  },
  
  // 元数据
  metadata: {
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String
    },
    device: {
      type: String, // 'desktop' | 'tablet' | 'mobile'
      os: String,
      browser: String
    }
  },
  
  status: String, // 'completed' | 'abandoned' | 'invalidated'
  createdAt: Date
}
```

## 3. 索引设计

### 3.1 用户集合索引
```javascript
// 唯一索引
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })

// 查询索引
db.users.createIndex({ "status": 1 })
db.users.createIndex({ "roles": 1 })
db.users.createIndex({ "lastLoginAt": -1 })
db.users.createIndex({ "createdAt": -1 })

// 复合索引
db.users.createIndex({ "status": 1, "lastLoginAt": -1 })
```

### 3.2 知识库集合索引
```javascript
// 基础索引
db.knowledge.createIndex({ "slug": 1 }, { unique: true })
db.knowledge.createIndex({ "categoryId": 1 })
db.knowledge.createIndex({ "status": 1 })
db.knowledge.createIndex({ "difficulty": 1 })

// 搜索索引
db.knowledge.createIndex({ "title": "text", "content": "text", "summary": "text" })
db.knowledge.createIndex({ "tags": 1 })

// 排序索引
db.knowledge.createIndex({ "stats.viewCount": -1 })
db.knowledge.createIndex({ "stats.rating": -1 })
db.knowledge.createIndex({ "publishedAt": -1 })

// 复合索引
db.knowledge.createIndex({ "status": 1, "categoryId": 1, "publishedAt": -1 })
db.knowledge.createIndex({ "categoryId": 1, "difficulty": 1, "stats.rating": -1 })
```

### 3.3 学习进度集合索引
```javascript
// 用户相关索引
db.user_progress.createIndex({ "userId": 1 })
db.user_progress.createIndex({ "pathId": 1 })
db.user_progress.createIndex({ "userId": 1, "pathId": 1 }, { unique: true })

// 状态索引
db.user_progress.createIndex({ "status": 1 })
db.user_progress.createIndex({ "overallProgress.completionPercentage": -1 })

// 时间索引
db.user_progress.createIndex({ "enrolledAt": -1 })
db.user_progress.createIndex({ "overallProgress.lastAccessedAt": -1 })
```

### 3.4 评估结果集合索引
```javascript
// 基础索引
db.assessment_results.createIndex({ "userId": 1 })
db.assessment_results.createIndex({ "assessmentId": 1 })
db.assessment_results.createIndex({ "sessionId": 1 }, { unique: true })

// 成绩索引
db.assessment_results.createIndex({ "score.percentage": -1 })
db.assessment_results.createIndex({ "score.passed": 1 })

// 时间索引
db.assessment_results.createIndex({ "completedAt": -1 })

// 复合索引
db.assessment_results.createIndex({ "userId": 1, "completedAt": -1 })
db.assessment_results.createIndex({ "assessmentId": 1, "score.percentage": -1 })
```

## 4. 数据关系设计

### 4.1 嵌入 vs 引用策略

**嵌入适用场景：**
- 一对一关系（用户profile）
- 一对少量关系（用户preferences）
- 数据不经常独立查询
- 数据大小相对固定

**引用适用场景：**
- 一对多关系（用户-学习进度）
- 多对多关系（知识-标签）
- 数据需要独立查询
- 数据大小可能很大

### 4.2 反范式化策略

```javascript
// 在知识文档中嵌入分类信息
{
  _id: ObjectId,
  title: "心血管系统解剖",
  categoryId: ObjectId("..."),
  categoryInfo: { // 反范式化的分类信息
    name: "解剖学",
    path: "/医学基础/解剖学"
  }
}

// 在学习进度中嵌入路径基本信息
{
  userId: ObjectId,
  pathId: ObjectId,
  pathInfo: { // 反范式化的路径信息
    title: "基础医学入门",
    totalModules: 10
  }
}
```

## 5. 数据一致性保证

### 5.1 事务使用
```javascript
// 用户注册事务
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    // 创建用户
    const user = await User.create([userData], { session });
    
    // 创建用户统计
    await UserStats.create([{
      userId: user[0]._id,
      totalLearningTime: 0,
      completedCourses: 0
    }], { session });
    
    // 发送欢迎邮件
    await sendWelcomeEmail(user[0].email);
  });
} finally {
  await session.endSession();
}
```

### 5.2 数据验证
```javascript
// Schema级别验证
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: '邮箱格式不正确'
    }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  }
});
```

## 6. 性能优化策略

### 6.1 查询优化
```javascript
// 使用投影减少数据传输
db.knowledge.find(
  { categoryId: ObjectId("...") },
  { title: 1, summary: 1, difficulty: 1, "stats.rating": 1 }
);

// 使用聚合管道优化复杂查询
db.user_progress.aggregate([
  { $match: { userId: ObjectId("...") } },
  { $lookup: {
    from: "learning_paths",
    localField: "pathId",
    foreignField: "_id",
    as: "path"
  }},
  { $project: {
    "path.title": 1,
    "overallProgress.completionPercentage": 1,
    status: 1
  }}
]);
```

### 6.2 缓存策略
```javascript
// Redis缓存热点数据
const cacheKey = `knowledge:${knowledgeId}`;
let knowledge = await redis.get(cacheKey);

if (!knowledge) {
  knowledge = await Knowledge.findById(knowledgeId);
  await redis.setex(cacheKey, 3600, JSON.stringify(knowledge));
}
```

### 6.3 分页优化
```javascript
// 使用游标分页替代偏移分页
const pageSize = 20;
const lastId = req.query.lastId;

const query = lastId 
  ? { _id: { $gt: ObjectId(lastId) } }
  : {};

const results = await Knowledge
  .find(query)
  .sort({ _id: 1 })
  .limit(pageSize + 1);

const hasNext = results.length > pageSize;
if (hasNext) results.pop();
```

## 7. 数据备份和恢复

### 7.1 备份策略
```bash
# 每日全量备份
mongodump --host localhost:27017 --db sical --out /backup/$(date +%Y%m%d)

# 增量备份（使用oplog）
mongodump --host localhost:27017 --oplog --out /backup/incremental/$(date +%Y%m%d_%H%M%S)
```

### 7.2 恢复策略
```bash
# 恢复全量备份
mongorestore --host localhost:27017 --db sical /backup/20240101/sical

# 恢复到指定时间点
mongorestore --host localhost:27017 --oplogReplay --oplogLimit 1640995200:1 /backup/incremental/
```

## 8. 监控和维护

### 8.1 性能监控
```javascript
// 慢查询监控
db.setProfilingLevel(1, { slowms: 100 });

// 查看慢查询
db.system.profile.find().sort({ ts: -1 }).limit(5);

// 索引使用统计
db.knowledge.aggregate([
  { $indexStats: {} }
]);
```

### 8.2 数据维护
```javascript
// 定期清理过期数据
db.system_logs.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
});

// 重建索引
db.knowledge.reIndex();

// 数据库统计
db.stats();
```

## 9. 安全措施

### 9.1 访问控制
```javascript
// 创建数据库用户
db.createUser({
  user: "sical_app",
  pwd: "strong_password",
  roles: [
    { role: "readWrite", db: "sical" }
  ]
});

// 启用认证
// mongod --auth
```

### 9.2 数据加密
```javascript
// 敏感字段加密
const crypto = require('crypto');

const encryptSensitiveData = (data) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

## 10. 扩展规划

### 10.1 分片策略
```javascript
// 按用户ID分片
sh.shardCollection("sical.user_progress", { "userId": 1 });

// 按时间分片
sh.shardCollection("sical.assessment_results", { "completedAt": 1 });

// 按地理位置分片
sh.shardCollection("sical.users", { "profile.location": 1 });
```

### 10.2 读写分离
```javascript
// 主从复制配置
const mongoose = require('mongoose');

// 写操作连接主库
const writeDB = mongoose.createConnection('mongodb://primary:27017/sical');

// 读操作连接从库
const readDB = mongoose.createConnection('mongodb://secondary:27017/sical', {
  readPreference: 'secondary'
});
```

## 11. 更新记录

- 2024-01-XX - 初始版本创建
- 2024-01-XX - 添加核心数据模型
- 2024-01-XX - 完善索引设计
- 2024-01-XX - 添加性能优化策略
- 2024-01-XX - 完善安全和扩展规划