# 智能学习规划应用 - 数据库设计文档 v0.1.1

## 📋 文档信息

| 项目 | 智能学习规划应用 数据库设计 |
|------|----------------------------|
| **版本** | v0.1.1 |
| **数据库** | PostgreSQL 15+ |
| **ORM** | GORM v1.25+ |
| **更新日期** | 2024-01-15 |
| **状态** | 开发中 |

## 🎯 设计原则

### 数据库设计原则
- **规范化**: 遵循第三范式，减少数据冗余
- **性能优化**: 合理的索引设计和查询优化
- **扩展性**: 支持水平和垂直扩展
- **一致性**: 强一致性保证和事务支持
- **安全性**: 数据加密和访问控制

### Go GORM设计规范
- 使用结构体标签定义数据库约束
- 软删除支持(deleted_at字段)
- 自动时间戳(created_at, updated_at)
- 外键关联和级联操作
- 数据库迁移版本控制

## 🗄️ 数据库架构概览

### 核心业务模块
```
用户管理 (User Management)
├── users (用户基础信息)
├── user_profiles (用户详细资料)
└── user_sessions (用户会话)

学习管理 (Learning Management)
├── learning_goals (学习目标)
├── learning_paths (学习路径)
├── learning_nodes (学习节点)
├── node_contents (节点内容)
├── user_progress (学习进度)
└── learning_analytics (学习分析)

知识管理 (Knowledge Management)
├── knowledge_categories (知识分类)
├── knowledge_points (知识点)
├── knowledge_relations (知识关联)
└── user_notes (用户笔记)

评估系统 (Assessment System)
├── assessments (评估测试)
├── questions (题目)
├── question_options (选项)
├── user_answers (用户答案)
├── assessment_results (评估结果)
└── wrong_questions (错题记录)

互动系统 (Interaction System)
├── comments (评论)
├── comment_likes (评论点赞)
├── user_achievements (用户成就)
└── system_notifications (系统通知)
```

## 👤 用户管理模块

### users (用户基础表)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

### user_profiles (用户详细资料表)
```sql
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    age INTEGER,
    gender VARCHAR(10), -- male, female, other
    education_level VARCHAR(50), -- high_school, undergraduate, graduate, phd
    occupation VARCHAR(100),
    interests JSONB, -- ["programming", "data_science"]
    learning_preferences JSONB, -- {"style": "visual", "pace": "fast"}
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'zh-CN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE UNIQUE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_education ON user_profiles(education_level);
CREATE INDEX idx_user_profiles_interests ON user_profiles USING GIN(interests);
```

### user_sessions (用户会话表)
```sql
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

## 🎯 学习管理模块

### learning_goals (学习目标表)
```sql
CREATE TABLE learning_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    goal_type VARCHAR(20) NOT NULL, -- learning, exam_prep
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    target_completion_date DATE,
    estimated_hours INTEGER,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused, cancelled
    ai_analysis JSONB, -- AI分析结果
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_goals_user_id ON learning_goals(user_id);
CREATE INDEX idx_goals_status ON learning_goals(status);
CREATE INDEX idx_goals_type ON learning_goals(goal_type);
CREATE INDEX idx_goals_difficulty ON learning_goals(difficulty_level);
```

### learning_paths (学习路径表)
```sql
CREATE TABLE learning_paths (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id BIGINT REFERENCES learning_goals(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20),
    estimated_duration INTEGER, -- 预估学习时长(小时)
    total_nodes INTEGER DEFAULT 0,
    completed_nodes INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed, paused
    path_data JSONB, -- 路径图数据结构
    customization JSONB, -- 个性化设置
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_paths_goal_id ON learning_paths(goal_id);
CREATE INDEX idx_paths_status ON learning_paths(status);
CREATE INDEX idx_paths_progress ON learning_paths(progress_percentage);
```

### learning_nodes (学习节点表)
```sql
CREATE TABLE learning_nodes (
    id BIGSERIAL PRIMARY KEY,
    path_id BIGINT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    parent_node_id BIGINT REFERENCES learning_nodes(id),
    node_key VARCHAR(100) NOT NULL, -- 节点唯一标识
    title VARCHAR(200) NOT NULL,
    description TEXT,
    node_type VARCHAR(50), -- concept, skill, project, assessment
    difficulty_level VARCHAR(20),
    estimated_duration INTEGER, -- 预估学习时长(分钟)
    prerequisites JSONB, -- 前置知识点
    learning_objectives JSONB, -- 学习目标
    position_x DECIMAL(10,2), -- 可视化位置X
    position_y DECIMAL(10,2), -- 可视化位置Y
    order_index INTEGER, -- 排序索引
    is_mandatory BOOLEAN DEFAULT TRUE, -- 是否必修
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_nodes_path_id ON learning_nodes(path_id);
CREATE INDEX idx_nodes_parent ON learning_nodes(parent_node_id);
CREATE INDEX idx_nodes_key ON learning_nodes(node_key);
CREATE INDEX idx_nodes_type ON learning_nodes(node_type);
CREATE INDEX idx_nodes_order ON learning_nodes(order_index);
```

### node_contents (节点内容表)
```sql
CREATE TABLE node_contents (
    id BIGSERIAL PRIMARY KEY,
    node_id BIGINT NOT NULL REFERENCES learning_nodes(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- explanation, example, exercise, video, reading
    title VARCHAR(200),
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'markdown', -- markdown, html, json
    difficulty_level VARCHAR(20),
    estimated_read_time INTEGER, -- 预估阅读时间(分钟)
    media_urls JSONB, -- 媒体文件URLs
    interactive_elements JSONB, -- 交互元素配置
    ai_generated BOOLEAN DEFAULT FALSE,
    generation_prompt TEXT, -- AI生成时的提示词
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_contents_node_id ON node_contents(node_id);
CREATE INDEX idx_contents_type ON node_contents(content_type);
CREATE INDEX idx_contents_difficulty ON node_contents(difficulty_level);
CREATE INDEX idx_contents_active ON node_contents(is_active);
```

### user_progress (用户学习进度表)
```sql
CREATE TABLE user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_id BIGINT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    node_id BIGINT NOT NULL REFERENCES learning_nodes(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed, skipped
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent INTEGER DEFAULT 0, -- 学习时长(分钟)
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    mastery_level VARCHAR(20), -- not_mastered, basic, proficient, expert
    confidence_score DECIMAL(3,2), -- 0.00-1.00
    notes TEXT, -- 用户学习笔记
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE UNIQUE INDEX idx_progress_user_node ON user_progress(user_id, node_id);
CREATE INDEX idx_progress_path ON user_progress(path_id);
CREATE INDEX idx_progress_status ON user_progress(status);
CREATE INDEX idx_progress_mastery ON user_progress(mastery_level);
```

## 📚 知识管理模块

### knowledge_categories (知识分类表)
```sql
CREATE TABLE knowledge_categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES knowledge_categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    color_code VARCHAR(7), -- 十六进制颜色代码
    order_index INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_categories_parent ON knowledge_categories(parent_id);
CREATE INDEX idx_categories_name ON knowledge_categories(name);
CREATE INDEX idx_categories_active ON knowledge_categories(is_active);
```

### knowledge_points (知识点表)
```sql
CREATE TABLE knowledge_points (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES knowledge_categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    difficulty_level VARCHAR(20),
    importance_level VARCHAR(20), -- low, medium, high, critical
    prerequisites JSONB, -- 前置知识点IDs
    related_concepts JSONB, -- 相关概念
    tags JSONB, -- 标签数组
    external_resources JSONB, -- 外部资源链接
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_knowledge_category ON knowledge_points(category_id);
CREATE INDEX idx_knowledge_difficulty ON knowledge_points(difficulty_level);
CREATE INDEX idx_knowledge_importance ON knowledge_points(importance_level);
CREATE INDEX idx_knowledge_tags ON knowledge_points USING GIN(tags);
CREATE INDEX idx_knowledge_deleted ON knowledge_points(deleted_at);
```

### user_notes (用户笔记表)
```sql
CREATE TABLE user_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- knowledge_point, learning_node, assessment
    target_id BIGINT NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'markdown',
    tags JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_notes_target ON user_notes(target_type, target_id);
CREATE INDEX idx_notes_public ON user_notes(is_public);
CREATE INDEX idx_notes_favorite ON user_notes(is_favorite);
CREATE INDEX idx_notes_tags ON user_notes USING GIN(tags);
```

## 📝 评估系统模块

### assessments (评估测试表)
```sql
CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assessment_type VARCHAR(50), -- practice, quiz, exam, custom
    difficulty_level VARCHAR(20),
    time_limit INTEGER, -- 时间限制(分钟)
    question_count INTEGER,
    passing_score DECIMAL(5,2), -- 及格分数
    max_attempts INTEGER DEFAULT 3,
    is_public BOOLEAN DEFAULT FALSE,
    tags JSONB,
    configuration JSONB, -- 评估配置
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_assessments_creator ON assessments(creator_id);
CREATE INDEX idx_assessments_type ON assessments(assessment_type);
CREATE INDEX idx_assessments_difficulty ON assessments(difficulty_level);
CREATE INDEX idx_assessments_public ON assessments(is_public);
```

### questions (题目表)
```sql
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT REFERENCES assessments(id) ON DELETE CASCADE,
    knowledge_point_id BIGINT REFERENCES knowledge_points(id),
    question_type VARCHAR(50) NOT NULL, -- multiple_choice, single_choice, short_answer, essay, coding
    question_text TEXT NOT NULL,
    question_format VARCHAR(20) DEFAULT 'text', -- text, markdown, html
    difficulty_level VARCHAR(20),
    points DECIMAL(5,2) DEFAULT 1.00,
    time_estimate INTEGER, -- 预估答题时间(秒)
    explanation TEXT, -- 题目解析
    hints JSONB, -- 提示信息
    metadata JSONB, -- 题目元数据
    order_index INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_questions_assessment ON questions(assessment_id);
CREATE INDEX idx_questions_knowledge ON questions(knowledge_point_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_active ON questions(is_active);
```

### question_options (题目选项表)
```sql
CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_format VARCHAR(20) DEFAULT 'text',
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER,
    explanation TEXT, -- 选项解析
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_options_question ON question_options(question_id);
CREATE INDEX idx_options_correct ON question_options(is_correct);
```

### user_answers (用户答案表)
```sql
CREATE TABLE user_answers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    session_id VARCHAR(100), -- 答题会话ID
    answer_text TEXT,
    selected_options JSONB, -- 选择的选项IDs
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2),
    time_spent INTEGER, -- 答题用时(秒)
    attempt_number INTEGER DEFAULT 1,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_answers_user ON user_answers(user_id);
CREATE INDEX idx_answers_assessment ON user_answers(assessment_id);
CREATE INDEX idx_answers_question ON user_answers(question_id);
CREATE INDEX idx_answers_session ON user_answers(session_id);
CREATE INDEX idx_answers_correct ON user_answers(is_correct);
```

### assessment_results (评估结果表)
```sql
CREATE TABLE assessment_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    total_questions INTEGER,
    correct_answers INTEGER,
    total_points DECIMAL(8,2),
    earned_points DECIMAL(8,2),
    percentage_score DECIMAL(5,2),
    time_spent INTEGER, -- 总用时(秒)
    is_passed BOOLEAN,
    attempt_number INTEGER DEFAULT 1,
    detailed_results JSONB, -- 详细结果分析
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_results_user ON assessment_results(user_id);
CREATE INDEX idx_results_assessment ON assessment_results(assessment_id);
CREATE INDEX idx_results_session ON assessment_results(session_id);
CREATE INDEX idx_results_score ON assessment_results(percentage_score);
CREATE INDEX idx_results_passed ON assessment_results(is_passed);
```

## 💬 互动系统模块

### comments (评论表)
```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- knowledge_point, learning_node, assessment, learning_path
    target_id BIGINT NOT NULL,
    parent_id BIGINT REFERENCES comments(id), -- 回复评论的父评论
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'text',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 评分1-5星
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE, -- 是否置顶
    is_hidden BOOLEAN DEFAULT FALSE, -- 是否隐藏
    moderation_status VARCHAR(20) DEFAULT 'approved', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_rating ON comments(rating);
CREATE INDEX idx_comments_status ON comments(moderation_status);
CREATE INDEX idx_comments_created ON comments(created_at);
```

### comment_likes (评论点赞表)
```sql
CREATE TABLE comment_likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_id BIGINT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引和约束
CREATE UNIQUE INDEX idx_comment_likes_unique ON comment_likes(user_id, comment_id);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
```

### user_achievements (用户成就表)
```sql
CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- learning_streak, assessment_master, knowledge_explorer
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    progress_current INTEGER DEFAULT 0,
    progress_target INTEGER,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    metadata JSONB, -- 成就相关元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_achievements_type ON user_achievements(achievement_type);
CREATE INDEX idx_achievements_unlocked ON user_achievements(is_unlocked);
```

## 🔧 系统管理模块

### system_notifications (系统通知表)
```sql
CREATE TABLE system_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- NULL表示全局通知
    notification_type VARCHAR(50) NOT NULL, -- system, learning, achievement, reminder
    title VARCHAR(200) NOT NULL,
    content TEXT,
    action_url VARCHAR(500), -- 点击跳转链接
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    expires_at TIMESTAMP, -- 通知过期时间
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_notifications_user ON system_notifications(user_id);
CREATE INDEX idx_notifications_type ON system_notifications(notification_type);
CREATE INDEX idx_notifications_read ON system_notifications(is_read);
CREATE INDEX idx_notifications_priority ON system_notifications(priority);
CREATE INDEX idx_notifications_expires ON system_notifications(expires_at);
```

### notification_settings (通知设置表)
```sql
CREATE TABLE notification_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    learning_reminders BOOLEAN DEFAULT TRUE,
    achievement_notifications BOOLEAN DEFAULT TRUE,
    comment_notifications BOOLEAN DEFAULT TRUE,
    group_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME, -- 免打扰开始时间
    quiet_hours_end TIME, -- 免打扰结束时间
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE UNIQUE INDEX idx_notification_settings_user ON notification_settings(user_id);
```

### search_history (搜索历史表)
```sql
CREATE TABLE search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(500) NOT NULL,
    search_type VARCHAR(50), -- global, knowledge, user, group
    search_filters JSONB, -- 搜索过滤条件
    results_count INTEGER DEFAULT 0,
    clicked_result_id VARCHAR(100), -- 点击的结果ID
    clicked_result_type VARCHAR(50), -- 点击的结果类型
    search_duration INTEGER, -- 搜索耗时(毫秒)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history(search_query);
CREATE INDEX idx_search_history_type ON search_history(search_type);
CREATE INDEX idx_search_history_created ON search_history(created_at);
```

### learning_groups (学习小组表)
```sql
CREATE TABLE learning_groups (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    avatar_url VARCHAR(500),
    is_public BOOLEAN DEFAULT TRUE,
    max_members INTEGER DEFAULT 100,
    current_members INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
    learning_goals JSONB, -- 关联的学习目标
    tags JSONB, -- 小组标签
    rules TEXT, -- 小组规则
    join_approval_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_groups_creator ON learning_groups(creator_id);
CREATE INDEX idx_groups_public ON learning_groups(is_public);
CREATE INDEX idx_groups_status ON learning_groups(status);
CREATE INDEX idx_groups_tags ON learning_groups USING GIN(tags);
CREATE INDEX idx_groups_deleted ON learning_groups(deleted_at);
```

### group_members (小组成员表)
```sql
CREATE TABLE group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES learning_groups(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- owner, admin, moderator, member
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, banned
    join_message TEXT, -- 加入申请消息
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    contribution_score INTEGER DEFAULT 0, -- 贡献分数
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引和约束
CREATE UNIQUE INDEX idx_group_members_unique ON group_members(group_id, user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);
CREATE INDEX idx_group_members_status ON group_members(status);
```

### group_discussions (小组讨论表)
```sql
CREATE TABLE group_discussions (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES learning_groups(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'markdown',
    tags JSONB,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP,
    last_reply_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_discussions_group ON group_discussions(group_id);
CREATE INDEX idx_discussions_user ON group_discussions(user_id);
CREATE INDEX idx_discussions_pinned ON group_discussions(is_pinned);
CREATE INDEX idx_discussions_created ON group_discussions(created_at);
CREATE INDEX idx_discussions_last_reply ON group_discussions(last_reply_at);
```

### group_challenges (小组挑战表)
```sql
CREATE TABLE group_challenges (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES learning_groups(id) ON DELETE CASCADE,
    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50), -- learning_hours, assessment_score, knowledge_points
    target_value DECIMAL(10,2), -- 目标值
    target_unit VARCHAR(20), -- 单位：hours, points, count
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    participant_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    reward_description TEXT, -- 奖励描述
    rules JSONB, -- 挑战规则
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_challenges_group ON group_challenges(group_id);
CREATE INDEX idx_challenges_creator ON group_challenges(creator_id);
CREATE INDEX idx_challenges_status ON group_challenges(status);
CREATE INDEX idx_challenges_dates ON group_challenges(start_date, end_date);
```

### data_exports (数据导出表)
```sql
CREATE TABLE data_exports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL, -- full_data, learning_progress, notes, achievements
    data_types JSONB NOT NULL, -- 导出的数据类型数组
    format VARCHAR(20) NOT NULL, -- json, csv, pdf, xlsx
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    file_path VARCHAR(500), -- 导出文件路径
    file_size BIGINT, -- 文件大小(字节)
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP, -- 文件过期时间
    date_range JSONB, -- 导出数据的时间范围
    error_message TEXT, -- 错误信息
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_exports_user ON data_exports(user_id);
CREATE INDEX idx_exports_status ON data_exports(status);
CREATE INDEX idx_exports_type ON data_exports(export_type);
CREATE INDEX idx_exports_expires ON data_exports(expires_at);
```

### data_imports (数据导入表)
```sql
CREATE TABLE data_imports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL, -- learning_progress, notes, bookmarks
    source_platform VARCHAR(50), -- manual, coursera, udemy, khan_academy
    original_filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    format VARCHAR(20), -- json, csv, xlsx
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    total_records INTEGER,
    processed_records INTEGER DEFAULT 0,
    success_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    error_details JSONB, -- 错误详情
    mapping_config JSONB, -- 字段映射配置
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_imports_user ON data_imports(user_id);
CREATE INDEX idx_imports_status ON data_imports(status);
CREATE INDEX idx_imports_type ON data_imports(import_type);
CREATE INDEX idx_imports_platform ON data_imports(source_platform);
```

### learning_statistics (学习统计汇总表)
```sql
CREATE TABLE learning_statistics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    learning_time_minutes INTEGER DEFAULT 0, -- 学习时长(分钟)
    knowledge_points_learned INTEGER DEFAULT 0, -- 学习的知识点数
    assessments_completed INTEGER DEFAULT 0, -- 完成的评估数
    average_score DECIMAL(5,2), -- 平均分数
    notes_created INTEGER DEFAULT 0, -- 创建的笔记数
    comments_posted INTEGER DEFAULT 0, -- 发布的评论数
    achievements_unlocked INTEGER DEFAULT 0, -- 解锁的成就数
    login_count INTEGER DEFAULT 0, -- 登录次数
    active_learning_paths INTEGER DEFAULT 0, -- 活跃学习路径数
    streak_days INTEGER DEFAULT 0, -- 连续学习天数
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引和约束
CREATE UNIQUE INDEX idx_statistics_user_date ON learning_statistics(user_id, date);
CREATE INDEX idx_statistics_date ON learning_statistics(date);
CREATE INDEX idx_statistics_learning_time ON learning_statistics(learning_time_minutes);
CREATE INDEX idx_statistics_streak ON learning_statistics(streak_days);
```

### daily_summaries (每日汇总表)
```sql
CREATE TABLE daily_summaries (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_active_users INTEGER DEFAULT 0, -- 活跃用户数
    total_learning_time_hours DECIMAL(10,2) DEFAULT 0, -- 总学习时长
    total_assessments_completed INTEGER DEFAULT 0, -- 总完成评估数
    total_knowledge_points_learned INTEGER DEFAULT 0, -- 总学习知识点数
    total_notes_created INTEGER DEFAULT 0, -- 总创建笔记数
    total_comments_posted INTEGER DEFAULT 0, -- 总发布评论数
    total_new_registrations INTEGER DEFAULT 0, -- 新注册用户数
    total_groups_created INTEGER DEFAULT 0, -- 新创建小组数
    average_session_duration_minutes DECIMAL(8,2), -- 平均会话时长
    top_learning_categories JSONB, -- 热门学习分类
    system_performance_metrics JSONB, -- 系统性能指标
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引和约束
CREATE UNIQUE INDEX idx_daily_summaries_date ON daily_summaries(date);
CREATE INDEX idx_daily_summaries_active_users ON daily_summaries(total_active_users);
```

### audit_logs (审计日志表)
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout
    resource_type VARCHAR(50), -- user, learning_path, assessment
    resource_id BIGINT,
    old_values JSONB, -- 修改前的值
    new_values JSONB, -- 修改后的值
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

## 🚀 性能优化策略

### 索引优化
```sql
-- 复合索引优化
CREATE INDEX idx_user_progress_composite ON user_progress(user_id, status, updated_at);
CREATE INDEX idx_comments_target_created ON comments(target_type, target_id, created_at DESC);
CREATE INDEX idx_assessments_public_difficulty ON assessments(is_public, difficulty_level) WHERE deleted_at IS NULL;

-- 部分索引
CREATE INDEX idx_active_learning_paths ON learning_paths(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_unread_notifications ON system_notifications(user_id, created_at) WHERE is_read = FALSE;
```

### 查询优化
```sql
-- 视图优化常用查询
CREATE VIEW user_learning_summary AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT lp.id) as total_paths,
    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.id END) as completed_paths,
    AVG(lp.progress_percentage) as avg_progress,
    SUM(up.time_spent) as total_study_time
FROM users u
LEFT JOIN learning_paths lp ON u.id = lp.user_id AND lp.deleted_at IS NULL
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.username;

-- 物化视图(定期刷新)
CREATE MATERIALIZED VIEW knowledge_point_stats AS
SELECT 
    kp.id,
    kp.title,
    COUNT(DISTINCT up.user_id) as learner_count,
    AVG(up.progress_percentage) as avg_progress,
    COUNT(DISTINCT c.id) as comment_count,
    AVG(c.rating) as avg_rating
FROM knowledge_points kp
LEFT JOIN learning_nodes ln ON kp.id = ln.id
LEFT JOIN user_progress up ON ln.id = up.node_id
LEFT JOIN comments c ON 'knowledge_point' = c.target_type AND kp.id = c.target_id
GROUP BY kp.id, kp.title;

-- 创建刷新索引
CREATE UNIQUE INDEX idx_knowledge_stats_id ON knowledge_point_stats(id);
```

### 分区策略
```sql
-- 按时间分区审计日志表
CREATE TABLE audit_logs_partitioned (
    LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## 🔒 数据安全策略

### 敏感数据加密
```sql
-- 启用加密扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 敏感字段加密存储
ALTER TABLE user_profiles ADD COLUMN encrypted_phone VARCHAR(255);

-- 加密函数
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, 'encryption_key', 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;
```

### 行级安全策略
```sql
-- 启用行级安全
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的笔记
CREATE POLICY user_notes_policy ON user_notes
FOR ALL TO authenticated_users
USING (user_id = current_user_id());
```

## 📊 数据库监控

### 性能监控查询
```sql
-- 慢查询监控
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 表大小监控
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🔄 数据迁移策略

### GORM迁移配置
```go
// 自动迁移
func AutoMigrate(db *gorm.DB) error {
    return db.AutoMigrate(
        &User{},
        &UserProfile{},
        &UserSession{},
        &LearningGoal{},
        &LearningPath{},
        &LearningNode{},
        &NodeContent{},
        &UserProgress{},
        &KnowledgeCategory{},
        &KnowledgePoint{},
        &UserNote{},
        &Assessment{},
        &Question{},
        &QuestionOption{},
        &UserAnswer{},
        &AssessmentResult{},
        &Comment{},
        &CommentLike{},
        &UserAchievement{},
        &SystemNotification{},
        &AuditLog{},
    )
}

// 版本化迁移
type Migration struct {
    Version string
    Up      func(*gorm.DB) error
    Down    func(*gorm.DB) error
}
```

### 备份恢复策略
```bash
# 数据库备份
pg_dump -h localhost -U postgres -d sical_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 增量备份
pg_basebackup -h localhost -D /backup/incremental -U postgres -v -P -W

# 恢复数据库
psql -h localhost -U postgres -d sical_db < backup_20240115_103000.sql
```

---

**文档维护**: 本文档随数据库结构演进持续更新  
**最后更新**: 2024-01-15  
**负责人**: 数据库架构师