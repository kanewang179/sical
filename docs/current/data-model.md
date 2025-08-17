# SiCal - 医学与药学可视化学习系统数据模型设计

## 1. 数据库选择

本系统采用MongoDB作为主数据库，Redis作为缓存数据库。选择MongoDB的主要原因是：

1. **灵活的数据模型**：医学和药学知识结构复杂多变，MongoDB的文档模型能够灵活存储不同结构的数据
2. **良好的扩展性**：支持水平扩展，能够应对数据量增长
3. **JSON格式**：与前端数据交换格式一致，减少转换成本
4. **丰富的查询能力**：支持地理空间查询、全文搜索等高级功能
5. **适合存储多媒体元数据**：适合管理3D模型、图像、视频等多媒体资源的元数据

## 2. 数据库集合设计

### 2.1 用户相关集合

#### 2.1.1 用户集合 (users)

存储用户基本信息和认证数据。

```javascript
{
  _id: ObjectId,                // 用户唯一标识
  username: String,             // 用户名
  email: String,                // 电子邮箱
  password: String,             // 密码哈希
  salt: String,                 // 密码盐
  profile: {                    // 用户资料
    name: String,               // 真实姓名
    avatar: String,             // 头像URL
    bio: String,                // 个人简介
    profession: String,         // 职业
    education: String,          // 教育背景
    location: String            // 所在地
  },
  roles: [String],              // 用户角色，如 ['student', 'teacher']
  preferences: {                // 用户偏好设置
    theme: String,              // 界面主题
    notification_settings: {    // 通知设置
      email: Boolean,           // 是否接收邮件通知
      push: Boolean,            // 是否接收推送通知
      sms: Boolean              // 是否接收短信通知
    },
    learning_preferences: {     // 学习偏好
      difficulty_level: String, // 难度级别
      topics_of_interest: [String], // 感兴趣的主题
      learning_style: String    // 学习风格
    }
  },
  stats: {                      // 用户统计数据
    total_learning_time: Number,  // 总学习时间(分钟)
    completed_knowledge_count: Number, // 已完成知识点数量
    completed_quiz_count: Number,  // 已完成测试数量
    average_score: Number,      // 平均测试分数
    streak_days: Number         // 连续学习天数
  },
  social: {                     // 社交信息
    followers: [ObjectId],      // 关注者
    following: [ObjectId],      // 关注的用户
    reputation: Number          // 声誉值
  },
  verification: {               // 验证信息
    email_verified: Boolean,    // 邮箱是否验证
    verification_token: String, // 验证令牌
    token_expires: Date         // 令牌过期时间
  },
  oauth: {                      // 第三方登录信息
    provider: String,           // 提供商
    id: String,                 // 第三方ID
    token: String               // 访问令牌
  },
  status: String,               // 账号状态：active, suspended, deleted
  created_at: Date,             // 创建时间
  updated_at: Date,             // 更新时间
  last_login: Date              // 最后登录时间
}
```

#### 2.1.2 用户学习进度集合 (user_progress)

跟踪用户的学习进度和成绩。

```javascript
{
  _id: ObjectId,                // 进度记录唯一标识
  user_id: ObjectId,            // 用户ID
  learning_path_id: ObjectId,   // 学习路径ID
  completed_nodes: [String],    // 已完成的节点ID
  current_node: String,         // 当前学习节点ID
  completion_percentage: Number, // 完成百分比
  knowledge_progress: [         // 知识点学习进度
    {
      knowledge_id: ObjectId,  // 知识点ID
      status: String,           // 状态：not_started, in_progress, completed
      completion_percentage: Number, // 完成百分比
      last_accessed: Date,      // 最后访问时间
      time_spent: Number,       // 花费时间(秒)
      notes: String,            // 个人笔记
      bookmarked: Boolean       // 是否收藏
    }
  ],
  quiz_results: [               // 测试结果
    {
      quiz_id: ObjectId,       // 测试ID
      score: Number,            // 分数
      correct_count: Number,    // 正确题目数
      total_count: Number,      // 总题目数
      completed_at: Date,       // 完成时间
      time_spent: Number,       // 花费时间(秒)
      answers: [                // 答案记录
        {
          question_id: String,  // 问题ID
          user_answer: Mixed,    // 用户答案
          is_correct: Boolean,   // 是否正确
          time_spent: Number     // 花费时间(秒)
        }
      ]
    }
  ],
  achievements: [ObjectId],     // 获得的成就ID
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

#### 2.1.3 用户活动日志集合 (user_activities)

记录用户的学习活动和行为。

```javascript
{
  _id: ObjectId,                // 活动记录唯一标识
  user_id: ObjectId,            // 用户ID
  activity_type: String,        // 活动类型：view_knowledge, complete_quiz, create_note, etc.
  resource_type: String,        // 资源类型：knowledge, quiz, note, discussion, etc.
  resource_id: ObjectId,        // 资源ID
  details: {                    // 活动详情
    action: String,             // 具体动作
    result: Mixed,              // 结果
    metadata: Mixed             // 元数据
  },
  device_info: {                // 设备信息
    device_type: String,        // 设备类型
    browser: String,            // 浏览器
    os: String,                 // 操作系统
    ip: String                  // IP地址
  },
  created_at: Date              // 创建时间
}
```

### 2.2 知识库相关集合

#### 2.2.1 知识点集合 (knowledge)

存储医学和药学知识点内容。

```javascript
{
  _id: ObjectId,                // 知识点唯一标识
  title: String,                // 标题
  slug: String,                 // URL友好的标识
  description: String,          // 简短描述
  content: String,              // 详细内容(HTML/Markdown)
  category: String,             // 主分类
  subcategory: String,          // 子分类
  tags: [String],               // 标签
  difficulty_level: String,     // 难度级别：beginner, intermediate, advanced
  estimated_time: Number,       // 预计学习时间(分钟)
  media: [                      // 多媒体资源
    {
      type: String,            // 类型：image, video, model, document
      url: String,              // 资源URL
      thumbnail: String,        // 缩略图URL
      title: String,            // 标题
      description: String,      // 描述
      order: Number             // 排序
    }
  ],
  models: [                     // 关联的3D模型
    {
      model_id: ObjectId,      // 模型ID
      annotations: [            // 模型上的标注
        {
          position: {          // 标注位置
            x: Number,
            y: Number,
            z: Number
          },
          title: String,        // 标注标题
          description: String,  // 标注描述
          highlight_color: String // 高亮颜色
        }
      ]
    }
  ],
  related_knowledge: [          // 相关知识点
    {
      knowledge_id: ObjectId,  // 知识点ID
      relationship_type: String // 关系类型：prerequisite, related, next
    }
  ],
  prerequisites: [ObjectId],    // 前置知识点
  references: [                 // 参考资料
    {
      title: String,           // 标题
      url: String,              // URL
      authors: String,          // 作者
      publication: String,      // 出版物
      year: Number              // 年份
    }
  ],
  metadata: {                   // 元数据
    keywords: [String],         // 关键词
    importance: Number,         // 重要性(1-10)
    review_frequency: String    // 复习频率建议
  },
  stats: {                      // 统计数据
    views: Number,              // 查看次数
    likes: Number,              // 点赞数
    shares: Number,             // 分享数
    completion_rate: Number,    // 完成率
    average_rating: Number      // 平均评分
  },
  author: ObjectId,             // 作者ID
  contributors: [ObjectId],     // 贡献者ID
  review_status: String,        // 审核状态：draft, under_review, published, archived
  version: Number,              // 版本号
  created_at: Date,             // 创建时间
  updated_at: Date,             // 更新时间
  published_at: Date            // 发布时间
}
```

#### 2.2.2 3D模型集合 (models)

存储3D模型的元数据和关联信息。

```javascript
{
  _id: ObjectId,                // 模型唯一标识
  name: String,                 // 模型名称
  description: String,          // 描述
  category: String,             // 分类
  type: String,                 // 类型：anatomy, molecule, mechanism
  file_url: String,             // 模型文件URL
  thumbnail_url: String,        // 缩略图URL
  format: String,               // 文件格式：glb, gltf, obj
  size: Number,                 // 文件大小(bytes)
  metadata: {                   // 元数据
    vertices: Number,           // 顶点数
    polygons: Number,           // 多边形数
    textures: Number,           // 纹理数
    materials: Number,          // 材质数
    scale: Number,              // 比例
    units: String               // 单位
  },
  default_settings: {           // 默认设置
    position: {                 // 位置
      x: Number,
      y: Number,
      z: Number
    },
    rotation: {                 // 旋转
      x: Number,
      y: Number,
      z: Number
    },
    scale: {                    // 缩放
      x: Number,
      y: Number,
      z: Number
    },
    camera_position: {          // 相机位置
      x: Number,
      y: Number,
      z: Number
    }
  },
  annotations: [                // 模型标注
    {
      id: String,              // 标注ID
      position: {               // 标注位置
        x: Number,
        y: Number,
        z: Number
      },
      title: String,            // 标注标题
      description: String,      // 标注描述
      knowledge_id: ObjectId,   // 关联的知识点
      color: String,            // 标注颜色
      icon: String              // 标注图标
    }
  ],
  layers: [                     // 模型层级
    {
      id: String,              // 层ID
      name: String,             // 层名称
      visible: Boolean,         // 是否可见
      color: String,            // 颜色
      opacity: Number,          // 透明度
      parts: [String]           // 包含的部件ID
    }
  ],
  parts: [                      // 模型部件
    {
      id: String,              // 部件ID
      name: String,             // 部件名称
      description: String,      // 描述
      knowledge_id: ObjectId,   // 关联的知识点
      highlight_color: String   // 高亮颜色
    }
  ],
  animations: [                 // 动画
    {
      id: String,              // 动画ID
      name: String,             // 动画名称
      description: String,      // 描述
      duration: Number,         // 持续时间(秒)
      keyframes: Mixed          // 关键帧数据
    }
  ],
  related_knowledge: [ObjectId], // 关联的知识点
  author: ObjectId,             // 作者ID
  license: String,              // 许可证
  source: String,               // 来源
  version: Number,              // 版本号
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

#### 2.2.3 分类集合 (categories)

存储知识分类和层级结构。

```javascript
{
  _id: ObjectId,                // 分类唯一标识
  name: String,                 // 分类名称
  slug: String,                 // URL友好的标识
  description: String,          // 描述
  parent_id: ObjectId,          // 父分类ID
  level: Number,                // 层级深度
  path: [ObjectId],             // 分类路径
  icon: String,                 // 图标
  color: String,                // 颜色
  order: Number,                // 排序
  metadata: {                   // 元数据
    knowledge_count: Number,    // 知识点数量
    model_count: Number,        // 模型数量
    quiz_count: Number          // 测试数量
  },
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

### 2.3 学习路径相关集合

#### 2.3.1 学习路径集合 (learning_paths)

存储学习路径和知识图谱。

```javascript
{
  _id: ObjectId,                // 学习路径唯一标识
  title: String,                // 标题
  slug: String,                 // URL友好的标识
  description: String,          // 描述
  category: String,             // 分类
  difficulty_level: String,     // 难度级别
  estimated_hours: Number,      // 预计完成时间(小时)
  thumbnail: String,            // 缩略图URL
  nodes: [                      // 节点
    {
      id: String,              // 节点ID
      title: String,            // 标题
      description: String,      // 描述
      type: String,             // 类型：knowledge, quiz, practice
      resource_id: ObjectId,    // 资源ID
      position: {               // 位置
        x: Number,
        y: Number
      },
      status: String,           // 状态：required, optional
      estimated_time: Number,   // 预计时间(分钟)
      prerequisites: [String],  // 前置节点ID
      metadata: {               // 元数据
        importance: Number,     // 重要性
        difficulty: Number      // 难度
      }
    }
  ],
  edges: [                      // 边
    {
      source: String,          // 源节点ID
      target: String,           // 目标节点ID
      label: String,            // 标签
      type: String              // 类型：prerequisite, recommended, optional
    }
  ],
  tags: [String],               // 标签
  stats: {                      // 统计数据
    enrolled_count: Number,     // 参与人数
    completion_rate: Number,    // 完成率
    average_rating: Number,     // 平均评分
    review_count: Number        // 评价数量
  },
  author: ObjectId,             // 作者ID
  contributors: [ObjectId],     // 贡献者ID
  status: String,               // 状态：draft, published, archived
  version: Number,              // 版本号
  created_at: Date,             // 创建时间
  updated_at: Date,             // 更新时间
  published_at: Date            // 发布时间
}
```

#### 2.3.2 学习计划集合 (learning_plans)

存储用户的个性化学习计划。

```javascript
{
  _id: ObjectId,                // 学习计划唯一标识
  user_id: ObjectId,            // 用户ID
  title: String,                // 标题
  description: String,          // 描述
  learning_path_id: ObjectId,   // 关联的学习路径
  start_date: Date,             // 开始日期
  end_date: Date,               // 结束日期
  schedule: [                   // 学习安排
    {
      day: Number,             // 天数
      date: Date,               // 日期
      nodes: [String],          // 计划学习的节点ID
      estimated_time: Number,   // 预计学习时间(分钟)
      completed: Boolean,       // 是否完成
      actual_time: Number       // 实际学习时间(分钟)
    }
  ],
  goals: [                      // 学习目标
    {
      description: String,      // 描述
      target_date: Date,        // 目标日期
      completed: Boolean,       // 是否完成
      completed_date: Date      // 完成日期
    }
  ],
  reminders: [                  // 提醒设置
    {
      time: String,            // 时间
      days: [Number],           // 星期几
      enabled: Boolean          // 是否启用
    }
  ],
  status: String,               // 状态：active, paused, completed, abandoned
  progress: {                   // 进度
    completed_days: Number,     // 已完成天数
    total_days: Number,         // 总天数
    completed_nodes: Number,    // 已完成节点数
    total_nodes: Number,        // 总节点数
    completion_percentage: Number // 完成百分比
  },
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

### 2.4 测评相关集合

#### 2.4.1 测试集合 (quizzes)

存储测试和题库。

```javascript
{
  _id: ObjectId,                // 测试唯一标识
  title: String,                // 标题
  description: String,          // 描述
  category: String,             // 分类
  subcategory: String,          // 子分类
  tags: [String],               // 标签
  difficulty_level: String,     // 难度级别
  time_limit: Number,           // 时间限制(分钟)
  passing_score: Number,        // 及格分数
  total_points: Number,         // 总分
  randomize_questions: Boolean, // 是否随机题目顺序
  show_answers: String,         // 显示答案方式：after_each, after_submit, never
  questions: [                  // 题目
    {
      id: String,              // 题目ID
      type: String,             // 类型：multiple_choice, true_false, matching, fill_blank, short_answer
      content: String,          // 题目内容
      media: [                  // 多媒体
        {
          type: String,        // 类型
          url: String,          // URL
          caption: String        // 说明
        }
      ],
      options: [                // 选项(用于选择题)
        {
          id: String,          // 选项ID
          text: String,         // 选项文本
          is_correct: Boolean   // 是否正确
        }
      ],
      matches: [                // 匹配项(用于匹配题)
        {
          left: String,        // 左侧项
          right: String         // 右侧项
        }
      ],
      correct_answer: Mixed,    // 正确答案
      explanation: String,      // 解析
      knowledge_id: ObjectId,   // 关联的知识点
      difficulty: Number,       // 难度(1-10)
      points: Number,           // 分值
      time_estimate: Number     // 预计答题时间(秒)
    }
  ],
  related_knowledge: [ObjectId], // 关联的知识点
  stats: {                      // 统计数据
    attempt_count: Number,      // 尝试次数
    average_score: Number,      // 平均分数
    completion_rate: Number,    // 完成率
    average_time: Number        // 平均完成时间(秒)
  },
  author: ObjectId,             // 作者ID
  status: String,               // 状态：draft, published, archived
  version: Number,              // 版本号
  created_at: Date,             // 创建时间
  updated_at: Date,             // 更新时间
  published_at: Date            // 发布时间
}
```

#### 2.4.2 测试结果集合 (quiz_results)

存储用户的测试结果。

```javascript
{
  _id: ObjectId,                // 结果唯一标识
  user_id: ObjectId,            // 用户ID
  quiz_id: ObjectId,            // 测试ID
  score: Number,                // 分数
  percentage: Number,           // 百分比
  passed: Boolean,              // 是否通过
  time_spent: Number,           // 花费时间(秒)
  started_at: Date,             // 开始时间
  completed_at: Date,           // 完成时间
  answers: [                    // 答案
    {
      question_id: String,      // 问题ID
      user_answer: Mixed,        // 用户答案
      is_correct: Boolean,       // 是否正确
      points_earned: Number,     // 获得分数
      time_spent: Number         // 花费时间(秒)
    }
  ],
  feedback: String,             // 反馈
  review_status: String,        // 审核状态(用于主观题)
  reviewer_id: ObjectId,        // 审核者ID
  reviewed_at: Date,            // 审核时间
  created_at: Date              // 创建时间
}
```

### 2.5 社区相关集合

#### 2.5.1 笔记集合 (notes)

存储用户的学习笔记。

```javascript
{
  _id: ObjectId,                // 笔记唯一标识
  user_id: ObjectId,            // 用户ID
  title: String,                // 标题
  content: String,              // 内容(HTML/Markdown)
  knowledge_id: ObjectId,       // 关联的知识点
  tags: [String],               // 标签
  is_public: Boolean,           // 是否公开
  media: [                      // 多媒体
    {
      type: String,            // 类型
      url: String,              // URL
      caption: String            // 说明
    }
  ],
  stats: {                      // 统计数据
    views: Number,              // 查看次数
    likes: Number,              // 点赞数
    comments: Number            // 评论数
  },
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

#### 2.5.2 讨论集合 (discussions)

存储社区讨论和问答。

```javascript
{
  _id: ObjectId,                // 讨论唯一标识
  user_id: ObjectId,            // 用户ID
  title: String,                // 标题
  content: String,              // 内容(HTML/Markdown)
  type: String,                 // 类型：question, discussion, announcement
  category: String,             // 分类
  tags: [String],               // 标签
  knowledge_id: ObjectId,       // 关联的知识点
  media: [                      // 多媒体
    {
      type: String,            // 类型
      url: String,              // URL
      caption: String            // 说明
    }
  ],
  stats: {                      // 统计数据
    views: Number,              // 查看次数
    likes: Number,              // 点赞数
    comments: Number,           // 评论数
    answers: Number             // 回答数(问题类型)
  },
  is_resolved: Boolean,         // 是否已解决(问题类型)
  accepted_answer_id: ObjectId, // 已接受的回答ID
  is_pinned: Boolean,           // 是否置顶
  is_locked: Boolean,           // 是否锁定
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

#### 2.5.3 评论集合 (comments)

存储评论和回复。

```javascript
{
  _id: ObjectId,                // 评论唯一标识
  user_id: ObjectId,            // 用户ID
  content: String,              // 内容
  parent_id: ObjectId,          // 父内容ID(讨论/笔记/评论)
  parent_type: String,          // 父内容类型：discussion, note, comment
  is_answer: Boolean,           // 是否为问题的回答
  media: [                      // 多媒体
    {
      type: String,            // 类型
      url: String,              // URL
      caption: String            // 说明
    }
  ],
  mentions: [ObjectId],         // 提及的用户
  stats: {                      // 统计数据
    likes: Number,              // 点赞数
    replies: Number             // 回复数
  },
  is_accepted: Boolean,         // 是否被接受为最佳答案
  is_edited: Boolean,           // 是否已编辑
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

### 2.6 系统相关集合

#### 2.6.1 通知集合 (notifications)

存储用户通知。

```javascript
{
  _id: ObjectId,                // 通知唯一标识
  user_id: ObjectId,            // 用户ID
  type: String,                 // 类型：system, comment, like, mention, achievement, etc.
  title: String,                // 标题
  content: String,              // 内容
  source: {                     // 来源
    type: String,               // 类型：discussion, note, comment, quiz, etc.
    id: ObjectId                // ID
  },
  actor_id: ObjectId,           // 触发者ID
  is_read: Boolean,             // 是否已读
  is_email_sent: Boolean,       // 是否已发送邮件
  is_push_sent: Boolean,        // 是否已发送推送
  created_at: Date              // 创建时间
}
```

#### 2.6.2 成就集合 (achievements)

存储系统成就和徽章。

```javascript
{
  _id: ObjectId,                // 成就唯一标识
  name: String,                 // 名称
  description: String,          // 描述
  icon: String,                 // 图标URL
  category: String,             // 分类
  criteria: {                   // 获取条件
    type: String,               // 类型：count, streak, score, etc.
    threshold: Number,          // 阈值
    resource: String            // 资源类型
  },
  points: Number,               // 积分
  rarity: String,               // 稀有度：common, uncommon, rare, epic, legendary
  is_hidden: Boolean,           // 是否隐藏
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

#### 2.6.3 用户成就集合 (user_achievements)

存储用户获得的成就。

```javascript
{
  _id: ObjectId,                // 唯一标识
  user_id: ObjectId,            // 用户ID
  achievement_id: ObjectId,     // 成就ID
  progress: Number,             // 进度
  is_completed: Boolean,        // 是否完成
  completed_at: Date,           // 完成时间
  created_at: Date              // 创建时间
}
```

#### 2.6.4 反馈集合 (feedback)

存储用户反馈和报告。

```javascript
{
  _id: ObjectId,                // 反馈唯一标识
  user_id: ObjectId,            // 用户ID
  type: String,                 // 类型：bug, feature, content, general
  subject: String,              // 主题
  content: String,              // 内容
  resource_type: String,        // 资源类型：knowledge, quiz, model, etc.
  resource_id: ObjectId,        // 资源ID
  status: String,               // 状态：pending, in_progress, resolved, rejected
  priority: String,             // 优先级：low, medium, high, critical
  assignee_id: ObjectId,        // 处理人ID
  resolution: String,           // 解决方案
  created_at: Date,             // 创建时间
  updated_at: Date              // 更新时间
}
```

## 3. 索引设计

为了提高查询性能，我们需要为各个集合设计合适的索引。

### 3.1 用户相关索引

```javascript
// users集合
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "roles": 1 });
db.users.createIndex({ "status": 1 });
db.users.createIndex({ "created_at": -1 });

// user_progress集合
db.user_progress.createIndex({ "user_id": 1, "learning_path_id": 1 }, { unique: true });
db.user_progress.createIndex({ "user_id": 1, "knowledge_progress.knowledge_id": 1 });
db.user_progress.createIndex({ "user_id": 1, "quiz_results.quiz_id": 1 });

// user_activities集合
db.user_activities.createIndex({ "user_id": 1, "created_at": -1 });
db.user_activities.createIndex({ "resource_type": 1, "resource_id": 1 });
db.user_activities.createIndex({ "activity_type": 1 });
```

### 3.2 知识库相关索引

```javascript
// knowledge集合
db.knowledge.createIndex({ "slug": 1 }, { unique: true });
db.knowledge.createIndex({ "category": 1, "subcategory": 1 });
db.knowledge.createIndex({ "tags": 1 });
db.knowledge.createIndex({ "difficulty_level": 1 });
db.knowledge.createIndex({ "review_status": 1 });
db.knowledge.createIndex({ "author": 1 });
db.knowledge.createIndex({ "created_at": -1 });
// 全文搜索索引
db.knowledge.createIndex({ "title": "text", "content": "text", "description": "text" });

// models集合
db.models.createIndex({ "category": 1, "type": 1 });
db.models.createIndex({ "related_knowledge": 1 });
db.models.createIndex({ "author": 1 });
db.models.createIndex({ "created_at": -1 });

// categories集合
db.categories.createIndex({ "slug": 1 }, { unique: true });
db.categories.createIndex({ "parent_id": 1 });
db.categories.createIndex({ "path": 1 });
```

### 3.3 学习路径相关索引

```javascript
// learning_paths集合
db.learning_paths.createIndex({ "slug": 1 }, { unique: true });
db.learning_paths.createIndex({ "category": 1 });
db.learning_paths.createIndex({ "tags": 1 });
db.learning_paths.createIndex({ "difficulty_level": 1 });
db.learning_paths.createIndex({ "status": 1 });
db.learning_paths.createIndex({ "author": 1 });
db.learning_paths.createIndex({ "created_at": -1 });

// learning_plans集合
db.learning_plans.createIndex({ "user_id": 1, "learning_path_id": 1 });
db.learning_plans.createIndex({ "user_id": 1, "status": 1 });
db.learning_plans.createIndex({ "start_date": 1 });
```

### 3.4 测评相关索引

```javascript
// quizzes集合
db.quizzes.createIndex({ "category": 1, "subcategory": 1 });
db.quizzes.createIndex({ "tags": 1 });
db.quizzes.createIndex({ "difficulty_level": 1 });
db.quizzes.createIndex({ "related_knowledge": 1 });
db.quizzes.createIndex({ "status": 1 });
db.quizzes.createIndex({ "author": 1 });
db.quizzes.createIndex({ "created_at": -1 });

// quiz_results集合
db.quiz_results.createIndex({ "user_id": 1, "quiz_id": 1 });
db.quiz_results.createIndex({ "user_id": 1, "completed_at": -1 });
db.quiz_results.createIndex({ "quiz_id": 1, "score": -1 });
```

### 3.5 社区相关索引

```javascript
// notes集合
db.notes.createIndex({ "user_id": 1, "created_at": -1 });
db.notes.createIndex({ "knowledge_id": 1 });
db.notes.createIndex({ "tags": 1 });
db.notes.createIndex({ "is_public": 1, "created_at": -1 });
// 全文搜索索引
db.notes.createIndex({ "title": "text", "content": "text" });

// discussions集合
db.discussions.createIndex({ "user_id": 1, "created_at": -1 });
db.discussions.createIndex({ "category": 1, "created_at": -1 });
db.discussions.createIndex({ "tags": 1 });
db.discussions.createIndex({ "knowledge_id": 1 });
db.discussions.createIndex({ "type": 1, "is_resolved": 1 });
db.discussions.createIndex({ "is_pinned": 1, "created_at": -1 });
// 全文搜索索引
db.discussions.createIndex({ "title": "text", "content": "text" });

// comments集合
db.comments.createIndex({ "user_id": 1 });
db.comments.createIndex({ "parent_id": 1, "parent_type": 1, "created_at": 1 });
db.comments.createIndex({ "mentions": 1 });
db.comments.createIndex({ "is_answer": 1, "is_accepted": 1 });
```

### 3.6 系统相关索引

```javascript
// notifications集合
db.notifications.createIndex({ "user_id": 1, "is_read": 1, "created_at": -1 });
db.notifications.createIndex({ "source.type": 1, "source.id": 1 });

// achievements集合
db.achievements.createIndex({ "category": 1 });
db.achievements.createIndex({ "criteria.type": 1 });

// user_achievements集合
db.user_achievements.createIndex({ "user_id": 1, "achievement_id": 1 }, { unique: true });
db.user_achievements.createIndex({ "user_id": 1, "is_completed": 1 });

// feedback集合
db.feedback.createIndex({ "user_id": 1 });
db.feedback.createIndex({ "status": 1, "priority": 1 });
db.feedback.createIndex({ "resource_type": 1, "resource_id": 1 });
```

## 4. 数据关系管理

### 4.1 引用关系

MongoDB是非关系型数据库，但我们仍需管理文档之间的关系。主要使用以下方式：

1. **引用方式**：使用ObjectId引用其他文档
   - 例如：知识点引用作者ID、3D模型引用相关知识点ID等

2. **嵌入方式**：将相关数据直接嵌入文档中
   - 例如：用户资料嵌入用户文档、测试题目嵌入测试文档等

### 4.2 关系维护

为了维护数据一致性，我们需要在应用层面实现一些关系维护逻辑：

1. **级联更新**：当主文档更新时，更新相关引用文档
   - 例如：用户名更改时，更新其创建的内容中的作者信息

2. **级联删除**：当主文档删除时，删除或归档相关文档
   - 例如：知识点删除时，删除或归档相关的测试、笔记等

3. **引用完整性**：确保引用的文档存在
   - 例如：添加知识点关联时，验证关联的知识点ID是否存在

## 5. 缓存策略

使用Redis作为缓存数据库，主要缓存以下数据：

### 5.1 会话缓存

```
// 用户会话
KEY: session:{sessionId}
VALUE: { userId, roles, permissions, ... }
EXPIRE: 30分钟
```

### 5.2 用户数据缓存

```
// 用户基本信息
KEY: user:{userId}
VALUE: { username, email, profile, ... }
EXPIRE: 1小时

// 用户权限
KEY: user:permissions:{userId}
VALUE: [permission1, permission2, ...]
EXPIRE: 1小时
```

### 5.3 内容缓存

```
// 热门知识点
KEY: knowledge:{knowledgeId}
VALUE: { title, description, content, ... }
EXPIRE: 1天

// 分类列表
KEY: categories
VALUE: [category1, category2, ...]
EXPIRE: 1天

// 学习路径
KEY: learning_path:{pathId}
VALUE: { title, description, nodes, edges, ... }
EXPIRE: 1天
```

### 5.4 计数器缓存

```
// 知识点访问计数
KEY: knowledge:views:{knowledgeId}
VALUE: count
EXPIRE: 永久（定期同步到数据库）

// 用户在线状态
KEY: user:online:{userId}
VALUE: timestamp
EXPIRE: 5分钟
```

### 5.5 API响应缓存

```
// API响应缓存
KEY: api:response:{endpoint}:{params_hash}
VALUE: { data, timestamp }
EXPIRE: 根据接口特性设置不同过期时间
```

## 6. 数据迁移和备份

### 6.1 数据迁移策略

1. **版本控制**：为数据模型添加版本号字段
2. **迁移脚本**：编写数据迁移脚本，处理模型变更
3. **向后兼容**：保持API向后兼容，支持旧版数据格式
4. **分批迁移**：大规模数据迁移采用分批处理方式

### 6.2 数据备份策略

1. **定时备份**：每日全量备份，每小时增量备份
2. **多重备份**：本地备份 + 云存储备份
3. **备份验证**：定期验证备份数据的完整性和可恢复性
4. **备份轮换**：保留最近30天的备份，每月一次的长期备份

## 7. 数据安全

### 7.1 敏感数据加密

1. **密码哈希**：使用bcrypt等算法哈希存储密码
2. **数据加密**：加密存储敏感个人信息
3. **传输加密**：使用HTTPS加密数据传输

### 7.2 访问控制

1. **字段级权限**：控制敏感字段的访问权限
2. **文档级权限**：基于用户角色控制文档访问
3. **数据库用户**：使用最小权限原则创建数据库用户

## 8. 性能优化

### 8.1 查询优化

1. **投影查询**：只返回需要的字段
2. **分页查询**：限制返回结果数量
3. **索引覆盖**：尽量使用索引覆盖查询
4. **避免大型文档**：控制文档大小，避免超过16MB限制

### 8.2 写入优化

1. **批量操作**：使用批量插入和更新
2. **异步写入**：非关键数据使用异步写入
3. **写入分流**：高峰期写入操作分流处理

## 9. 监控和维护

### 9.1 数据库监控

1. **性能指标**：监控查询性能、连接数、内存使用等
2. **慢查询日志**：记录和分析慢查询
3. **空间使用**：监控数据库和集合大小

### 9.2 定期维护

1. **索引重建**：定期重建索引，优化性能
2. **数据压缩**：定期压缩数据，回收空间
3. **统计更新**：更新集合统计信息

## 10. 扩展性考虑

### 10.1 水平扩展

1. **分片策略**：根据用户ID或内容类别进行分片
2. **读写分离**：主节点写入，从节点读取
3. **负载均衡**：多实例间的负载均衡

### 10.2 垂直扩展

1. **资源优化**：增加服务器内存和CPU
2. **存储优化**：使用SSD提高I/O性能
3. **连接池**：优化数据库连接池配置