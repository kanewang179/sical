# 学习路径功能数据库设计

## 1. 数据库架构概览

### 1.1 技术选型

```
┌─────────────────────────────────────────────────────────────┐
│                    数据库技术栈                              │
├─────────────────────────────────────────────────────────────┤
│  主数据库: MongoDB 6.0+                                     │
│  ├─ 学习路径数据存储                                         │
│  ├─ 用户进度数据                                             │
│  ├─ 用户画像数据                                             │
│  └─ 社交学习数据                                             │
├─────────────────────────────────────────────────────────────┤
│  缓存数据库: Redis 7.0+                                     │
│  ├─ 会话缓存                                                 │
│  ├─ 推荐结果缓存                                             │
│  ├─ 实时进度缓存                                             │
│  └─ 热点数据缓存                                             │
├─────────────────────────────────────────────────────────────┤
│  搜索引擎: Elasticsearch 8.0+                               │
│  ├─ 学习路径搜索                                             │
│  ├─ 内容推荐索引                                             │
│  ├─ 用户行为分析                                             │
│  └─ 学习数据挖掘                                             │
├─────────────────────────────────────────────────────────────┤
│  图数据库: Neo4j 5.0+ (可选)                                │
│  ├─ 知识图谱存储                                             │
│  ├─ 学习路径关系                                             │
│  └─ 用户关系网络                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 数据分布策略

#### 1.2.1 MongoDB分片策略
```javascript
// 学习路径集合分片
sh.shardCollection("sical.learning_paths", { "category": 1, "_id": 1 });

// 用户进度集合分片
sh.shardCollection("sical.user_progress", { "userId": "hashed" });

// 推荐记录集合分片
sh.shardCollection("sical.recommendation_records", { "userId": "hashed" });

// 学习会话集合分片
sh.shardCollection("sical.learning_sessions", { "userId": "hashed" });
```

#### 1.2.2 读写分离配置
```javascript
// 读偏好配置
const readPreference = {
  // 实时数据读取
  realtime: { mode: 'primary' },
  
  // 分析数据读取
  analytics: { mode: 'secondaryPreferred' },
  
  // 推荐数据读取
  recommendation: { mode: 'secondary' },
  
  // 历史数据读取
  historical: { mode: 'secondary' }
};
```

### 1.3 数据一致性策略

#### 1.3.1 事务处理
```javascript
// 学习进度更新事务
async function updateLearningProgress(session, userId, pathId, progressData) {
  await session.withTransaction(async () => {
    // 1. 更新节点进度
    await updateNodeProgress(session, userId, pathId, progressData);
    
    // 2. 重新计算整体进度
    await recalculateOverallProgress(session, userId, pathId);
    
    // 3. 更新用户统计
    await updateUserStats(session, userId);
    
    // 4. 记录学习会话
    await recordLearningSession(session, userId, progressData);
  });
}
```

#### 1.3.2 缓存一致性
```javascript
// 缓存失效策略
const cacheInvalidationRules = {
  // 进度更新时失效相关缓存
  onProgressUpdate: [
    'user:progress:{userId}:{pathId}',
    'user:stats:{userId}',
    'path:stats:{pathId}',
    'recommendation:content:{userId}'
  ],
  
  // 路径更新时失效相关缓存
  onPathUpdate: [
    'path:details:{pathId}',
    'path:structure:{pathId}',
    'search:paths:*',
    'recommendation:path:*'
  ]
};
```

---

## 2. MongoDB集合设计

### 2.1 学习路径集合 (learning_paths)

#### 2.1.1 集合结构
```javascript
{
  _id: ObjectId,
  title: String,                    // 路径标题
  description: String,              // 路径描述
  category: String,                 // 路径分类
  subcategory: String,              // 子分类
  tags: [String],                   // 标签数组
  
  // 难度和时长
  difficulty: String,               // 难度级别 (beginner/intermediate/advanced/expert)
  estimatedDuration: Number,        // 预估学习时长(小时)
  actualDuration: Number,           // 实际平均学习时长
  
  // 路径结构
  structure: {
    version: String,                // 结构版本
    nodes: [{
      id: String,                   // 节点唯一ID
      type: String,                 // 节点类型 (knowledge/practice/assessment/milestone)
      title: String,                // 节点标题
      description: String,          // 节点描述
      contentId: ObjectId,          // 关联内容ID
      contentType: String,          // 内容类型 (video/article/exercise/quiz)
      
      // 位置和布局
      position: {
        x: Number,                  // X坐标
        y: Number,                  // Y坐标
        layer: Number               // 层级
      },
      
      // 学习参数
      estimatedTime: Number,        // 预估学习时间(分钟)
      difficulty: Number,           // 节点难度 (1-10)
      importance: Number,           // 重要性权重 (0-1)
      prerequisites: [String],      // 前置节点ID数组
      isOptional: Boolean,          // 是否可选
      isMilestone: Boolean,         // 是否为里程碑
      
      // 节点元数据
      metadata: {
        skills: [String],           // 涉及技能
        concepts: [String],         // 涉及概念
        tools: [String],            // 使用工具
        resources: [ObjectId],      // 相关资源
        assessmentCriteria: Object  // 评估标准
      }
    }],
    
    edges: [{
      id: String,                   // 连接ID
      from: String,                 // 起始节点ID
      to: String,                   // 目标节点ID
      type: String,                 // 连接类型 (sequential/conditional/optional/adaptive)
      
      // 连接条件
      condition: {
        type: String,               // 条件类型 (completion/score/time/assessment)
        operator: String,           // 操作符 (>=, >, ==, etc.)
        value: Number,              // 阈值
        logic: String               // 逻辑关系 (AND/OR)
      },
      
      // 权重和优先级
      weight: Number,               // 连接权重
      priority: Number              // 优先级
    }]
  },
  
  // 创建者和权限
  creator: ObjectId,                // 创建者用户ID
  collaborators: [{
    userId: ObjectId,               // 协作者ID
    role: String,                   // 角色 (editor/reviewer/viewer)
    permissions: [String],          // 权限列表
    addedAt: Date                   // 添加时间
  }],
  
  // 发布状态
  status: String,                   // 状态 (draft/review/published/archived)
  visibility: String,               // 可见性 (public/private/organization)
  isTemplate: Boolean,              // 是否为模板
  templateCategory: String,         // 模板分类
  
  // 版本控制
  version: {
    major: Number,                  // 主版本号
    minor: Number,                  // 次版本号
    patch: Number,                  // 补丁版本号
    changelog: String               // 更新日志
  },
  
  // 统计信息
  stats: {
    views: Number,                  // 浏览次数
    enrollments: Number,            // 注册人数
    completions: Number,            // 完成人数
    averageRating: Number,          // 平均评分
    ratingCount: Number,            // 评分人数
    averageCompletionTime: Number,  // 平均完成时间
    successRate: Number,            // 成功率
    dropoutRate: Number,            // 辍学率
    
    // 节点统计
    nodeStats: [{
      nodeId: String,               // 节点ID
      completionRate: Number,       // 完成率
      averageTime: Number,          // 平均用时
      averageScore: Number,         // 平均得分
      difficultyRating: Number      // 难度评分
    }]
  },
  
  // 推荐和标签
  recommendations: {
    prerequisites: [ObjectId],      // 前置路径推荐
    followUp: [ObjectId],          // 后续路径推荐
    related: [ObjectId],           // 相关路径推荐
    alternatives: [ObjectId]       // 替代路径推荐
  },
  
  // SEO和元数据
  seo: {
    slug: String,                   // URL友好标识
    metaTitle: String,              // SEO标题
    metaDescription: String,        // SEO描述
    keywords: [String],             // 关键词
    ogImage: String                 // 社交分享图片
  },
  
  // 时间戳
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date,
  archivedAt: Date
}
```

#### 2.1.2 索引设计
```javascript
// 复合索引
db.learning_paths.createIndex({ "category": 1, "difficulty": 1, "status": 1 });
db.learning_paths.createIndex({ "creator": 1, "status": 1, "createdAt": -1 });
db.learning_paths.createIndex({ "tags": 1, "visibility": 1, "publishedAt": -1 });
db.learning_paths.createIndex({ "stats.averageRating": -1, "stats.enrollments": -1 });

// 文本搜索索引
db.learning_paths.createIndex({
  "title": "text",
  "description": "text",
  "tags": "text"
}, {
  weights: {
    "title": 10,
    "description": 5,
    "tags": 3
  },
  name: "path_search_index"
});

// 地理位置索引（如果需要基于位置的推荐）
db.learning_paths.createIndex({ "creator.location": "2dsphere" });

// 稀疏索引
db.learning_paths.createIndex({ "seo.slug": 1 }, { unique: true, sparse: true });
db.learning_paths.createIndex({ "templateCategory": 1 }, { sparse: true });
```

### 2.2 用户学习进度集合 (user_progress)

#### 2.2.1 集合结构
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // 用户ID
  pathId: ObjectId,                 // 学习路径ID
  
  // 注册信息
  enrollment: {
    enrolledAt: Date,               // 注册时间
    source: String,                 // 注册来源 (search/recommendation/social/direct)
    referrer: ObjectId,             // 推荐人ID
    motivation: String,             // 学习动机
    expectedCompletionDate: Date    // 预期完成日期
  },
  
  // 进度状态
  status: String,                   // 状态 (not_started/in_progress/completed/paused/dropped)
  overallProgress: Number,          // 整体进度百分比 (0-100)
  currentNodeId: String,            // 当前学习节点ID
  lastCompletedNodeId: String,      // 最后完成的节点ID
  
  // 节点进度详情
  nodeProgress: [{
    nodeId: String,                 // 节点ID
    status: String,                 // 节点状态 (not_started/in_progress/completed/skipped/failed)
    progress: Number,               // 节点进度百分比
    
    // 时间统计
    timeSpent: Number,              // 花费时间(分钟)
    sessions: Number,               // 学习会话数
    firstAccessedAt: Date,          // 首次访问时间
    lastAccessedAt: Date,           // 最后访问时间
    completedAt: Date,              // 完成时间
    
    // 学习表现
    attempts: Number,               // 尝试次数
    score: Number,                  // 得分 (0-100)
    maxScore: Number,               // 最高得分
    averageScore: Number,           // 平均得分
    
    // 学习行为
    interactions: {
      views: Number,                // 查看次数
      replays: Number,              // 重播次数
      bookmarks: Number,            // 收藏次数
      notes: Number,                // 笔记数量
      questions: Number,            // 提问次数
      helps: Number                 // 求助次数
    },
    
    // 反馈和评价
    feedback: {
      difficulty: Number,           // 难度评分 (1-5)
      usefulness: Number,           // 有用性评分 (1-5)
      clarity: Number,              // 清晰度评分 (1-5)
      engagement: Number,           // 参与度评分 (1-5)
      comment: String               // 文字反馈
    },
    
    // 元数据
    metadata: {
      device: String,               // 学习设备
      browser: String,              // 浏览器
      location: String,             // 学习地点
      timeOfDay: String,            // 学习时段
      studyMode: String             // 学习模式 (focused/casual/review)
    }
  }],
  
  // 学习统计
  stats: {
    totalTimeSpent: Number,         // 总学习时间(分钟)
    effectiveTime: Number,          // 有效学习时间
    sessionsCount: Number,          // 学习会话总数
    averageSessionTime: Number,     // 平均会话时间
    longestSession: Number,         // 最长会话时间
    
    // 学习习惯
    studyStreak: {
      current: Number,              // 当前连续天数
      longest: Number,              // 最长连续天数
      lastStudyDate: Date           // 最后学习日期
    },
    
    // 学习模式分析
    patterns: {
      preferredTimeSlots: [String], // 偏好时间段
      averageSessionsPerDay: Number,// 日均会话数
      weeklyDistribution: [Number], // 周分布
      monthlyTrend: [Number]        // 月度趋势
    },
    
    // 表现指标
    performance: {
      averageScore: Number,         // 平均得分
      improvementRate: Number,      // 进步率
      retentionRate: Number,        // 知识保持率
      errorRate: Number,            // 错误率
      helpSeekingRate: Number       // 求助率
    }
  },
  
  // 个性化设置
  settings: {
    dailyGoal: Number,              // 每日学习目标(分钟)
    weeklyGoal: Number,             // 每周学习目标
    reminderTime: String,           // 提醒时间
    reminderDays: [Number],         // 提醒日期
    preferredDifficulty: String,    // 偏好难度
    learningPace: String,           // 学习节奏 (slow/normal/fast)
    autoAdvance: Boolean,           // 自动推进
    showHints: Boolean,             // 显示提示
    enableNotifications: Boolean    // 启用通知
  },
  
  // 成就和里程碑
  achievements: [{
    id: String,                     // 成就ID
    type: String,                   // 成就类型
    title: String,                  // 成就标题
    description: String,            // 成就描述
    icon: String,                   // 成就图标
    earnedAt: Date,                 // 获得时间
    progress: Number,               // 成就进度
    metadata: Object                // 成就元数据
  }],
  
  // 社交学习
  social: {
    studyGroups: [ObjectId],        // 参与的学习小组
    mentors: [ObjectId],            // 导师列表
    mentees: [ObjectId],            // 学员列表
    studyPartners: [ObjectId],      // 学习伙伴
    sharedProgress: Boolean,        // 是否分享进度
    allowHelp: Boolean              // 是否接受帮助
  },
  
  // 时间戳
  startedAt: Date,
  lastUpdatedAt: Date,
  completedAt: Date,
  pausedAt: Date,
  droppedAt: Date
}
```

#### 2.2.2 索引设计
```javascript
// 主要查询索引
db.user_progress.createIndex({ "userId": 1, "pathId": 1 }, { unique: true });
db.user_progress.createIndex({ "userId": 1, "status": 1, "lastUpdatedAt": -1 });
db.user_progress.createIndex({ "pathId": 1, "status": 1, "overallProgress": -1 });

// 统计分析索引
db.user_progress.createIndex({ "stats.totalTimeSpent": -1, "completedAt": -1 });
db.user_progress.createIndex({ "stats.performance.averageScore": -1 });
db.user_progress.createIndex({ "enrollment.enrolledAt": -1, "status": 1 });

// 社交学习索引
db.user_progress.createIndex({ "social.studyGroups": 1 });
db.user_progress.createIndex({ "social.mentors": 1 });

// 时间范围查询索引
db.user_progress.createIndex({ "lastUpdatedAt": -1 });
db.user_progress.createIndex({ "startedAt": -1, "completedAt": -1 });
```

### 2.3 用户画像集合 (user_profiles)

#### 2.3.1 集合结构
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // 用户ID
  
  // 基础信息
  demographics: {
    age: Number,                    // 年龄
    gender: String,                 // 性别
    education: String,              // 教育背景
    profession: String,             // 职业
    experience: String,             // 工作经验
    location: {
      country: String,              // 国家
      city: String,                 // 城市
      timezone: String              // 时区
    },
    languages: [{
      language: String,             // 语言
      proficiency: String           // 熟练程度
    }]
  },
  
  // 学习特征
  learningCharacteristics: {
    // 学习风格
    learningStyle: {
      primary: String,              // 主要学习风格 (visual/auditory/kinesthetic/reading)
      secondary: String,            // 次要学习风格
      confidence: Number            // 识别置信度
    },
    
    // 认知特征
    cognitive: {
      attentionSpan: Number,        // 注意力持续时间(分钟)
      processingSpeed: String,      // 处理速度 (slow/normal/fast)
      memoryType: String,           // 记忆类型 (visual/verbal/mixed)
      thinkingStyle: String         // 思维风格 (analytical/creative/practical)
    },
    
    // 学习偏好
    preferences: {
      contentTypes: [String],       // 偏好内容类型
      interactionLevel: String,     // 互动水平 (low/medium/high)
      feedbackFrequency: String,    // 反馈频率 (immediate/periodic/final)
      challengeLevel: String,       // 挑战水平 (low/medium/high)
      socialLearning: Boolean       // 是否喜欢社交学习
    },
    
    // 动机类型
    motivation: {
      primary: String,              // 主要动机 (achievement/affiliation/power/autonomy)
      intrinsic: Number,            // 内在动机强度 (0-1)
      extrinsic: Number,            // 外在动机强度 (0-1)
      goalOrientation: String       // 目标导向 (mastery/performance)
    }
  },
  
  // 能力评估
  abilities: {
    // 知识领域能力
    domains: [{
      domain: String,               // 知识领域
      level: String,                // 能力级别 (novice/beginner/intermediate/advanced/expert)
      score: Number,                // 评估分数 (0-100)
      confidence: Number,           // 置信度 (0-1)
      assessedAt: Date,             // 评估时间
      assessmentMethod: String,     // 评估方法
      
      // 子技能详情
      skills: [{
        skill: String,              // 技能名称
        proficiency: Number,        // 熟练度 (0-100)
        growth: Number,             // 成长率
        lastPracticed: Date         // 最后练习时间
      }]
    }],
    
    // 通用能力
    general: {
      problemSolving: Number,       // 问题解决能力
      criticalThinking: Number,     // 批判性思维
      creativity: Number,           // 创造力
      communication: Number,        // 沟通能力
      collaboration: Number,        // 协作能力
      adaptability: Number          // 适应能力
    },
    
    // 学习能力
    learning: {
      acquisitionSpeed: Number,     // 知识获取速度
      retentionRate: Number,        // 知识保持率
      transferAbility: Number,      // 知识迁移能力
      metacognition: Number         // 元认知能力
    }
  },
  
  // 学习目标
  goals: [{
    id: String,                     // 目标ID
    title: String,                  // 目标标题
    description: String,            // 目标描述
    category: String,               // 目标分类
    type: String,                   // 目标类型 (skill/knowledge/career/personal)
    priority: String,               // 优先级 (high/medium/low)
    
    // 时间规划
    targetDate: Date,               // 目标日期
    estimatedTime: Number,          // 预估时间
    deadline: Date,                 // 截止日期
    
    // 进度跟踪
    status: String,                 // 状态 (active/completed/paused/cancelled)
    progress: Number,               // 进度百分比
    milestones: [{
      title: String,                // 里程碑标题
      targetDate: Date,             // 目标日期
      completed: Boolean,           // 是否完成
      completedAt: Date             // 完成时间
    }],
    
    // 关联资源
    relatedPaths: [ObjectId],       // 相关学习路径
    requiredSkills: [String],       // 所需技能
    
    createdAt: Date,
    updatedAt: Date
  }],
  
  // 学习偏好
  preferences: {
    // 内容偏好
    content: {
      subjects: [String],           // 感兴趣的学科
      formats: [String],            // 偏好的内容格式
      languages: [String],          // 偏好语言
      difficulty: String,           // 偏好难度
      length: String                // 偏好内容长度
    },
    
    // 时间偏好
    time: {
      dailyTime: Number,            // 每日学习时间
      sessionLength: Number,        // 单次学习时长
      preferredHours: [Number],     // 偏好学习时段
      weekdayPreference: [Number],  // 偏好学习日
      breakFrequency: Number        // 休息频率
    },
    
    // 环境偏好
    environment: {
      location: String,             // 偏好学习地点
      noise: String,                // 噪音偏好
      lighting: String,             // 光线偏好
      temperature: String,          // 温度偏好
      device: String                // 偏好设备
    },
    
    // 社交偏好
    social: {
      groupSize: String,            // 偏好小组规模
      interaction: String,          // 互动偏好
      competition: Boolean,         // 是否喜欢竞争
      collaboration: Boolean,       // 是否喜欢协作
      mentorship: Boolean           // 是否需要导师
    }
  },
  
  // 行为模式
  behaviorPatterns: {
    // 学习模式
    studyPatterns: {
      consistency: Number,          // 学习一致性
      intensity: Number,            // 学习强度
      persistence: Number,          // 坚持性
      flexibility: Number           // 灵活性
    },
    
    // 参与模式
    engagement: {
      activeParticipation: Number,  // 主动参与度
      questionAsking: Number,       // 提问频率
      helpSeeking: Number,          // 求助频率
      helpGiving: Number            // 助人频率
    },
    
    // 完成模式
    completion: {
      finishRate: Number,           // 完成率
      dropoutRisk: Number,          // 辍学风险
      procrastination: Number,      // 拖延倾向
      perfectionism: Number         // 完美主义倾向
    }
  },
  
  // 个性化参数
  personalization: {
    // 推荐权重
    recommendationWeights: {
      contentBased: Number,         // 内容推荐权重
      collaborative: Number,        // 协同推荐权重
      knowledge: Number,            // 知识推荐权重
      social: Number,               // 社交推荐权重
      trending: Number              // 趋势推荐权重
    },
    
    // 适应性参数
    adaptiveParameters: {
      difficultyAdjustment: Number, // 难度调整系数
      paceAdjustment: Number,       // 节奏调整系数
      contentVariation: Number,     // 内容变化系数
      feedbackSensitivity: Number   // 反馈敏感度
    }
  },
  
  // 更新信息
  lastUpdatedAt: Date,
  profileCompleteness: Number,      // 画像完整度 (0-1)
  dataQuality: Number,              // 数据质量评分 (0-1)
  lastAnalyzedAt: Date              // 最后分析时间
}
```

#### 2.3.3 索引设计
```javascript
// 用户查询索引
db.user_profiles.createIndex({ "userId": 1 }, { unique: true });

// 能力查询索引
db.user_profiles.createIndex({ "abilities.domains.domain": 1, "abilities.domains.level": 1 });
db.user_profiles.createIndex({ "abilities.domains.skills.skill": 1 });

// 目标查询索引
db.user_profiles.createIndex({ "goals.category": 1, "goals.status": 1 });
db.user_profiles.createIndex({ "goals.targetDate": 1, "goals.priority": 1 });

// 偏好查询索引
db.user_profiles.createIndex({ "preferences.content.subjects": 1 });
db.user_profiles.createIndex({ "demographics.location.country": 1, "demographics.location.city": 1 });

// 更新时间索引
db.user_profiles.createIndex({ "lastUpdatedAt": -1 });
db.user_profiles.createIndex({ "lastAnalyzedAt": -1 });
```

### 2.4 推荐记录集合 (recommendation_records)

#### 2.4.1 集合结构
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // 用户ID
  sessionId: String,                // 会话ID
  type: String,                     // 推荐类型 (path/content/peer/mentor)
  
  // 推荐上下文
  context: {
    pageType: String,               // 页面类型 (homepage/search/learning/profile)
    userAction: String,             // 用户行为 (browse/search/complete/pause)
    currentPath: ObjectId,          // 当前学习路径
    currentNode: String,            // 当前节点
    searchQuery: String,            // 搜索查询
    filters: Object,                // 应用的过滤器
    
    // 环境信息
    device: String,                 // 设备类型
    browser: String,                // 浏览器
    location: String,               // 地理位置
    timeOfDay: String,              // 时间段
    dayOfWeek: Number,              // 星期几
    
    // 用户状态
    learningStreak: Number,         // 学习连续天数
    recentActivity: String,         // 最近活动
    mood: String,                   // 学习情绪
    energy: String                  // 精力水平
  },
  
  // 推荐算法信息
  algorithm: {
    name: String,                   // 算法名称
    version: String,                // 算法版本
    parameters: Object,             // 算法参数
    confidence: Number,             // 推荐置信度
    explanation: String,            // 推荐解释
    
    // 算法组合
    ensemble: [{
      algorithm: String,            // 子算法名称
      weight: Number,               // 权重
      score: Number                 // 子算法得分
    }]
  },
  
  // 推荐结果
  recommendations: [{
    itemId: ObjectId,               // 推荐项ID
    itemType: String,               // 推荐项类型
    title: String,                  // 推荐项标题
    description: String,            // 推荐项描述
    
    // 推荐评分
    score: Number,                  // 推荐分数 (0-1)
    rank: Number,                   // 推荐排名
    confidence: Number,             // 置信度
    
    // 推荐理由
    reasons: [{
      type: String,                 // 理由类型
      description: String,          // 理由描述
      weight: Number,               // 权重
      evidence: Object              // 支持证据
    }],
    
    // 多样性信息
    diversity: {
      category: String,             // 类别多样性
      difficulty: String,           // 难度多样性
      format: String,               // 格式多样性
      novelty: Number               // 新颖性
    },
    
    // 预测指标
    predictions: {
      clickProbability: Number,     // 点击概率
      engagementProbability: Number,// 参与概率
      completionProbability: Number,// 完成概率
      satisfactionScore: Number     // 满意度预测
    },
    
    // 用户反馈
    feedback: {
      clicked: Boolean,             // 是否点击
      viewed: Boolean,              // 是否查看
      liked: Boolean,               // 是否喜欢
      shared: Boolean,              // 是否分享
      enrolled: Boolean,            // 是否注册
      completed: Boolean,           // 是否完成
      
      // 显式反馈
      rating: Number,               // 用户评分 (1-5)
      relevance: Number,            // 相关性评分
      usefulness: Number,           // 有用性评分
      comment: String,              // 文字反馈
      
      // 反馈时间
      clickedAt: Date,
      viewedAt: Date,
      ratedAt: Date,
      feedbackAt: Date
    },
    
    // 展示信息
    display: {
      position: Number,             // 展示位置
      format: String,               // 展示格式
      thumbnail: String,            // 缩略图
      badge: String,                // 标识徽章
      highlight: String             // 高亮信息
    }
  }],
  
  // 推荐性能
  performance: {
    generationTime: Number,         // 生成时间(毫秒)
    cacheHit: Boolean,              // 是否命中缓存
    dataFreshness: Number,          // 数据新鲜度(小时)
    modelVersion: String,           // 模型版本
    
    // A/B测试信息
    experiment: {
      id: String,                   // 实验ID
      variant: String,              // 变体
      group: String                 // 实验组
    }
  },
  
  // 业务指标
  metrics: {
    impressions: Number,            // 展示次数
    clicks: Number,                 // 点击次数
    conversions: Number,            // 转化次数
    ctr: Number,                    // 点击率
    cvr: Number,                    // 转化率
    
    // 多样性指标
    intraListDiversity: Number,     // 列表内多样性
    coverage: Number,               // 覆盖率
    novelty: Number,                // 新颖性
    serendipity: Number             // 意外发现性
  },
  
  // 时间信息
  generatedAt: Date,                // 生成时间
  expiredAt: Date,                  // 过期时间
  lastUpdatedAt: Date               // 最后更新时间
}
```

#### 2.4.2 索引设计
```javascript
// 用户推荐查询索引
db.recommendation_records.createIndex({ "userId": 1, "type": 1, "generatedAt": -1 });
db.recommendation_records.createIndex({ "userId": 1, "sessionId": 1 });

// 推荐效果分析索引
db.recommendation_records.createIndex({ "algorithm.name": 1, "generatedAt": -1 });
db.recommendation_records.createIndex({ "recommendations.feedback.clicked": 1, "generatedAt": -1 });
db.recommendation_records.createIndex({ "performance.experiment.id": 1, "performance.experiment.variant": 1 });

// 推荐项查询索引
db.recommendation_records.createIndex({ "recommendations.itemId": 1, "recommendations.itemType": 1 });
db.recommendation_records.createIndex({ "recommendations.score": -1, "recommendations.rank": 1 });

// 时间范围查询索引
db.recommendation_records.createIndex({ "generatedAt": -1 });
db.recommendation_records.createIndex({ "expiredAt": 1 });

// 复合查询索引
db.recommendation_records.createIndex({ "context.pageType": 1, "type": 1, "generatedAt": -1 });
```

### 2.5 学习会话集合 (learning_sessions)

#### 2.5.1 集合结构
```javascript
{
  _id: ObjectId,
  sessionId: String,                // 会话唯一ID
  userId: ObjectId,                 // 用户ID
  pathId: ObjectId,                 // 学习路径ID
  nodeId: String,                   // 学习节点ID
  
  // 会话基本信息
  sessionInfo: {
    startTime: Date,                // 开始时间
    endTime: Date,                  // 结束时间
    duration: Number,               // 持续时间(秒)
    effectiveDuration: Number,      // 有效学习时间(秒)
    
    // 设备和环境
    device: {
      type: String,                 // 设备类型 (desktop/mobile/tablet)
      os: String,                   // 操作系统
      browser: String,              // 浏览器
      screenSize: String,           // 屏幕尺寸
      network: String               // 网络类型
    },
    
    location: {
      country: String,              // 国家
      city: String,                 // 城市
      timezone: String,             // 时区
      ip: String                    // IP地址(脱敏)
    },
    
    // 学习环境
    environment: {
      timeOfDay: String,            // 时间段
      dayOfWeek: Number,            // 星期几
      isWeekend: Boolean,           // 是否周末
      weather: String,              // 天气(如果可获取)
      noise: String                 // 环境噪音
    }
  },
  
  // 学习活动
  activities: [{
    timestamp: Date,                // 活动时间戳
    type: String,                   // 活动类型 (view/interact/pause/resume/complete)
    action: String,                 // 具体动作
    target: String,                 // 目标对象
    
    // 活动详情
    details: {
      duration: Number,             // 活动持续时间
      position: Number,             // 内容位置
      value: String,                // 活动值
      metadata: Object              // 额外元数据
    },
    
    // 上下文信息
    context: {
      previousAction: String,       // 前一个动作
      nextAction: String,           // 后一个动作
      sequence: Number,             // 序列号
      isRepeated: Boolean           // 是否重复动作
    }
  }],
  
  // 学习行为分析
  behavior: {
    // 注意力分析
    attention: {
      focusTime: Number,            // 专注时间
      distractionCount: Number,     // 分心次数
      averageFocusSpan: Number,     // 平均专注时长
      attentionScore: Number        // 注意力得分
    },
    
    // 参与度分析
    engagement: {
      interactionCount: Number,     // 互动次数
      clickRate: Number,            // 点击率
      scrollDepth: Number,          // 滚动深度
      timeOnContent: Number,        // 内容停留时间
      engagementScore: Number       // 参与度得分
    },
    
    // 学习策略
    strategy: {
      readingSpeed: Number,         // 阅读速度
      reviewFrequency: Number,      // 复习频率
      notesTaken: Number,           // 笔记数量
      questionsAsked: Number,       // 提问次数
      helpSought: Number            // 求助次数
    },
    
    // 情绪状态
    emotion: {
      frustrationLevel: Number,     // 挫折水平
      confidenceLevel: Number,      // 信心水平
      motivationLevel: Number,      // 动机水平
      satisfactionLevel: Number     // 满意度水平
    }
  },
  
  // 学习成果
  outcomes: {
    // 知识获得
    knowledge: {
      conceptsLearned: [String],    // 学到的概念
      skillsPracticed: [String],    // 练习的技能
      knowledgeGain: Number,        // 知识增量
      retentionRate: Number         // 保持率
    },
    
    // 表现指标
    performance: {
      accuracy: Number,             // 准确率
      speed: Number,                // 完成速度
      efficiency: Number,           // 学习效率
      improvement: Number           // 进步幅度
    },
    
    // 完成状态
    completion: {
      status: String,               // 完成状态
      progress: Number,             // 进度百分比
      score: Number,                // 得分
      attempts: Number,             // 尝试次数
      timeToComplete: Number        // 完成用时
    }
  },
  
  // 反馈和评价
  feedback: {
    // 自动反馈
    automatic: {
      difficultyDetected: String,   // 检测到的难度
      strugglingPoints: [String],   // 困难点
      strongPoints: [String],       // 优势点
      recommendations: [String]     // 自动建议
    },
    
    // 用户反馈
    user: {
      difficulty: Number,           // 难度评分
      clarity: Number,              // 清晰度评分
      usefulness: Number,           // 有用性评分
      engagement: Number,           // 参与度评分
      overallRating: Number,        // 总体评分
      comment: String,              // 文字反馈
      suggestions: String           // 改进建议
    }
  },
  
  // 技术指标
  technical: {
    // 性能指标
    performance: {
      loadTime: Number,             // 加载时间
      renderTime: Number,           // 渲染时间
      responseTime: Number,         // 响应时间
      errorCount: Number,           // 错误次数
      crashCount: Number            // 崩溃次数
    },
    
    // 网络指标
    network: {
      bandwidth: Number,            // 带宽
      latency: Number,              // 延迟
      packetLoss: Number,           // 丢包率
      connectionType: String        // 连接类型
    }
  },
  
  // 会话标签
  tags: [String],                   // 会话标签
  
  // 数据质量
  dataQuality: {
    completeness: Number,           // 数据完整性
    accuracy: Number,               // 数据准确性
    consistency: Number,            // 数据一致性
    timeliness: Number              // 数据及时性
  },
  
  // 时间戳
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.5.2 索引设计
```javascript
// 会话查询索引
db.learning_sessions.createIndex({ "sessionId": 1 }, { unique: true });
db.learning_sessions.createIndex({ "userId": 1, "sessionInfo.startTime": -1 });
db.learning_sessions.createIndex({ "pathId": 1, "nodeId": 1, "sessionInfo.startTime": -1 });

// 行为分析索引
db.learning_sessions.createIndex({ "behavior.engagement.engagementScore": -1 });
db.learning_sessions.createIndex({ "behavior.attention.attentionScore": -1 });
db.learning_sessions.createIndex({ "outcomes.performance.efficiency": -1 });

// 时间范围查询索引
db.learning_sessions.createIndex({ "sessionInfo.startTime": -1, "sessionInfo.endTime": -1 });
db.learning_sessions.createIndex({ "sessionInfo.duration": -1 });

// 设备和环境索引
db.learning_sessions.createIndex({ "sessionInfo.device.type": 1, "sessionInfo.environment.timeOfDay": 1 });
db.learning_sessions.createIndex({ "sessionInfo.location.country": 1, "sessionInfo.location.city": 1 });

// 反馈分析索引
db.learning_sessions.createIndex({ "feedback.user.overallRating": -1, "sessionInfo.startTime": -1 });
db.learning_sessions.createIndex({ "feedback.user.difficulty": 1, "outcomes.completion.status": 1 });
```

---

## 3. Redis缓存设计

### 3.1 缓存键命名规范

```
缓存键格式: {service}:{type}:{identifier}:{version}

示例:
- learning-path:details:path_123:v1
- user:progress:user_456:path_123
- recommendation:content:user_789:homepage
- session:active:session_abc123
```

### 3.2 缓存数据结构

#### 3.2.1 用户会话缓存
```redis
# 用户活跃会话
HSET session:active:user_123
  sessionId "session_abc123"
  pathId "path_456"
  nodeId "node_789"
  startTime "2024-01-15T10:30:00Z"
  lastActivity "2024-01-15T11:00:00Z"
  device "desktop"
  location "Beijing"

EXPIRE session:active:user_123 1800  # 30分钟过期

# 学习进度缓存
HSET progress:user_123:path_456
  overallProgress "45.5"
  currentNodeId "node_3"
  status "in_progress"
  lastUpdated "2024-01-15T11:00:00Z"
  totalTime "120"
  sessionsCount "8"

EXPIRE progress:user_123:path_456 300  # 5分钟过期
```

#### 3.2.2 推荐结果缓存
```redis
# 个性化推荐缓存
SET recommendation:content:user_123:homepage '{"recommendations":[{"itemId":"path_789","score":0.95,"reason":"基于您的学习历史推荐"}],"generatedAt":"2024-01-15T11:00:00Z"}'
EXPIRE recommendation:content:user_123:homepage 900  # 15分钟过期

# 热门内容缓存
ZADD trending:paths:daily
  0.95 "path_123"
  0.92 "path_456"
  0.89 "path_789"

EXPIRE trending:paths:daily 21600  # 6小时过期

# 相似用户缓存
SADD similar:user_123
  "user_456"
  "user_789"
  "user_012"

EXPIRE similar:user_123 3600  # 1小时过期
```

#### 3.2.3 实时统计缓存
```redis
# 路径统计缓存
HSET stats:path_123
  enrollments "1250"
  completions "890"
  averageRating "4.6"
  averageTime "115"
  lastUpdated "2024-01-15T11:00:00Z"

EXPIRE stats:path_123 1800  # 30分钟过期

# 用户学习统计
HSET stats:user_123:daily
  studyTime "60"
  sessionsCount "3"
  nodesCompleted "2"
  averageScore "87"
  date "2024-01-15"

EXPIRE stats:user_123:daily 86400  # 24小时过期

# 实时在线用户
SADD online:users:learning
  "user_123"
  "user_456"
  "user_789"

EXPIRE online:users:learning 300  # 5分钟过期
```

#### 3.2.4 学习路径缓存
```redis
# 路径详情缓存
SET path:details:path_123 '{"title":"Python数据科学入门","description":"从零开始学习Python数据科学","difficulty":"beginner","estimatedDuration":120}'
EXPIRE path:details:path_123 3600  # 1小时过期

# 路径结构缓存
SET path:structure:path_123 '{"nodes":[...],"edges":[...]}'
EXPIRE path:structure:path_123 7200  # 2小时过期

# 路径搜索结果缓存
SET search:paths:"python data science":beginner '[{"pathId":"path_123","score":0.95},{"pathId":"path_456","score":0.89}]'
EXPIRE search:paths:"python data science":beginner 1800  # 30分钟过期
```

### 3.3 缓存策略配置

#### 3.3.1 缓存层级策略
```javascript
const cacheStrategy = {
  // L1缓存 - 应用内存缓存
  l1: {
    maxSize: '100MB',
    ttl: 300,  // 5分钟
    types: ['user_session', 'current_progress', 'active_recommendations']
  },
  
  // L2缓存 - Redis缓存
  l2: {
    maxMemory: '2GB',
    policy: 'allkeys-lru',
    types: {
      hot_data: { ttl: 300 },      // 热点数据 5分钟
      user_data: { ttl: 1800 },    // 用户数据 30分钟
      content_data: { ttl: 3600 }, // 内容数据 1小时
      analytics_data: { ttl: 7200 } // 分析数据 2小时
    }
  },
  
  // L3缓存 - CDN缓存
  l3: {
    ttl: 86400,  // 24小时
    types: ['static_content', 'public_paths', 'media_files']
  }
};
```

#### 3.3.2 缓存更新策略
```javascript
class CacheUpdateStrategy {
  // 写入时更新 (Write-through)
  async writeThrough(key, data) {
    await this.database.write(key, data);
    await this.cache.set(key, data);
  }
  
  // 写入后更新 (Write-behind)
  async writeBehind(key, data) {
    await this.cache.set(key, data);
    this.asyncQueue.push({ action: 'write', key, data });
  }
  
  // 延迟加载 (Lazy loading)
  async lazyLoad(key) {
    let data = await this.cache.get(key);
    if (!data) {
      data = await this.database.read(key);
      await this.cache.set(key, data);
    }
    return data;
  }
  
  // 定时刷新 (Time-based refresh)
  async timeBasedRefresh() {
    const expiredKeys = await this.cache.getExpiredKeys();
    for (const key of expiredKeys) {
      const data = await this.database.read(key);
      await this.cache.set(key, data);
    }
  }
}
```

---

## 4. Elasticsearch索引设计

### 4.1 学习路径搜索索引

#### 4.1.1 索引映射
```json
{
  "mappings": {
    "properties": {
      "pathId": {
        "type": "keyword"
      },
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart",
        "fields": {
          "keyword": {
            "type": "keyword"
          },
          "suggest": {
            "type": "completion"
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "category": {
        "type": "keyword"
      },
      "subcategory": {
        "type": "keyword"
      },
      "tags": {
        "type": "keyword"
      },
      "difficulty": {
        "type": "keyword"
      },
      "estimatedDuration": {
        "type": "integer"
      },
      "skills": {
        "type": "keyword"
      },
      "concepts": {
        "type": "keyword"
      },
      "tools": {
        "type": "keyword"
      },
      "creator": {
        "properties": {
          "userId": {
            "type": "keyword"
          },
          "username": {
            "type": "text",
            "analyzer": "ik_max_word"
          },
          "reputation": {
            "type": "float"
          }
        }
      },
      "stats": {
        "properties": {
          "enrollments": {
            "type": "integer"
          },
          "completions": {
            "type": "integer"
          },
          "averageRating": {
            "type": "float"
          },
          "successRate": {
            "type": "float"
          }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "publishedAt": {
        "type": "date"
      },
      "updatedAt": {
        "type": "date"
      }
    }
  }
}
```

#### 4.2.2 用户行为分析索引
```json
{
  "mappings": {
    "properties": {
      "userId": {
        "type": "keyword"
      },
      "sessionId": {
        "type": "keyword"
      },
      "pathId": {
        "type": "keyword"
      },
      "action": {
        "type": "keyword"
      },
      "timestamp": {
        "type": "date"
      },
      "duration": {
        "type": "integer"
      },
      "metadata": {
        "type": "object",
        "enabled": false
      }
    }
  }
}
```

## 5. 数据一致性保证

### 5.1 事务处理

#### 5.1.1 MongoDB事务
```javascript
// 学习进度更新事务
async function updateLearningProgress(userId, pathId, stepId, progressData) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // 更新用户进度
      await UserProgress.findOneAndUpdate(
        { userId, pathId },
        {
          $set: {
            [`steps.${stepId}`]: progressData,
            lastAccessTime: new Date(),
            updatedAt: new Date()
          },
          $inc: { totalSteps: 1 }
        },
        { session, upsert: true }
      );
      
      // 更新学习路径统计
      await LearningPath.findByIdAndUpdate(
        pathId,
        {
          $inc: { 'stats.totalLearners': 1 },
          $set: { updatedAt: new Date() }
        },
        { session }
      );
      
      // 记录学习会话
      await LearningSession.create([{
        userId,
        pathId,
        stepId,
        action: 'step_completed',
        timestamp: new Date(),
        metadata: progressData
      }], { session });
    });
  } finally {
    await session.endSession();
  }
}
```

### 5.2 缓存失效策略

#### 5.2.1 缓存更新策略
```javascript
// 缓存失效配置
const cacheInvalidationRules = {
  // 用户进度更新时失效相关缓存
  'user_progress_updated': [
    'user:progress:{userId}',
    'user:recommendations:{userId}',
    'path:stats:{pathId}',
    'leaderboard:path:{pathId}'
  ],
  
  // 学习路径更新时失效相关缓存
  'learning_path_updated': [
    'path:detail:{pathId}',
    'path:list:category:{category}',
    'recommendations:popular',
    'search:paths:*'
  ],
  
  // 用户画像更新时失效推荐缓存
  'user_profile_updated': [
    'user:recommendations:{userId}',
    'user:similar:{userId}',
    'recommendations:personalized:{userId}'
  ]
};
```

### 5.3 数据同步机制

#### 5.3.1 MongoDB到Elasticsearch同步
```javascript
// Change Stream监听
const changeStream = db.collection('learning_paths').watch([
  { $match: { 'fullDocument.status': 'published' } }
]);

changeStream.on('change', async (change) => {
  try {
    switch (change.operationType) {
      case 'insert':
      case 'update':
        await syncToElasticsearch(change.fullDocument);
        break;
      case 'delete':
        await removeFromElasticsearch(change.documentKey._id);
        break;
    }
  } catch (error) {
    console.error('Sync to Elasticsearch failed:', error);
    // 记录失败，稍后重试
    await recordSyncFailure(change);
  }
});
```

## 6. 性能优化策略

### 6.1 MongoDB查询优化

#### 6.1.1 复合索引策略
```javascript
// 学习路径查询优化
db.learning_paths.createIndex({
  "category": 1,
  "difficulty": 1,
  "status": 1,
  "publishedAt": -1
});

// 用户进度查询优化
db.user_progress.createIndex({
  "userId": 1,
  "pathId": 1,
  "lastAccessTime": -1
});

// 推荐记录查询优化
db.recommendation_records.createIndex({
  "userId": 1,
  "type": 1,
  "createdAt": -1
});
```

#### 6.1.2 聚合管道优化
```javascript
// 学习统计聚合优化
const learningStatsAggregation = [
  {
    $match: {
      userId: ObjectId(userId),
      "progress.completedAt": { $exists: true }
    }
  },
  {
    $lookup: {
      from: "learning_paths",
      localField: "pathId",
      foreignField: "_id",
      as: "path",
      pipeline: [
        { $project: { title: 1, category: 1, difficulty: 1 } }
      ]
    }
  },
  {
    $group: {
      _id: "$path.category",
      completedPaths: { $sum: 1 },
      totalTime: { $sum: "$progress.totalTime" },
      avgScore: { $avg: "$progress.score" }
    }
  }
];
```

### 6.2 Elasticsearch查询优化

#### 6.2.1 搜索性能优化
```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "机器学习",
            "fields": ["title^3", "description^2", "content"],
            "type": "best_fields",
            "fuzziness": "AUTO"
          }
        }
      ],
      "filter": [
        { "term": { "status": "published" } },
        { "range": { "difficulty": { "gte": 1, "lte": 3 } } }
      ]
    }
  },
  "highlight": {
    "fields": {
      "title": {},
      "description": {}
    }
  },
  "_source": ["title", "description", "category", "difficulty", "stats"]
}
```

### 6.3 多级缓存架构

#### 6.3.1 缓存层次设计
```
┌─────────────────────────────────────────────────────────────┐
│                    多级缓存架构                              │
├─────────────────────────────────────────────────────────────┤
│  L1: 应用内存缓存 (Node.js Memory)                          │
│  ├─ 热点学习路径 (5分钟)                                     │
│  ├─ 用户会话数据 (30分钟)                                    │
│  └─ 配置数据 (1小时)                                         │
├─────────────────────────────────────────────────────────────┤
│  L2: Redis缓存                                              │
│  ├─ 用户进度数据 (1小时)                                     │
│  ├─ 推荐结果 (30分钟)                                        │
│  ├─ 搜索结果 (15分钟)                                        │
│  └─ 统计数据 (6小时)                                         │
├─────────────────────────────────────────────────────────────┤
│  L3: CDN缓存                                                │
│  ├─ 静态资源 (24小时)                                        │
│  ├─ 学习路径详情 (1小时)                                     │
│  └─ 公开数据 (6小时)                                         │
└─────────────────────────────────────────────────────────────┘
```

## 7. 数据备份与恢复

### 7.1 MongoDB备份策略

#### 7.1.1 备份配置
```bash
#!/bin/bash
# MongoDB备份脚本

BACKUP_DIR="/backup/mongodb/learning-path"
DATE=$(date +"%Y%m%d_%H%M%S")
DATABASE="sical"

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 备份学习路径相关集合
mongodump --host localhost:27017 \
          --db $DATABASE \
          --collection learning_paths \
          --out $BACKUP_DIR/$DATE

mongodump --host localhost:27017 \
          --db $DATABASE \
          --collection user_progress \
          --out $BACKUP_DIR/$DATE

mongodump --host localhost:27017 \
          --db $DATABASE \
          --collection user_profiles \
          --out $BACKUP_DIR/$DATE

# 压缩备份文件
tar -czf $BACKUP_DIR/learning_path_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# 清理临时文件
rm -rf $BACKUP_DIR/$DATE

# 保留最近30天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### 7.2 Elasticsearch备份策略

#### 7.2.1 快照配置
```json
{
  "type": "fs",
  "settings": {
    "location": "/backup/elasticsearch/learning-path",
    "compress": true,
    "chunk_size": "1gb"
  }
}
```

### 7.3 数据恢复脚本

#### 7.3.1 MongoDB恢复
```bash
#!/bin/bash
# MongoDB恢复脚本

BACKUP_FILE=$1
RESTORE_DB="sical_restore"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  exit 1
fi

# 解压备份文件
tar -xzf $BACKUP_FILE -C /tmp/

# 恢复数据
mongorestore --host localhost:27017 \
             --db $RESTORE_DB \
             /tmp/sical/

echo "数据恢复完成到数据库: $RESTORE_DB"
```

## 8. 监控与维护

### 8.1 数据库性能指标

#### 8.1.1 MongoDB监控指标
```javascript
// 性能监控脚本
const monitoringMetrics = {
  // 连接数监控
  connections: {
    current: 'db.serverStatus().connections.current',
    available: 'db.serverStatus().connections.available'
  },
  
  // 操作统计
  operations: {
    insert: 'db.serverStatus().opcounters.insert',
    query: 'db.serverStatus().opcounters.query',
    update: 'db.serverStatus().opcounters.update',
    delete: 'db.serverStatus().opcounters.delete'
  },
  
  // 内存使用
  memory: {
    resident: 'db.serverStatus().mem.resident',
    virtual: 'db.serverStatus().mem.virtual',
    mapped: 'db.serverStatus().mem.mapped'
  },
  
  // 锁统计
  locks: {
    globalLock: 'db.serverStatus().globalLock.currentQueue'
  }
};
```

### 8.2 定期清理任务

#### 8.2.1 数据清理脚本
```javascript
// 定期清理过期数据
const cleanupTasks = {
  // 清理过期的学习会话
  cleanExpiredSessions: async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await LearningSession.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      type: 'temporary'
    });
  },
  
  // 清理过期的推荐记录
  cleanExpiredRecommendations: async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await RecommendationRecord.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
      status: 'expired'
    });
  },
  
  // 归档完成的学习进度
  archiveCompletedProgress: async () => {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const completedProgress = await UserProgress.find({
      'progress.completedAt': { $lt: sixMonthsAgo },
      'progress.status': 'completed'
    });
    
    // 移动到归档集合
    if (completedProgress.length > 0) {
      await ArchivedProgress.insertMany(completedProgress);
      await UserProgress.deleteMany({
        _id: { $in: completedProgress.map(p => p._id) }
      });
    }
  }
};
```

## 9. 安全考虑

### 9.1 字段级加密

#### 9.1.1 敏感数据加密
```javascript
// 用户画像敏感数据加密
const userProfileSchema = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  
  // 加密的个人信息
  personalInfo: {
    type: String,
    get: function(value) {
      return decrypt(value);
    },
    set: function(value) {
      return encrypt(JSON.stringify(value));
    }
  },
  
  // 学习偏好（不加密）
  learningPreferences: {
    subjects: [String],
    difficulty: String,
    timePreference: String
  }
});
```

### 9.2 数据库访问权限

#### 9.2.1 角色权限配置
```javascript
// MongoDB角色权限
db.createRole({
  role: "learningPathReader",
  privileges: [
    {
      resource: { db: "sical", collection: "learning_paths" },
      actions: ["find", "listIndexes"]
    },
    {
      resource: { db: "sical", collection: "user_progress" },
      actions: ["find"]
    }
  ],
  roles: []
});

db.createRole({
  role: "learningPathWriter",
  privileges: [
    {
      resource: { db: "sical", collection: "learning_paths" },
      actions: ["find", "insert", "update", "remove"]
    },
    {
      resource: { db: "sical", collection: "user_progress" },
      actions: ["find", "insert", "update"]
    }
  ],
  roles: ["learningPathReader"]
});
```

## 10. 扩展性设计

### 10.1 MongoDB分片配置

#### 10.1.1 分片策略
```javascript
// 启用分片
sh.enableSharding("sical");

// 学习路径按类别分片
sh.shardCollection("sical.learning_paths", { "category": 1, "_id": 1 });

// 用户进度按用户ID哈希分片
sh.shardCollection("sical.user_progress", { "userId": "hashed" });

// 推荐记录按用户ID哈希分片
sh.shardCollection("sical.recommendation_records", { "userId": "hashed" });

// 学习会话按时间范围分片
sh.shardCollection("sical.learning_sessions", { "createdAt": 1 });
```

### 10.2 读写分离配置

#### 10.2.1 MongoDB读写分离
```javascript
// 读写分离配置
const readPreference = {
  // 写操作使用主节点
  write: { readPreference: 'primary' },
  
  // 读操作使用从节点
  read: { readPreference: 'secondaryPreferred' },
  
  // 分析查询使用从节点
  analytics: { readPreference: 'secondary' }
};

// 应用读写分离
const LearningPath = mongoose.model('LearningPath', learningPathSchema);

// 写操作
const createPath = async (pathData) => {
  return await LearningPath.create(pathData);
};

// 读操作
const findPaths = async (query) => {
  return await LearningPath.find(query).read('secondaryPreferred');
};
```

## 总结

本数据库设计文档为学习路径功能提供了完整的数据存储解决方案，具有以下特点：

### 设计亮点
1. **多数据库协同**：MongoDB + Redis + Elasticsearch的组合，各司其职
2. **智能缓存策略**：多级缓存架构，显著提升系统性能
3. **数据一致性保证**：事务处理和缓存失效机制确保数据一致性
4. **高可扩展性**：分片和读写分离支持大规模数据处理
5. **完善的监控**：全方位的性能监控和数据维护策略

### 技术特色
1. **智能索引设计**：针对查询模式优化的复合索引
2. **自动化运维**：备份恢复和数据清理的自动化脚本
3. **安全防护**：字段级加密和细粒度权限控制
4. **性能优化**：查询优化和缓存策略的深度结合

### 业务价值
1. **支撑个性化学习**：用户画像和推荐算法的数据基础
2. **实现智能路径生成**：知识图谱和学习数据的有机结合
3. **提供数据洞察**：完整的学习行为数据采集和分析
4. **保障系统稳定**：高可用和高性能的数据架构设计