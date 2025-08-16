# SiCal - 医学与药学可视化学习系统

## 项目概述

SiCal（Science Calculation and Learning）是一个专为医学和药学学习者设计的可视化学习系统。该系统旨在通过交互式可视化界面，帮助用户更直观地理解复杂的医学和药学概念，提高学习效率和记忆效果。

## 主要功能

### 1. 知识库管理
- 医学和药学知识的结构化存储
- 支持多种媒体格式（文本、图像、视频、3D模型）
- 知识点之间的关联性展示

### 2. 可视化学习
- 人体系统和器官的3D交互式模型
- 药物作用机制的动态可视化
- 疾病发展过程的模拟展示
- 药物分子结构的3D展示

### 3. 学习路径规划
- 个性化学习路径推荐
- 学习进度追踪
- 知识图谱导航

### 4. 互动测评
- 基于知识点的测试生成
- 实时反馈和解析
- 学习效果分析和弱点识别

### 5. 社区互动
- 学习笔记分享
- 问题讨论
- 专家解答

## 技术架构

### 前端
- React.js：用于构建用户界面
- Ant Design：UI组件库
- React Router：路由管理
- Axios：HTTP请求
- Three.js：3D渲染
- D3.js/ECharts：数据可视化

### 后端
- Node.js：运行环境
- Express：Web框架
- MongoDB：数据库
- Mongoose：ODM工具
- JWT：身份认证
- Redis：缓存
- RESTful API

### 部署
- Docker
- AWS/阿里云

## 目标用户

- 医学院校学生
- 药学专业学生
- 医护人员继续教育
- 医药相关专业研究人员
- 对医学和药学知识有兴趣的自学者

## 项目结构

```
sical/
├── frontend/                # 前端项目
│   ├── public/              # 静态资源
│   ├── src/                 # 源代码
│   │   ├── assets/          # 资源文件
│   │   ├── components/      # 组件
│   │   ├── contexts/        # 上下文
│   │   ├── hooks/           # 自定义钩子
│   │   ├── pages/           # 页面
│   │   ├── services/        # API服务
│   │   ├── styles/          # 样式文件
│   │   ├── utils/           # 工具函数
│   │   ├── App.jsx          # 应用入口
│   │   ├── main.jsx         # 主入口
│   │   └── index.css        # 全局样式
│   ├── package.json         # 依赖配置
│   └── vite.config.js       # Vite配置
│
├── backend/                 # 后端项目
│   ├── config/              # 配置文件
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由
│   ├── services/            # 服务
│   ├── utils/               # 工具函数
│   ├── .env                 # 环境变量
│   ├── db.js                # 数据库连接
│   ├── package.json         # 依赖配置
│   └── server.js            # 服务器入口
│
└── README.md                # 项目说明
```

## 安装与运行

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
npm install
npm run dev
```

## API文档

### 用户相关

- `POST /api/v1/users/register` - 用户注册
- `POST /api/v1/users/login` - 用户登录
- `GET /api/v1/users/me` - 获取当前用户信息
- `PUT /api/v1/users/updatedetails` - 更新用户信息
- `PUT /api/v1/users/updatepassword` - 更新密码

### 知识库相关

- `GET /api/v1/knowledges` - 获取所有知识点
- `GET /api/v1/knowledges/:id` - 获取单个知识点
- `POST /api/v1/knowledges` - 创建知识点
- `PUT /api/v1/knowledges/:id` - 更新知识点
- `DELETE /api/v1/knowledges/:id` - 删除知识点
- `GET /api/v1/knowledges/search` - 搜索知识点

### 学习路径相关

- `GET /api/v1/learningpaths` - 获取所有学习路径
- `GET /api/v1/learningpaths/:id` - 获取单个学习路径
- `POST /api/v1/learningpaths` - 创建学习路径
- `PUT /api/v1/learningpaths/:id` - 更新学习路径
- `DELETE /api/v1/learningpaths/:id` - 删除学习路径
- `POST /api/v1/learningpaths/:id/enroll` - 报名学习路径

### 测评相关

- `GET /api/v1/assessments` - 获取所有测评
- `GET /api/v1/assessments/:id` - 获取单个测评
- `POST /api/v1/assessments` - 创建测评
- `PUT /api/v1/assessments/:id` - 更新测评
- `DELETE /api/v1/assessments/:id` - 删除测评
- `POST /api/v1/assessments/:id/submit` - 提交测评答案

### 社区相关

- `GET /api/v1/knowledges/:knowledgeId/comments` - 获取知识点评论
- `GET /api/v1/learningpaths/:learningPathId/comments` - 获取学习路径评论
- `POST /api/v1/knowledges/:knowledgeId/comments` - 添加知识点评论
- `POST /api/v1/learningpaths/:learningPathId/comments` - 添加学习路径评论
- `PUT /api/v1/comments/:id` - 更新评论
- `DELETE /api/v1/comments/:id` - 删除评论

## 项目价值

- 降低医学和药学学习的难度和门槛
- 提高学习效率和记忆效果
- 促进医学和药学知识的普及
- 支持个性化学习和精准教育

## 开发计划

1. 需求分析和功能规划
2. 系统架构设计
3. 数据模型设计
4. 前端界面开发
5. 后端API开发
6. 知识库建设
7. 可视化模块开发
8. 测试和优化
9. 部署和上线
10. 持续迭代和功能扩展