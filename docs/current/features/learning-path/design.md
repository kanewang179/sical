# 学习路径功能详细设计

## 1. 系统架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    学习路径系统架构                          │
├─────────────────────────────────────────────────────────────┤
│  前端层 (Frontend Layer)                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 路径编辑器   │ │ 进度仪表板   │ │ 推荐界面     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  API网关层 (API Gateway)                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 路由 │ 认证 │ 限流 │ 监控 │ 缓存 │ 负载均衡        ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  业务服务层 (Business Service Layer)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 路径服务     │ │ 推荐服务     │ │ 进度服务     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 评估服务     │ │ 社交服务     │ │ 分析服务     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  算法引擎层 (Algorithm Engine Layer)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 路径生成引擎 │ │ 推荐引擎     │ │ 分析引擎     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  数据层 (Data Layer)                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ MongoDB     │ │ Redis       │ │ Elasticsearch│          │
│  │ (主数据库)   │ │ (缓存)      │ │ (搜索引擎)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 微服务架构

#### 1.2.1 路径管理服务 (Path Management Service)
- **职责**：学习路径的创建、编辑、删除、查询
- **核心功能**：
  - 路径CRUD操作
  - 路径模板管理
  - 路径版本控制
  - 路径分享和协作

#### 1.2.2 推荐服务 (Recommendation Service)
- **职责**：个性化内容推荐和路径推荐
- **核心功能**：
  - 协同过滤推荐
  - 内容基础推荐
  - 深度学习推荐
  - 实时推荐更新

#### 1.2.3 进度跟踪服务 (Progress Tracking Service)
- **职责**：学习进度记录和分析
- **核心功能**：
  - 学习行为记录
  - 进度计算和更新
  - 成就系统管理
  - 学习提醒服务

#### 1.2.4 能力评估服务 (Assessment Service)
- **职责**：用户能力评估和测试
- **核心功能**：
  - 多维度能力测试
  - 学习风格识别
  - 知识水平评估
  - 评估结果分析

#### 1.2.5 社交学习服务 (Social Learning Service)
- **职责**：学习小组和导师系统
- **核心功能**：
  - 学习小组管理
  - 导师匹配系统
  - 协作学习工具
  - 社交互动功能

#### 1.2.6 数据分析服务 (Analytics Service)
- **职责**：学习数据分析和报告生成
- **核心功能**：
  - 学习行为分析
  - 效果评估分析
  - 报告生成
  - 数据可视化

### 1.3 数据流架构

```
用户操作 → API网关 → 业务服务 → 算法引擎 → 数据存储
    ↓         ↓         ↓         ↓         ↓
事件总线 ← 消息队列 ← 数据处理 ← 实时计算 ← 数据同步
    ↓
通知服务 → 用户界面更新
```

---

## 2. 数据模型设计

### 2.1 核心数据实体

#### 2.1.1 学习路径 (LearningPath)
```javascript
{
  _id: ObjectId,
  title: String,                    // 路径标题
  description: String,              // 路径描述
  category: String,                 // 路径分类
  tags: [String],                   // 标签
  difficulty: String,               // 难度级别 (beginner/intermediate/advanced)
  estimatedDuration: Number,        // 预估学习时长(小时)
  
  // 路径结构
  structure: {
    nodes: [{
      id: String,                   // 节点ID
      type: String,                 // 节点类型 (knowledge/practice/assessment)
      title: String,                // 节点标题
      contentId: ObjectId,          // 关联内容ID
      position: { x: Number, y: Number }, // 节点位置
      estimatedTime: Number,        // 预估学习时间
      prerequisites: [String],      // 前置节点ID
      isOptional: Boolean,          // 是否可选
      metadata: Object              // 节点元数据
    }],
    edges: [{
      from: String,                 // 起始节点ID
      to: String,                   // 目标节点ID
      type: String,                 // 连接类型 (sequential/conditional/optional)
      condition: Object             // 连接条件
    }]
  },
  
  // 路径元信息
  creator: ObjectId,                // 创建者ID
  isPublic: Boolean,                // 是否公开
  isTemplate: Boolean,              // 是否为模板
  templateCategory: String,         // 模板分类
  
  // 统计信息
  stats: {
    enrollments: Number,            // 注册人数
    completions: Number,            // 完成人数
    averageRating: Number,          // 平均评分
    averageCompletionTime: Number,  // 平均完成时间
    successRate: Number             // 成功率
  },
  
  // 时间戳
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date
}
```

#### 2.1.2 用户学习进度 (UserProgress)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // 用户ID
  pathId: ObjectId,                 // 学习路径ID
  
  // 进度信息
  status: String,                   // 状态 (not_started/in_progress/completed/paused)
  overallProgress: Number,          // 整体进度百分比
  currentNodeId: String,            // 当前学习节点
  
  // 节点进度
  nodeProgress: [{
    nodeId: String,                 // 节点ID
    status: String,                 // 节点状态 (not_started/in_progress/completed/skipped)
    progress: Number,               // 节点进度百分比
    timeSpent: Number,              // 花费时间(分钟)
    attempts: Number,               // 尝试次数
    score: Number,                  // 得分
    completedAt: Date,              // 完成时间
    lastAccessedAt: Date            // 最后访问时间
  }],
  
  // 学习统计
  stats: {
    totalTimeSpent: Number,         // 总学习时间
    sessionsCount: Number,          // 学习会话数
    averageSessionTime: Number,     // 平均会话时间
    streakDays: Number,             // 连续学习天数
    lastStudyDate: Date             // 最后学习日期
  },
  
  // 个性化设置
  settings: {
    dailyGoal: Number,              // 每日学习目标(分钟)
    reminderTime: String,           // 提醒时间
    preferredDifficulty: String,    // 偏好难度
    learningPace: String            // 学习节奏 (slow/normal/fast)
  },
  
  // 时间戳
  startedAt: Date,
  lastUpdatedAt: Date,
  completedAt: Date
}
```

#### 2.1.3 用户画像 (UserProfile)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // 用户ID
  
  // 基础信息
  demographics: {
    age: Number,
    education: String,              // 教育背景
    profession: String,             // 职业
    experience: String              // 工作经验
  },
  
  // 学习特征
  learningCharacteristics: {
    learningStyle: String,          // 学习风格 (visual/auditory/kinesthetic)
    preferredContentType: [String], // 偏好内容类型
    attentionSpan: Number,          // 注意力持续时间
    learningPace: String,           // 学习节奏
    motivationType: String          // 激励类型
  },
  
  // 能力评估
  abilities: {
    domains: [{
      domain: String,               // 知识领域
      level: String,                // 能力级别
      score: Number,                // 评估分数
      assessedAt: Date              // 评估时间
    }],
    skills: [{
      skill: String,                // 技能名称
      proficiency: Number,          // 熟练度 (0-100)
      verifiedAt: Date              // 验证时间
    }]
  },
  
  // 学习目标
  goals: [{
    id: String,
    title: String,                  // 目标标题
    description: String,            // 目标描述
    category: String,               // 目标分类
    priority: String,               // 优先级 (high/medium/low)
    targetDate: Date,               // 目标日期
    status: String,                 // 状态 (active/completed/paused)
    progress: Number,               // 进度百分比
    createdAt: Date
  }],
  
  // 学习偏好
  preferences: {
    subjects: [String],             // 感兴趣的学科
    contentFormats: [String],       // 偏好的内容格式
    difficultyPreference: String,   // 难度偏好
    timePreference: {
      dailyTime: Number,            // 每日学习时间
      preferredHours: [Number],     // 偏好学习时段
      weekdayPreference: [Number]   // 偏好学习日
    }
  },
  
  // 更新时间
  lastUpdatedAt: Date,
  profileCompleteness: Number       // 画像完整度
}
```

#### 2.1.4 推荐记录 (RecommendationRecord)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // 用户ID
  type: String,                     // 推荐类型 (path/content/peer)
  
  // 推荐内容
  recommendations: [{
    itemId: ObjectId,               // 推荐项ID
    itemType: String,               // 推荐项类型
    score: Number,                  // 推荐分数
    reason: String,                 // 推荐理由
    algorithm: String,              // 推荐算法
    position: Number,               // 推荐位置
    
    // 用户反馈
    feedback: {
      clicked: Boolean,             // 是否点击
      liked: Boolean,               // 是否喜欢
      enrolled: Boolean,            // 是否注册
      completed: Boolean,           // 是否完成
      rating: Number,               // 用户评分
      feedbackAt: Date              // 反馈时间
    }
  }],
  
  // 推荐上下文
  context: {
    sessionId: String,              // 会话ID
    pageType: String,               // 页面类型
    userAction: String,             // 用户行为
    timeOfDay: String,              // 时间段
    deviceType: String              // 设备类型
  },
  
  // 时间戳
  generatedAt: Date,
  expiredAt: Date
}
```

### 2.2 关系模型

#### 2.2.1 知识图谱结构
```javascript
// 知识节点
{
  _id: ObjectId,
  name: String,                     // 知识点名称
  type: String,                     // 类型 (concept/skill/topic)
  domain: String,                   // 知识域
  description: String,              // 描述
  difficulty: Number,               // 难度级别 (1-10)
  
  // 关联关系
  prerequisites: [ObjectId],        // 前置知识点
  dependencies: [ObjectId],         // 依赖知识点
  related: [ObjectId],              // 相关知识点
  
  // 学习资源
  resources: [{
    resourceId: ObjectId,           // 资源ID
    resourceType: String,           // 资源类型
    relevance: Number               // 相关度
  }],
  
  // 统计信息
  stats: {
    learnerCount: Number,           // 学习者数量
    averageTime: Number,            // 平均学习时间
    successRate: Number             // 成功率
  }
}
```

---

## 3. 核心业务逻辑设计

### 3.1 智能路径生成算法

#### 3.1.1 路径生成流程
```javascript
class PathGenerationEngine {
  async generatePath(userId, goals, constraints) {
    // 1. 获取用户画像
    const userProfile = await this.getUserProfile(userId);
    
    // 2. 分析学习目标
    const analyzedGoals = await this.analyzeGoals(goals);
    
    // 3. 构建知识图谱
    const knowledgeGraph = await this.buildKnowledgeGraph(analyzedGoals);
    
    // 4. 生成候选路径
    const candidatePaths = await this.generateCandidatePaths(
      knowledgeGraph, 
      userProfile, 
      constraints
    );
    
    // 5. 路径优化和排序
    const optimizedPaths = await this.optimizePaths(
      candidatePaths, 
      userProfile
    );
    
    // 6. 选择最佳路径
    const bestPath = this.selectBestPath(optimizedPaths);
    
    // 7. 个性化调整
    const personalizedPath = await this.personalizePath(
      bestPath, 
      userProfile
    );
    
    return personalizedPath;
  }
  
  async analyzeGoals(goals) {
    return goals.map(goal => ({
      ...goal,
      complexity: this.calculateComplexity(goal),
      requiredSkills: this.extractRequiredSkills(goal),
      estimatedTime: this.estimateTime(goal),
      priority: this.calculatePriority(goal)
    }));
  }
  
  async buildKnowledgeGraph(goals) {
    const allSkills = goals.flatMap(g => g.requiredSkills);
    const graph = new KnowledgeGraph();
    
    for (const skill of allSkills) {
      await graph.addSkillWithDependencies(skill);
    }
    
    return graph;
  }
  
  async generateCandidatePaths(graph, profile, constraints) {
    const pathFinder = new PathFinder(graph);
    const startNodes = this.identifyStartNodes(profile);
    const endNodes = this.identifyEndNodes(profile.goals);
    
    const paths = [];
    for (const start of startNodes) {
      for (const end of endNodes) {
        const candidatePaths = await pathFinder.findPaths(
          start, 
          end, 
          constraints
        );
        paths.push(...candidatePaths);
      }
    }
    
    return paths;
  }
}
```

#### 3.1.2 多目标优化算法
```javascript
class PathOptimizer {
  optimizePaths(paths, userProfile) {
    return paths.map(path => {
      const score = this.calculatePathScore(path, userProfile);
      return { ...path, score };
    }).sort((a, b) => b.score - a.score);
  }
  
  calculatePathScore(path, profile) {
    const weights = {
      timeEfficiency: 0.3,
      difficultyMatch: 0.25,
      contentPreference: 0.2,
      learningStyleMatch: 0.15,
      goalAlignment: 0.1
    };
    
    const scores = {
      timeEfficiency: this.calculateTimeEfficiency(path, profile),
      difficultyMatch: this.calculateDifficultyMatch(path, profile),
      contentPreference: this.calculateContentPreference(path, profile),
      learningStyleMatch: this.calculateLearningStyleMatch(path, profile),
      goalAlignment: this.calculateGoalAlignment(path, profile)
    };
    
    return Object.entries(weights).reduce(
      (total, [key, weight]) => total + scores[key] * weight,
      0
    );
  }
  
  calculateTimeEfficiency(path, profile) {
    const estimatedTime = path.nodes.reduce(
      (total, node) => total + node.estimatedTime, 
      0
    );
    const availableTime = profile.preferences.timePreference.dailyTime * 30; // 月度可用时间
    
    return Math.max(0, 1 - (estimatedTime / availableTime));
  }
  
  calculateDifficultyMatch(path, profile) {
    const pathDifficulty = this.calculateAverageDifficulty(path);
    const userLevel = this.getUserLevel(profile);
    const difficultyGap = Math.abs(pathDifficulty - userLevel);
    
    return Math.max(0, 1 - (difficultyGap / 10));
  }
}
```

### 3.2 个性化推荐系统

#### 3.2.1 协同过滤推荐
```javascript
class CollaborativeFiltering {
  async generateRecommendations(userId, itemType = 'path') {
    // 1. 获取用户行为数据
    const userBehavior = await this.getUserBehavior(userId);
    
    // 2. 计算用户相似度
    const similarUsers = await this.findSimilarUsers(userId, userBehavior);
    
    // 3. 生成推荐
    const recommendations = await this.generateFromSimilarUsers(
      similarUsers, 
      userBehavior, 
      itemType
    );
    
    return recommendations;
  }
  
  async findSimilarUsers(userId, userBehavior) {
    const allUsers = await this.getAllUserBehaviors();
    const similarities = [];
    
    for (const otherUser of allUsers) {
      if (otherUser.userId === userId) continue;
      
      const similarity = this.calculateCosineSimilarity(
        userBehavior, 
        otherUser.behavior
      );
      
      if (similarity > 0.3) { // 相似度阈值
        similarities.push({
          userId: otherUser.userId,
          similarity
        });
      }
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50); // 取前50个相似用户
  }
  
  calculateCosineSimilarity(behaviorA, behaviorB) {
    const itemsA = new Set(Object.keys(behaviorA));
    const itemsB = new Set(Object.keys(behaviorB));
    const commonItems = new Set([...itemsA].filter(x => itemsB.has(x)));
    
    if (commonItems.size === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (const item of commonItems) {
      dotProduct += behaviorA[item] * behaviorB[item];
      normA += behaviorA[item] ** 2;
      normB += behaviorB[item] ** 2;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
```

#### 3.2.2 内容基础推荐
```javascript
class ContentBasedRecommendation {
  async generateRecommendations(userId, itemType = 'path') {
    // 1. 获取用户偏好
    const userPreferences = await this.getUserPreferences(userId);
    
    // 2. 获取候选内容
    const candidateItems = await this.getCandidateItems(itemType);
    
    // 3. 计算内容相似度
    const scoredItems = candidateItems.map(item => ({
      ...item,
      score: this.calculateContentSimilarity(item, userPreferences)
    }));
    
    // 4. 排序和过滤
    return scoredItems
      .filter(item => item.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }
  
  calculateContentSimilarity(item, preferences) {
    const features = {
      category: this.calculateCategorySimilarity(item.category, preferences.subjects),
      difficulty: this.calculateDifficultySimilarity(item.difficulty, preferences.difficultyPreference),
      format: this.calculateFormatSimilarity(item.format, preferences.contentFormats),
      tags: this.calculateTagSimilarity(item.tags, preferences.interests)
    };
    
    const weights = { category: 0.4, difficulty: 0.3, format: 0.2, tags: 0.1 };
    
    return Object.entries(weights).reduce(
      (total, [key, weight]) => total + features[key] * weight,
      0
    );
  }
}
```

### 3.3 学习进度跟踪系统

#### 3.3.1 进度计算引擎
```javascript
class ProgressTracker {
  async updateProgress(userId, pathId, nodeId, progressData) {
    // 1. 更新节点进度
    await this.updateNodeProgress(userId, pathId, nodeId, progressData);
    
    // 2. 重新计算整体进度
    const overallProgress = await this.calculateOverallProgress(userId, pathId);
    
    // 3. 更新用户进度记录
    await this.updateUserProgress(userId, pathId, {
      overallProgress,
      lastUpdatedAt: new Date()
    });
    
    // 4. 检查里程碑和成就
    await this.checkMilestones(userId, pathId, overallProgress);
    
    // 5. 触发相关事件
    await this.triggerProgressEvents(userId, pathId, progressData);
    
    return overallProgress;
  }
  
  async calculateOverallProgress(userId, pathId) {
    const userProgress = await this.getUserProgress(userId, pathId);
    const path = await this.getLearningPath(pathId);
    
    let totalWeight = 0;
    let completedWeight = 0;
    
    for (const node of path.structure.nodes) {
      const nodeProgress = userProgress.nodeProgress.find(
        np => np.nodeId === node.id
      );
      
      const weight = node.isOptional ? 0.5 : 1.0;
      totalWeight += weight;
      
      if (nodeProgress && nodeProgress.status === 'completed') {
        completedWeight += weight;
      } else if (nodeProgress && nodeProgress.status === 'in_progress') {
        completedWeight += weight * (nodeProgress.progress / 100);
      }
    }
    
    return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  }
  
  async checkMilestones(userId, pathId, progress) {
    const milestones = [25, 50, 75, 100]; // 里程碑百分比
    const userProgress = await this.getUserProgress(userId, pathId);
    
    for (const milestone of milestones) {
      if (progress >= milestone && 
          !userProgress.achievedMilestones?.includes(milestone)) {
        
        await this.awardMilestone(userId, pathId, milestone);
        await this.sendMilestoneNotification(userId, milestone);
      }
    }
  }
}
```

#### 3.3.2 学习分析引擎
```javascript
class LearningAnalytics {
  async analyzeLearningPattern(userId, timeRange = '30d') {
    const learningData = await this.getLearningData(userId, timeRange);
    
    return {
      studyHabits: this.analyzeStudyHabits(learningData),
      learningEfficiency: this.calculateLearningEfficiency(learningData),
      difficultyProgression: this.analyzeDifficultyProgression(learningData),
      contentPreferences: this.analyzeContentPreferences(learningData),
      recommendations: this.generateImprovementRecommendations(learningData)
    };
  }
  
  analyzeStudyHabits(data) {
    const sessions = data.sessions;
    
    return {
      averageSessionLength: this.calculateAverageSessionLength(sessions),
      preferredStudyTimes: this.identifyPreferredStudyTimes(sessions),
      studyFrequency: this.calculateStudyFrequency(sessions),
      consistencyScore: this.calculateConsistencyScore(sessions),
      peakPerformanceTime: this.identifyPeakPerformanceTime(sessions)
    };
  }
  
  calculateLearningEfficiency(data) {
    const completions = data.completions;
    
    return {
      timeToCompletion: this.calculateAverageTimeToCompletion(completions),
      retentionRate: this.calculateRetentionRate(completions),
      errorRate: this.calculateErrorRate(completions),
      improvementTrend: this.calculateImprovementTrend(completions)
    };
  }
  
  generateImprovementRecommendations(data) {
    const recommendations = [];
    
    // 基于学习习惯的建议
    if (data.sessions.length < 10) {
      recommendations.push({
        type: 'habit',
        message: '建议增加学习频率，保持每周至少3次学习',
        priority: 'high'
      });
    }
    
    // 基于学习效率的建议
    const efficiency = this.calculateLearningEfficiency(data);
    if (efficiency.retentionRate < 0.7) {
      recommendations.push({
        type: 'retention',
        message: '建议增加复习频率，巩固已学知识',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
}
```

---

## 4. 接口设计

### 4.1 RESTful API设计

#### 4.1.1 学习路径管理接口
```javascript
// 创建学习路径
POST /api/v1/learning-paths
{
  "title": "Python数据科学入门",
  "description": "从零开始学习Python数据科学",
  "category": "data-science",
  "difficulty": "beginner",
  "estimatedDuration": 120,
  "structure": {
    "nodes": [...],
    "edges": [...]
  },
  "isPublic": true
}

// 获取学习路径详情
GET /api/v1/learning-paths/{pathId}

// 更新学习路径
PUT /api/v1/learning-paths/{pathId}

// 删除学习路径
DELETE /api/v1/learning-paths/{pathId}

// 获取用户的学习路径列表
GET /api/v1/users/{userId}/learning-paths

// 搜索学习路径
GET /api/v1/learning-paths/search?q={query}&category={category}&difficulty={difficulty}
```

#### 4.1.2 智能推荐接口
```javascript
// 生成个性化学习路径
POST /api/v1/recommendations/generate-path
{
  "goals": [
    {
      "title": "掌握机器学习基础",
      "category": "machine-learning",
      "priority": "high",
      "targetDate": "2024-06-01"
    }
  ],
  "constraints": {
    "maxDuration": 100,
    "preferredDifficulty": "intermediate",
    "availableTime": 2
  }
}

// 获取内容推荐
GET /api/v1/recommendations/content?type={type}&limit={limit}

// 获取相似用户推荐
GET /api/v1/recommendations/similar-users

// 推荐反馈
POST /api/v1/recommendations/{recommendationId}/feedback
{
  "action": "clicked",
  "rating": 4,
  "feedback": "很有帮助"
}
```

#### 4.1.3 学习进度接口
```javascript
// 更新学习进度
POST /api/v1/progress/update
{
  "pathId": "path123",
  "nodeId": "node456",
  "progress": 75,
  "timeSpent": 30,
  "score": 85
}

// 获取学习进度
GET /api/v1/users/{userId}/progress/{pathId}

// 获取学习统计
GET /api/v1/users/{userId}/analytics?timeRange={range}

// 获取学习报告
GET /api/v1/users/{userId}/reports/learning?format={format}
```

### 4.2 WebSocket接口设计

#### 4.2.1 实时进度更新
```javascript
// 连接WebSocket
ws://api.sical.com/ws/progress/{userId}

// 进度更新事件
{
  "type": "progress_updated",
  "data": {
    "pathId": "path123",
    "nodeId": "node456",
    "progress": 75,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// 里程碑达成事件
{
  "type": "milestone_achieved",
  "data": {
    "pathId": "path123",
    "milestone": 50,
    "badge": "halfway_hero",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// 学习提醒事件
{
  "type": "study_reminder",
  "data": {
    "message": "该学习了！今天的目标是完成Python基础语法",
    "pathId": "path123",
    "nextNodeId": "node789"
  }
}
```

---

## 5. 缓存策略设计

### 5.1 多级缓存架构

```
┌─────────────────────────────────────────────────────────────┐
│                    缓存层级架构                              │
├─────────────────────────────────────────────────────────────┤
│  L1: 浏览器缓存 (Browser Cache)                             │
│  ├─ 静态资源缓存 (24小时)                                   │
│  ├─ API响应缓存 (5分钟)                                     │
│  └─ 用户会话缓存 (会话期间)                                 │
├─────────────────────────────────────────────────────────────┤
│  L2: CDN缓存 (CDN Cache)                                    │
│  ├─ 静态资源 (7天)                                          │
│  ├─ 公共API响应 (1小时)                                     │
│  └─ 图片和媒体文件 (30天)                                   │
├─────────────────────────────────────────────────────────────┤
│  L3: 应用缓存 (Redis Cache)                                 │
│  ├─ 用户会话 (30分钟)                                       │
│  ├─ 学习路径数据 (1小时)                                    │
│  ├─ 推荐结果 (15分钟)                                       │
│  ├─ 用户进度 (实时更新)                                     │
│  └─ 热门内容 (6小时)                                        │
├─────────────────────────────────────────────────────────────┤
│  L4: 数据库缓存 (Database Cache)                            │
│  ├─ 查询结果缓存                                            │
│  ├─ 索引缓存                                                │
│  └─ 连接池缓存                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 缓存策略配置

#### 5.2.1 Redis缓存配置
```javascript
const cacheConfig = {
  // 用户相关缓存
  user: {
    profile: { ttl: 3600, key: 'user:profile:{userId}' },
    progress: { ttl: 300, key: 'user:progress:{userId}:{pathId}' },
    preferences: { ttl: 7200, key: 'user:preferences:{userId}' }
  },
  
  // 学习路径缓存
  path: {
    details: { ttl: 3600, key: 'path:details:{pathId}' },
    structure: { ttl: 7200, key: 'path:structure:{pathId}' },
    stats: { ttl: 1800, key: 'path:stats:{pathId}' }
  },
  
  // 推荐系统缓存
  recommendation: {
    content: { ttl: 900, key: 'rec:content:{userId}' },
    path: { ttl: 1800, key: 'rec:path:{userId}' },
    similar: { ttl: 3600, key: 'rec:similar:{userId}' }
  },
  
  // 分析数据缓存
  analytics: {
    userStats: { ttl: 1800, key: 'analytics:user:{userId}' },
    pathStats: { ttl: 3600, key: 'analytics:path:{pathId}' },
    globalStats: { ttl: 7200, key: 'analytics:global' }
  }
};
```

#### 5.2.2 缓存更新策略
```javascript
class CacheManager {
  async updateUserProgress(userId, pathId, progressData) {
    // 1. 更新数据库
    await this.database.updateProgress(userId, pathId, progressData);
    
    // 2. 更新缓存
    const cacheKey = `user:progress:${userId}:${pathId}`;
    await this.redis.setex(cacheKey, 300, JSON.stringify(progressData));
    
    // 3. 失效相关缓存
    await this.invalidateRelatedCache(userId, pathId);
    
    // 4. 通知其他服务
    await this.publishProgressUpdate(userId, pathId, progressData);
  }
  
  async invalidateRelatedCache(userId, pathId) {
    const keysToInvalidate = [
      `analytics:user:${userId}`,
      `analytics:path:${pathId}`,
      `rec:content:${userId}`,
      `path:stats:${pathId}`
    ];
    
    await Promise.all(
      keysToInvalidate.map(key => this.redis.del(key))
    );
  }
}
```

---

## 6. 监控和日志设计

### 6.1 性能监控指标

#### 6.1.1 业务指标监控
```javascript
const businessMetrics = {
  // 用户行为指标
  userEngagement: {
    dailyActiveUsers: 'gauge',
    pathCreations: 'counter',
    pathCompletions: 'counter',
    averageSessionTime: 'histogram',
    userRetentionRate: 'gauge'
  },
  
  // 学习效果指标
  learningEffectiveness: {
    averageCompletionTime: 'histogram',
    knowledgeRetentionRate: 'gauge',
    skillImprovementScore: 'histogram',
    learningGoalAchievementRate: 'gauge'
  },
  
  // 推荐系统指标
  recommendationPerformance: {
    recommendationClickRate: 'gauge',
    recommendationConversionRate: 'gauge',
    recommendationAccuracy: 'gauge',
    recommendationDiversity: 'gauge'
  }
};
```

#### 6.1.2 技术指标监控
```javascript
const technicalMetrics = {
  // API性能指标
  apiPerformance: {
    responseTime: 'histogram',
    throughput: 'counter',
    errorRate: 'gauge',
    availabilityRate: 'gauge'
  },
  
  // 算法性能指标
  algorithmPerformance: {
    pathGenerationTime: 'histogram',
    recommendationGenerationTime: 'histogram',
    algorithmAccuracy: 'gauge',
    modelTrainingTime: 'histogram'
  },
  
  // 系统资源指标
  systemResources: {
    cpuUsage: 'gauge',
    memoryUsage: 'gauge',
    diskUsage: 'gauge',
    networkLatency: 'histogram'
  }
};
```

### 6.2 日志系统设计

#### 6.2.1 结构化日志格式
```javascript
const logFormat = {
  timestamp: '2024-01-15T10:30:00.123Z',
  level: 'INFO',
  service: 'learning-path-service',
  traceId: 'abc123def456',
  userId: 'user789',
  action: 'path_generation',
  message: 'Generated learning path successfully',
  metadata: {
    pathId: 'path123',
    generationTime: 2.5,
    algorithmsUsed: ['collaborative_filtering', 'content_based'],
    userProfile: {
      level: 'intermediate',
      preferences: ['python', 'data-science']
    }
  },
  performance: {
    duration: 2500,
    memoryUsage: 45.2,
    cpuUsage: 12.8
  }
};
```

#### 6.2.2 日志分类和处理
```javascript
class LoggingService {
  // 业务日志
  logBusinessEvent(event, metadata) {
    this.logger.info({
      category: 'business',
      event: event,
      metadata: metadata,
      timestamp: new Date().toISOString()
    });
  }
  
  // 性能日志
  logPerformance(operation, duration, metadata) {
    this.logger.info({
      category: 'performance',
      operation: operation,
      duration: duration,
      metadata: metadata,
      timestamp: new Date().toISOString()
    });
  }
  
  // 错误日志
  logError(error, context) {
    this.logger.error({
      category: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context: context,
      timestamp: new Date().toISOString()
    });
  }
  
  // 安全日志
  logSecurityEvent(event, userId, metadata) {
    this.logger.warn({
      category: 'security',
      event: event,
      userId: userId,
      metadata: metadata,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 7. 部署和运维设计

### 7.1 容器化部署

#### 7.1.1 Docker配置
```dockerfile
# 学习路径服务 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/
COPY config/ ./config/

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 7.1.2 Kubernetes部署配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: learning-path-service
  labels:
    app: learning-path-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: learning-path-service
  template:
    metadata:
      labels:
        app: learning-path-service
    spec:
      containers:
      - name: learning-path-service
        image: sical/learning-path-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: mongodb-uri
        - name: REDIS_URI
          valueFrom:
            secretKeyRef:
              name: cache-secret
              key: redis-uri
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 7.2 扩展性设计

#### 7.2.1 水平扩展策略
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: learning-path-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: learning-path-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

---

## 8. 总结

本设计文档详细阐述了学习路径功能的技术架构和实现方案，主要特点包括：

### 8.1 架构优势
- **微服务架构**：模块化设计，易于维护和扩展
- **智能算法**：多种推荐算法结合，提供精准的个性化服务
- **实时处理**：支持实时进度跟踪和动态路径调整
- **高可用性**：多级缓存和容器化部署确保系统稳定性

### 8.2 技术特色
- **知识图谱**：基于知识图谱的路径生成算法
- **多目标优化**：平衡时间、难度、偏好等多个因素
- **机器学习**：集成多种机器学习算法提升推荐效果
- **数据驱动**：全面的数据分析和监控体系

### 8.3 用户价值
- **个性化体验**：根据用户特征提供定制化学习方案
- **学习效率**：智能路径规划提升学习效果
- **进度可视化**：直观的进度跟踪和成就系统
- **社交学习**：支持协作学习和导师指导

该设计为SICAL平台的学习路径功能提供了坚实的技术基础，确保系统能够为用户提供高质量的个性化学习体验。