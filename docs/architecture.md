# SiCal - 医学与药学可视化学习系统架构设计

## 1. 系统架构概述

SiCal采用前后端分离的微服务架构，以提供高可扩展性、高可用性和良好的用户体验。系统分为前端应用、后端服务、数据存储和第三方服务集成四个主要部分。

## 2. 架构图

```
+----------------------------------+
|           客户端层               |
|  +-------------+  +----------+  |
|  | Web浏览器   |  | 移动应用  |  |
|  +-------------+  +----------+  |
+----------------------------------+
              |
              | HTTPS
              |
+----------------------------------+
|           前端应用层             |
|  +-------------+  +----------+  |
|  | React应用   |  | 静态资源  |  |
|  +-------------+  +----------+  |
+----------------------------------+
              |
              | API调用
              |
+----------------------------------+
|           API网关层              |
|  +-----------------------------+ |
|  | API网关 (认证、路由、限流)   | |
|  +-----------------------------+ |
+----------------------------------+
              |
              |
+------------------------------------------------------------------+
|                           微服务层                                 |
|  +-------------+  +-------------+  +-------------+  +----------+  |
|  | 用户服务    |  | 知识库服务  |  | 学习路径服务 |  | 测评服务  |  |
|  +-------------+  +-------------+  +-------------+  +----------+  |
|                                                                    |
|  +-------------+  +-------------+  +-------------+  +----------+  |
|  | 可视化服务  |  | 社区服务    |  | 搜索服务    |  | 通知服务  |  |
|  +-------------+  +-------------+  +-------------+  +----------+  |
+------------------------------------------------------------------+
              |
              |
+------------------------------------------------------------------+
|                           数据存储层                               |
|  +-------------+  +-------------+  +-------------+  +----------+  |
|  | MongoDB     |  | Redis       |  | 文件存储    |  | 搜索索引  |  |
|  | (主数据库)  |  | (缓存)      |  | (阿里云OSS) |  | (ES)     |  |
|  +-------------+  +-------------+  +-------------+  +----------+  |
+------------------------------------------------------------------+
              |
              |
+------------------------------------------------------------------+
|                           第三方服务层                             |
|  +-------------+  +-------------+  +-------------+  +----------+  |
|  | 支付服务    |  | 消息推送    |  | 数据分析    |  | AI服务   |  |
|  +-------------+  +-------------+  +-------------+  +----------+  |
+------------------------------------------------------------------+
```

## 3. 系统组件详细设计

### 3.1 前端应用层

#### 3.1.1 Web应用
- **技术栈**：React.js, Three.js, D3.js, Ant Design
- **主要模块**：
  - **用户界面**：登录注册、个人中心、设置等
  - **知识库浏览**：分类导航、搜索、知识点详情
  - **3D可视化**：人体模型、分子结构、药物作用机制等
  - **学习路径**：知识图谱、学习计划、进度追踪
  - **测评系统**：题库、测试、成绩分析
  - **社区互动**：笔记、讨论、问答

#### 3.1.2 移动应用
- **技术栈**：React Native
- **功能**：Web应用的移动端适配版本，专注于学习和复习功能

### 3.2 API网关层

- **技术**：Node.js, Express
- **功能**：
  - **认证授权**：JWT验证、权限控制
  - **请求路由**：将请求转发到相应的微服务
  - **限流控制**：防止API滥用
  - **日志记录**：请求和响应日志
  - **错误处理**：统一的错误响应格式

### 3.3 微服务层

#### 3.3.1 用户服务
- **功能**：用户注册、登录、个人信息管理、权限控制
- **API**：
  - `POST /api/users/register` - 用户注册
  - `POST /api/users/login` - 用户登录
  - `GET /api/users/profile` - 获取用户信息
  - `PUT /api/users/profile` - 更新用户信息
  - `GET /api/users/roles` - 获取用户角色

#### 3.3.2 知识库服务
- **功能**：知识点管理、多媒体内容管理、知识关联
- **API**：
  - `GET /api/knowledge` - 获取知识点列表
  - `GET /api/knowledge/:id` - 获取知识点详情
  - `POST /api/knowledge` - 创建知识点
  - `PUT /api/knowledge/:id` - 更新知识点
  - `GET /api/knowledge/related/:id` - 获取相关知识点

#### 3.3.3 学习路径服务
- **功能**：知识图谱、学习计划、进度追踪
- **API**：
  - `GET /api/learning-paths` - 获取学习路径列表
  - `GET /api/learning-paths/:id` - 获取学习路径详情
  - `POST /api/learning-paths/progress` - 更新学习进度
  - `GET /api/knowledge-graph` - 获取知识图谱

#### 3.3.4 测评服务
- **功能**：题库管理、测试生成、成绩分析
- **API**：
  - `GET /api/quizzes` - 获取测试列表
  - `GET /api/quizzes/:id` - 获取测试详情
  - `POST /api/quizzes/:id/submit` - 提交测试答案
  - `GET /api/quizzes/results/:id` - 获取测试结果

#### 3.3.5 可视化服务
- **功能**：3D模型管理、可视化数据处理
- **API**：
  - `GET /api/models` - 获取3D模型列表
  - `GET /api/models/:id` - 获取3D模型详情
  - `GET /api/visualizations/:type` - 获取可视化数据

#### 3.3.6 社区服务
- **功能**：笔记管理、讨论区、问答
- **API**：
  - `GET /api/notes` - 获取笔记列表
  - `POST /api/notes` - 创建笔记
  - `GET /api/discussions` - 获取讨论列表
  - `POST /api/discussions` - 创建讨论
  - `POST /api/comments` - 发表评论

#### 3.3.7 搜索服务
- **功能**：全文搜索、标签搜索、关键词搜索
- **API**：
  - `GET /api/search` - 搜索内容
  - `GET /api/search/suggestions` - 获取搜索建议

#### 3.3.8 通知服务
- **功能**：系统通知、消息推送
- **API**：
  - `GET /api/notifications` - 获取通知列表
  - `PUT /api/notifications/:id/read` - 标记通知为已读
  - `POST /api/notifications/settings` - 更新通知设置

### 3.4 数据存储层

#### 3.4.1 MongoDB
- **用途**：主数据库，存储结构化和半结构化数据
- **主要集合**：
  - `users` - 用户信息
  - `knowledge` - 知识点
  - `learning_paths` - 学习路径
  - `quizzes` - 测试题库
  - `notes` - 学习笔记
  - `discussions` - 讨论内容
  - `comments` - 评论

#### 3.4.2 Redis
- **用途**：缓存、会话存储、消息队列
- **主要数据**：
  - 用户会话
  - 热门知识点缓存
  - API响应缓存
  - 实时统计数据

#### 3.4.3 文件存储 (阿里云OSS)
- **用途**：存储多媒体内容
- **主要内容**：
  - 图片
  - 视频
  - 3D模型文件
  - 文档

#### 3.4.4 搜索索引 (Elasticsearch)
- **用途**：全文搜索
- **主要索引**：
  - 知识点索引
  - 讨论内容索引
  - 笔记索引

### 3.5 第三方服务层

#### 3.5.1 支付服务
- **功能**：处理会员订阅、课程购买等支付需求
- **集成**：支付宝、微信支付

#### 3.5.2 消息推送
- **功能**：向用户发送通知和提醒
- **集成**：极光推送、阿里云短信

#### 3.5.3 数据分析
- **功能**：用户行为分析、学习效果分析
- **集成**：阿里云日志服务、自定义分析服务

#### 3.5.4 AI服务
- **功能**：智能推荐、自动出题、内容生成
- **集成**：阿里云机器学习、自定义AI服务

## 4. 数据模型设计

### 4.1 用户模型 (User)

```json
{
  "_id": "ObjectId",
  "username": "String",
  "email": "String",
  "password": "String (hashed)",
  "profile": {
    "name": "String",
    "avatar": "String (URL)",
    "bio": "String",
    "profession": "String",
    "education": "String"
  },
  "roles": ["String"],
  "preferences": {
    "theme": "String",
    "notification_settings": {
      "email": "Boolean",
      "push": "Boolean"
    },
    "learning_preferences": {
      "difficulty_level": "String",
      "topics_of_interest": ["String"]
    }
  },
  "created_at": "Date",
  "updated_at": "Date",
  "last_login": "Date"
}
```

### 4.2 知识点模型 (Knowledge)

```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "content": "String (HTML/Markdown)",
  "category": "String",
  "subcategory": "String",
  "tags": ["String"],
  "difficulty_level": "String",
  "media": [
    {
      "type": "String (image/video/model)",
      "url": "String",
      "description": "String"
    }
  ],
  "related_knowledge": ["ObjectId (Knowledge)"],
  "prerequisites": ["ObjectId (Knowledge)"],
  "author": "ObjectId (User)",
  "views": "Number",
  "likes": "Number",
  "created_at": "Date",
  "updated_at": "Date",
  "version": "Number"
}
```

### 4.3 3D模型模型 (Model)

```json
{
  "_id": "ObjectId",
  "name": "String",
  "description": "String",
  "category": "String",
  "type": "String (anatomy/molecule/mechanism)",
  "file_url": "String",
  "thumbnail_url": "String",
  "format": "String (glb/gltf/obj)",
  "metadata": {
    "vertices": "Number",
    "polygons": "Number",
    "size": "Number (bytes)",
    "scale": "Number"
  },
  "annotations": [
    {
      "position": {
        "x": "Number",
        "y": "Number",
        "z": "Number"
      },
      "title": "String",
      "description": "String",
      "knowledge_id": "ObjectId (Knowledge)"
    }
  ],
  "related_knowledge": ["ObjectId (Knowledge)"],
  "author": "ObjectId (User)",
  "created_at": "Date",
  "updated_at": "Date",
  "version": "Number"
}
```

### 4.4 学习路径模型 (LearningPath)

```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "category": "String",
  "difficulty_level": "String",
  "estimated_hours": "Number",
  "nodes": [
    {
      "id": "String",
      "title": "String",
      "description": "String",
      "knowledge_id": "ObjectId (Knowledge)",
      "type": "String (knowledge/quiz/practice)",
      "position": {
        "x": "Number",
        "y": "Number"
      },
      "prerequisites": ["String (node.id)"]
    }
  ],
  "edges": [
    {
      "source": "String (node.id)",
      "target": "String (node.id)",
      "label": "String"
    }
  ],
  "author": "ObjectId (User)",
  "created_at": "Date",
  "updated_at": "Date",
  "version": "Number"
}
```

### 4.5 用户学习进度模型 (UserProgress)

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (User)",
  "learning_path_id": "ObjectId (LearningPath)",
  "completed_nodes": ["String (node.id)"],
  "current_node": "String (node.id)",
  "knowledge_progress": [
    {
      "knowledge_id": "ObjectId (Knowledge)",
      "status": "String (not_started/in_progress/completed)",
      "completion_percentage": "Number",
      "last_accessed": "Date",
      "time_spent": "Number (seconds)",
      "notes": "String"
    }
  ],
  "quiz_results": [
    {
      "quiz_id": "ObjectId (Quiz)",
      "score": "Number",
      "completed_at": "Date",
      "time_spent": "Number (seconds)"
    }
  ],
  "created_at": "Date",
  "updated_at": "Date"
}
```

### 4.6 测试模型 (Quiz)

```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "category": "String",
  "difficulty_level": "String",
  "time_limit": "Number (minutes)",
  "passing_score": "Number",
  "questions": [
    {
      "id": "String",
      "type": "String (multiple_choice/true_false/matching/fill_blank)",
      "content": "String",
      "options": [
        {
          "id": "String",
          "text": "String",
          "is_correct": "Boolean"
        }
      ],
      "correct_answer": "String/Array",
      "explanation": "String",
      "knowledge_id": "ObjectId (Knowledge)",
      "points": "Number"
    }
  ],
  "related_knowledge": ["ObjectId (Knowledge)"],
  "author": "ObjectId (User)",
  "created_at": "Date",
  "updated_at": "Date",
  "version": "Number"
}
```

### 4.7 笔记模型 (Note)

```json
{
  "_id": "ObjectId",
  "title": "String",
  "content": "String (HTML/Markdown)",
  "user_id": "ObjectId (User)",
  "knowledge_id": "ObjectId (Knowledge)",
  "tags": ["String"],
  "is_public": "Boolean",
  "likes": "Number",
  "comments": ["ObjectId (Comment)"],
  "created_at": "Date",
  "updated_at": "Date"
}
```

### 4.8 讨论模型 (Discussion)

```json
{
  "_id": "ObjectId",
  "title": "String",
  "content": "String (HTML/Markdown)",
  "user_id": "ObjectId (User)",
  "category": "String",
  "tags": ["String"],
  "knowledge_id": "ObjectId (Knowledge)",
  "views": "Number",
  "likes": "Number",
  "comments": ["ObjectId (Comment)"],
  "is_resolved": "Boolean",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### 4.9 评论模型 (Comment)

```json
{
  "_id": "ObjectId",
  "content": "String",
  "user_id": "ObjectId (User)",
  "parent_id": "ObjectId (Discussion/Note/Comment)",
  "parent_type": "String (discussion/note/comment)",
  "likes": "Number",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### 4.10 通知模型 (Notification)

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (User)",
  "type": "String (system/comment/like/mention)",
  "title": "String",
  "content": "String",
  "source": {
    "type": "String (discussion/note/comment/quiz)",
    "id": "ObjectId"
  },
  "is_read": "Boolean",
  "created_at": "Date"
}
```

## 5. 安全设计

### 5.1 认证与授权

- **JWT认证**：使用JSON Web Token进行用户认证
- **RBAC权限控制**：基于角色的访问控制
- **OAuth集成**：支持第三方账号登录

### 5.2 数据安全

- **数据加密**：敏感数据加密存储
- **HTTPS**：所有通信使用HTTPS加密
- **输入验证**：防止SQL注入、XSS等攻击
- **CSRF防护**：使用CSRF令牌防止跨站请求伪造

### 5.3 API安全

- **速率限制**：防止API滥用
- **请求验证**：验证请求来源和内容
- **日志审计**：记录关键操作日志

## 6. 扩展性设计

### 6.1 水平扩展

- **无状态服务**：所有微服务设计为无状态，便于水平扩展
- **负载均衡**：使用阿里云SLB进行负载均衡
- **数据库分片**：MongoDB支持分片，应对数据增长

### 6.2 模块化设计

- **微服务架构**：各功能模块独立部署和扩展
- **API版本控制**：支持API版本共存，平滑升级
- **插件系统**：支持功能扩展和定制

## 7. 性能优化

### 7.1 前端优化

- **代码分割**：按路由和组件分割代码，减少初始加载时间
- **懒加载**：图片、3D模型等资源懒加载
- **缓存策略**：合理使用浏览器缓存和Service Worker
- **CDN加速**：静态资源使用CDN分发

### 7.2 后端优化

- **缓存层**：使用Redis缓存热点数据和API响应
- **数据库索引**：合理设计MongoDB索引
- **异步处理**：耗时操作使用消息队列异步处理
- **数据压缩**：API响应使用gzip压缩

### 7.3 3D渲染优化

- **模型简化**：根据设备性能动态调整模型复杂度
- **LOD技术**：使用多层次细节技术
- **纹理压缩**：使用高效的纹理压缩格式
- **WebGL优化**：优化着色器和渲染管线

## 8. 监控与运维

### 8.1 监控系统

- **服务健康检查**：定期检查服务可用性
- **性能监控**：监控API响应时间、资源使用率等
- **错误追踪**：使用Sentry追踪前后端错误
- **用户体验监控**：收集前端性能和用户行为数据

### 8.2 日志管理

- **集中式日志**：使用阿里云日志服务收集和分析日志
- **日志分级**：按严重程度分级记录日志
- **告警机制**：关键错误自动告警

### 8.3 部署流程

- **CI/CD**：使用GitHub Actions实现持续集成和部署
- **蓝绿部署**：无缝更新服务
- **回滚机制**：支持快速回滚到稳定版本

## 9. 灾备与恢复

- **数据备份**：定期备份数据库和文件存储
- **多区域部署**：核心服务多区域部署
- **故障转移**：支持自动故障转移
- **恢复演练**：定期进行恢复演练

## 10. 未来扩展

- **AR/VR支持**：增加增强现实和虚拟现实学习模式
- **AI辅助学习**：智能学习助手和个性化推荐
- **多语言支持**：支持多语言界面和内容
- **移动应用扩展**：开发功能更完善的移动应用
- **API开放平台**：开放API接口，支持第三方开发