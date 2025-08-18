# SICAL 项目自动化安装指南

本指南介绍如何使用自动化安装脚本在 macOS 和 CentOS 系统上快速部署 SICAL 项目的完整开发环境。

## 📋 系统要求

### 支持的操作系统
- macOS 10.15+ (Catalina 及以上)
- CentOS 7/8
- RHEL 7/8

### 硬件要求
- **内存**: 最少 4GB RAM (推荐 8GB+)
- **磁盘空间**: 最少 20GB 可用空间
- **网络**: 稳定的互联网连接

### 权限要求
- macOS: 管理员权限 (sudo)
- CentOS: 非 root 用户，但需要 sudo 权限

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd sical
```

### 2. 运行自动化安装
```bash
# 使用默认配置安装所有组件
./deployment/scripts/auto-install.sh
```

### 3. 等待安装完成
安装过程大约需要 15-30 分钟，具体时间取决于网络速度和系统性能。

## ⚙️ 配置选项

### 安装模式

编辑 `deployment/scripts/install-config.sh` 文件来自定义安装:

```bash
# 安装模式选择
INSTALL_MODE="full"    # full|minimal|custom

# 组件选择
INSTALL_DOCKER=true
INSTALL_KUBERNETES=true
INSTALL_JENKINS=true
CREATE_LOCAL_CLUSTER=true
```

#### 安装模式说明

| 模式 | 描述 | 包含组件 |
|------|------|----------|
| `full` | 完整安装 | Docker + Kubernetes + Jenkins + 本地集群 |
| `minimal` | 最小安装 | Docker + Jenkins |
| `custom` | 自定义安装 | 根据配置文件中的开关决定 |

### 网络配置

```bash
# 使用国内镜像源 (提高下载速度)
USE_CHINA_MIRRORS=true

# 自定义镜像源
DOCKER_REGISTRY="registry.cn-hangzhou.aliyuncs.com"
NPM_REGISTRY="https://registry.npmmirror.com"
GOPROXY="https://goproxy.cn,direct"
```

### 服务端口

```bash
# Jenkins 服务端口
JENKINS_HTTP_PORT=8080
JENKINS_AGENT_PORT=50000
```

## 📝 安装步骤详解

### 步骤 1: 系统检测
- 自动检测操作系统类型 (macOS/CentOS)
- 验证系统要求 (内存、磁盘空间)
- 检查网络连接

### 步骤 2: Docker 安装

#### macOS
- 安装 Homebrew (如果未安装)
- 通过 Homebrew 安装 Docker Desktop
- 提示用户手动启动 Docker Desktop

#### CentOS
- 卸载旧版本 Docker
- 添加 Docker CE 官方仓库
- 安装 Docker CE、CLI 和 containerd
- 启动并启用 Docker 服务
- 将当前用户添加到 docker 组

### 步骤 3: Kubernetes 安装

#### macOS
- 通过 Homebrew 安装 kubectl 和 kind
- 创建本地 Kubernetes 集群

#### CentOS
- 添加 Kubernetes 官方仓库
- 安装 kubeadm、kubelet、kubectl
- 下载并安装 kind
- 创建本地 Kubernetes 集群

### 步骤 4: Jenkins 安装
- 构建自定义 Jenkins Docker 镜像
- 创建 Jenkins 数据卷
- 启动 Jenkins 容器
- 获取初始管理员密码

### 步骤 5: 服务配置
- 配置 kubectl 上下文
- 创建项目命名空间
- 应用 Kubernetes 配置文件

### 步骤 6: 安装验证
- 验证 Docker 安装和运行状态
- 验证 Kubernetes 集群连接
- 验证 Jenkins 服务状态
- 生成安装报告

## 🔧 高级用法

### 自定义安装

1. **复制配置文件**
```bash
cp deployment/scripts/install-config.sh my-config.sh
```

2. **编辑配置**
```bash
vim my-config.sh
```

3. **使用自定义配置安装**
```bash
source my-config.sh
./deployment/scripts/auto-install.sh
```

### 仅安装特定组件

```bash
# 仅安装 Docker
INSTALL_DOCKER=true
INSTALL_KUBERNETES=false
INSTALL_JENKINS=false
./deployment/scripts/auto-install.sh
```

### 跳过确认提示

```bash
SKIP_CONFIRMATION=true ./deployment/scripts/auto-install.sh
```

## 🐛 故障排除

### 常见问题

#### 1. Docker 安装失败

**macOS**:
- 确保已安装 Xcode Command Line Tools
- 检查 Homebrew 是否正常工作

**CentOS**:
- 检查网络连接
- 确保有足够的磁盘空间
- 验证 sudo 权限

#### 2. Kubernetes 集群创建失败

```bash
# 检查 Docker 是否运行
docker ps

# 检查 kind 安装
kind version

# 手动创建集群
kind create cluster --name sical-cluster
```

#### 3. Jenkins 容器启动失败

```bash
# 检查容器日志
docker logs jenkins-github

# 检查端口占用
lsof -i :8080

# 重新启动容器
docker restart jenkins-github
```

#### 4. 网络问题

如果遇到下载缓慢或失败:

```bash
# 启用国内镜像源
USE_CHINA_MIRRORS=true

# 或手动配置代理
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
```

### 日志查看

```bash
# 查看安装日志
tail -f /tmp/sical-install.log

# 查看 Docker 日志
docker logs jenkins-github

# 查看 Kubernetes 日志
kubectl logs -n sical <pod-name>
```

### 完全重新安装

```bash
# 停止所有服务
docker stop jenkins-github
kind delete cluster --name sical-cluster

# 清理数据
docker volume rm jenkins_home
docker rmi jenkins-github:latest

# 重新运行安装脚本
./deployment/scripts/auto-install.sh
```

## 📚 后续步骤

安装完成后，您可以:

1. **访问 Jenkins**
   - URL: http://localhost:8080
   - 使用安装时显示的初始管理员密码登录

2. **配置 GitHub 集成**
   - 参考 `deployment/docs/JENKINS_GITHUB_INTEGRATION.md`

3. **部署应用**
   - 参考 `deployment/docs/DEPLOYMENT.md`

4. **运行 CI/CD 流水线**
   - 使用 `deployment/ci/Jenkinsfile`

## 🤝 支持

如果遇到问题:

1. 查看本文档的故障排除部分
2. 检查项目的 Issues 页面
3. 创建新的 Issue 并提供详细的错误信息

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。