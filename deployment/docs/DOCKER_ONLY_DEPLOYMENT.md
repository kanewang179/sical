# SiCal Docker-only 部署指南

本文档介绍如何使用 Docker-in-Docker 架构部署 SiCal 前端应用。

## 🏗️ 架构概述

Docker-only 部署架构包含以下核心组件：

- **Jenkins**: 持续集成/持续部署服务，支持从 GitHub 拉取代码
- **Kind Kubernetes 集群**: 轻量级 Kubernetes 集群，运行在 Docker 容器中
- **本地 Docker Registry**: 存储构建的镜像
- **kubectl 工具容器**: 管理 Kubernetes 资源

## 📋 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间

## 🚀 快速开始

### 1. 配置镜像源（可选，推荐国内用户）

```bash
# 配置国内镜像源以加速下载
sudo bash deployment/docker/setup-china-mirrors.sh
```

### 2. 启动 Docker-only 环境

```bash
# 进入部署目录
cd deployment/docker

# 启动核心服务
docker-compose -f docker-compose-docker-only.yml up -d jenkins-github registry kind-cluster

# 等待服务启动完成（约2-3分钟）
docker-compose -f docker-compose-docker-only.yml logs -f
```

### 3. 访问 Jenkins

1. 打开浏览器访问: http://localhost:8080
2. 使用以下凭据登录：
   - 用户名: `admin`
   - 密码: `admin123`

### 4. 配置 GitHub 集成

1. 在 Jenkins 中更新 Git 仓库 URL
2. 配置 GitHub Personal Access Token
3. 设置 Webhook（可选）

## 🔧 核心配置文件

### Docker Compose 配置
- `docker-compose-docker-only.yml`: 主要的服务编排文件

### Jenkins 配置
- `jenkins/Dockerfile`: Jenkins 容器构建文件
- `jenkins/init.groovy`: Jenkins 初始化脚本，包含 GitHub 集成配置
- `jenkins/plugins.txt`: 必需的 Jenkins 插件列表

### Kubernetes 配置
- `kind-config-docker-only.yaml`: Kind 集群配置
- `k8s-resources/`: Kubernetes 资源定义文件
  - `namespace.yaml`: 命名空间定义
  - `frontend-deployment.yaml`: 前端应用部署配置
  - `configmap.yaml`: 配置映射和密钥

### 部署脚本
- `deploy-docker-only.sh`: 一键部署脚本
- `test-docker-only.sh`: 部署测试脚本
- `setup-china-mirrors.sh`: 国内镜像源配置脚本

## 📊 服务端口

| 服务 | 端口 | 描述 |
|------|------|------|
| Jenkins | 8080 | Web 界面 |
| Docker Registry | 5000 | 本地镜像仓库 |
| Kubernetes API | 6443 | K8s API 服务器 |
| 应用 HTTP | 80 | 前端应用访问 |
| 应用 HTTPS | 443 | 前端应用访问（SSL） |

## 🔍 故障排除

### 检查服务状态
```bash
# 查看所有服务状态
docker-compose -f docker-compose-docker-only.yml ps

# 查看特定服务日志
docker-compose -f docker-compose-docker-only.yml logs jenkins-github
docker-compose -f docker-compose-docker-only.yml logs kind-cluster
```

### 测试部署环境
```bash
# 运行完整测试
bash scripts/test-docker-only.sh

# 仅测试文件结构
bash scripts/test-docker-only.sh --files

# 仅测试 Docker 环境
bash scripts/test-docker-only.sh --env
```

### 重新部署
```bash
# 停止所有服务
docker-compose -f docker-compose-docker-only.yml down

# 清理数据（可选）
docker-compose -f docker-compose-docker-only.yml down -v

# 重新启动
docker-compose -f docker-compose-docker-only.yml up -d
```

## 🔐 安全注意事项

1. **更改默认密码**: 首次登录后立即更改 Jenkins 管理员密码
2. **GitHub Token**: 使用具有最小权限的 Personal Access Token
3. **网络隔离**: 生产环境中应配置适当的网络安全策略
4. **数据备份**: 定期备份 Jenkins 配置和构建数据

## 📈 性能优化

1. **资源限制**: 根据实际需求调整容器资源限制
2. **镜像缓存**: 使用本地 Registry 缓存常用镜像
3. **并行构建**: 配置 Jenkins 并行执行构建任务
4. **清理策略**: 定期清理旧的构建产物和镜像

## 🆘 获取帮助

如果遇到问题，请：

1. 查看相关服务的日志输出
2. 运行测试脚本检查环境配置
3. 检查 Docker 和 Docker Compose 版本兼容性
4. 确保系统资源充足

---

**注意**: 此部署方案适用于开发和测试环境。生产环境部署请根据实际需求进行安全加固和性能优化。