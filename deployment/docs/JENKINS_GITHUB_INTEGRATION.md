# Jenkins GitHub 集成部署指南

本文档介绍如何配置 Jenkins 从 GitHub 拉取代码并自动构建部署 SiCal 前端应用。

## 概述

传统的部署方式是将本地构建的 `dist` 文件复制到 Docker 镜像中，但在生产环境中，我们需要 Jenkins 直接从 GitHub 拉取源代码进行构建和部署。

## 文件结构

```
deployment/
├── ci/
│   ├── Jenkinsfile              # 原始 Jenkinsfile（本地构建）
│   └── Jenkinsfile.github       # 新的 Jenkinsfile（GitHub 集成）
├── docker/
│   └── jenkins/
│       ├── Dockerfile            # Jenkins 镜像配置
│       ├── init.groovy          # 原始初始化脚本
│       └── init-github.groovy   # GitHub 集成初始化脚本
└── scripts/
    ├── setup-jenkins.sh         # 原始设置脚本
    └── setup-jenkins-github.sh  # GitHub 集成设置脚本

frontend/
├── Dockerfile                   # 原始 Dockerfile（单阶段）
└── Dockerfile.multistage        # 新的多阶段构建 Dockerfile
```

## 主要改动

### 1. 多阶段构建 Dockerfile

**文件**: `frontend/Dockerfile.multistage`

- **第一阶段**: 使用 Node.js 镜像构建前端应用
- **第二阶段**: 使用 Nginx 镜像运行应用
- **优势**: 不依赖本地 `dist` 文件，从源码直接构建

### 2. GitHub 集成 Jenkinsfile

**文件**: `deployment/ci/Jenkinsfile.github`

主要特性：
- 从 GitHub 拉取代码
- 使用多阶段构建 Dockerfile
- 支持自动版本标记
- 包含完整的 CI/CD 流程

### 3. Jenkins 初始化脚本

**文件**: `deployment/docker/jenkins/init-github.groovy`

自动配置：
- GitHub 相关插件
- Git 凭据管理
- Pipeline 任务创建
- SCM 触发器

### 4. 自动化设置脚本

**文件**: `deployment/scripts/setup-jenkins-github.sh`

功能：
- 构建支持 GitHub 的 Jenkins 镜像
- 自动配置 Jenkins 环境
- 集成 Kubernetes 和 Docker

## 快速开始

### 1. 运行设置脚本

```bash
cd /Users/admin/code/sical
./deployment/scripts/setup-jenkins-github.sh
```

### 2. 配置 GitHub 凭据

1. 访问 Jenkins: http://localhost:8080
2. 登录: admin/admin123
3. 进入 "Manage Jenkins" > "Manage Credentials"
4. 编辑 "git-credentials":
   - 用户名: kanewang179
   - 密码: 你的 GitHub Personal Access Token

### 3. 更新 Pipeline 配置

1. 编辑 Pipeline 任务 "sical-frontend-deploy-github"
2. 更新 Git 仓库 URL
3. 确认分支名称（默认: main）

### 4. 配置 GitHub Webhook

在 GitHub 仓库设置中添加 Webhook：
- URL: `http://your-jenkins-url:8080/github-webhook/`
- 事件: Push events, Pull request events

## GitHub Personal Access Token 配置

### 创建 Token

1. 登录 GitHub
2. 进入 Settings > Developer settings > Personal access tokens
3. 点击 "Generate new token"
4. 选择权限:
   - `repo` (完整仓库访问权限)
   - `workflow` (如果使用 GitHub Actions)

### 在 Jenkins 中配置

1. 进入 Jenkins > Manage Jenkins > Manage Credentials
2. 选择 "(global)" domain
3. 编辑 "git-credentials"
4. 输入 GitHub 用户名和 Personal Access Token

## 构建流程

### 自动触发

- **SCM 轮询**: 每 5 分钟检查一次代码变更
- **Webhook**: GitHub 推送时立即触发
- **手动触发**: 在 Jenkins 界面手动启动

### 构建步骤

1. **Checkout from GitHub**: 从 GitHub 拉取最新代码
2. **Install Dependencies**: 安装 npm 依赖
3. **Run Tests**: 执行测试和生成覆盖率报告
4. **Build Docker Image**: 使用多阶段构建创建镜像
5. **Security Scan**: 使用 Trivy 扫描镜像安全性
6. **Deploy to Kubernetes**: 部署到 K8s 集群
7. **Health Check**: 验证部署是否成功

## 环境变量

在 `Jenkinsfile.github` 中可以配置的环境变量：

```groovy
environment {
    DOCKER_REGISTRY = 'localhost:5000'    # Docker 仓库地址
    IMAGE_NAME = 'sical-frontend'          # 镜像名称
    K8S_NAMESPACE = 'sical'                # K8s 命名空间
    GIT_REPO = 'https://github.com/kanewang179/sical.git'  # Git 仓库
    GIT_BRANCH = 'main'                    # Git 分支
}
```

## 故障排除

### 常见问题

1. **Git 认证失败**
   - 检查 GitHub Personal Access Token 是否正确
   - 确认 Token 有足够的权限

2. **Docker 构建失败**
   - 检查 `Dockerfile.multistage` 语法
   - 确认 npm 依赖可以正常安装

3. **Kubernetes 部署失败**
   - 检查 kubectl 配置
   - 确认 K8s 集群状态

4. **Webhook 不工作**
   - 检查 GitHub Webhook 配置
   - 确认 Jenkins 可以从外网访问

### 日志查看

```bash
# Jenkins 容器日志
docker logs jenkins

# Pipeline 构建日志
# 在 Jenkins Web 界面查看具体构建的控制台输出
```

## 安全考虑

1. **凭据管理**: 使用 Jenkins 凭据存储，不要在代码中硬编码
2. **网络安全**: 限制 Jenkins 访问权限
3. **镜像安全**: 定期更新基础镜像，使用安全扫描
4. **访问控制**: 配置适当的 Jenkins 用户权限

## 迁移指南

### 从本地构建迁移到 GitHub 集成

1. **备份现有配置**
   ```bash
   cp deployment/ci/Jenkinsfile deployment/ci/Jenkinsfile.backup
   cp deployment/docker/jenkins/init.groovy deployment/docker/jenkins/init.groovy.backup
   ```

2. **使用新配置**
   ```bash
   cp deployment/ci/Jenkinsfile.github deployment/ci/Jenkinsfile
   cp deployment/docker/jenkins/init-github.groovy deployment/docker/jenkins/init.groovy
   cp frontend/Dockerfile.multistage frontend/Dockerfile
   ```

3. **重新构建 Jenkins**
   ```bash
   ./deployment/scripts/setup-jenkins-github.sh
   ```

## 性能优化

1. **Docker 层缓存**: 合理安排 Dockerfile 指令顺序
2. **并行构建**: 配置 Jenkins 并行执行器
3. **资源限制**: 为容器设置适当的资源限制
4. **清理策略**: 定期清理旧的构建产物和镜像

## 监控和告警

1. **Slack 集成**: 配置构建状态通知
2. **邮件通知**: 设置构建失败邮件提醒
3. **监控指标**: 监控构建时间和成功率
4. **日志聚合**: 集中收集和分析日志

---

**注意**: 这是一个完整的 CI/CD 解决方案，适用于生产环境部署。在使用前请确保理解每个组件的作用和配置要求。