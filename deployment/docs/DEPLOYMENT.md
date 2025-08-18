# SiCal前端应用部署指南

本文档详细介绍如何使用Jenkins、Docker和Kubernetes将SiCal前端应用部署到本地环境。

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [故障排除](#故障排除)
- [维护操作](#维护操作)
- [架构说明](#架构说明)

## 🔧 系统要求

### 必需软件

- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0
- **Kind**: >= 0.20.0
- **kubectl**: >= 1.28.0
- **Helm**: >= 3.12.0
- **Node.js**: >= 18.0.0 (用于本地开发)
- **Git**: >= 2.30.0

### 系统资源

- **内存**: 至少 8GB RAM
- **存储**: 至少 20GB 可用空间
- **CPU**: 至少 4 核心
- **网络**: 稳定的互联网连接（用于拉取镜像）

### 安装必需软件

#### macOS

```bash
# 安装Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装必需软件
brew install docker docker-compose kind kubectl helm node git

# 启动Docker Desktop
open /Applications/Docker.app
```

#### Linux (Ubuntu/Debian)

```bash
# 更新包列表
sudo apt update

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 安装Kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# 安装Helm
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd sical
```

### 2. 一键部署

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行完整部署
./deploy.sh
```

### 3. 配置hosts文件

```bash
# 添加域名解析
echo '127.0.0.1 sical.local' | sudo tee -a /etc/hosts
```

### 4. 访问应用

- **前端应用**: http://sical.local
- **Jenkins**: http://localhost:8080 (admin/admin123)
- **Kubernetes Dashboard**: 运行 `kubectl proxy` 后访问

## 📖 详细部署步骤

### 步骤1: 环境初始化

```bash
# 仅初始化环境
./deploy.sh --setup
```

这个步骤会：
- 创建Kind Kubernetes集群
- 启动本地Docker Registry
- 配置Jenkins
- 安装Nginx Ingress Controller
- 创建必要的命名空间

### 步骤2: 构建前端镜像

```bash
# 仅构建镜像
./deploy.sh --build
```

这个步骤会：
- 运行前端测试
- 构建Docker镜像
- 推送镜像到本地Registry

### 步骤3: 部署到Kubernetes

```bash
# 仅部署应用
./deploy.sh --deploy
```

这个步骤会：
- 应用Kubernetes配置
- 更新部署镜像
- 等待部署完成
- 执行健康检查

## ⚙️ 配置说明

### Docker Compose配置

`docker-compose.yml` 包含以下服务：

- **registry**: 本地Docker镜像仓库 (端口: 5000)
- **jenkins**: CI/CD服务器 (端口: 8080, 50000)
- **postgres**: 数据库服务 (端口: 5432)
- **redis**: 缓存服务 (端口: 6379)
- **nginx**: 反向代理 (端口: 80, 443)
- **frontend**: 前端应用 (端口: 3000)

### Kubernetes配置

#### 命名空间 (`k8s/namespace.yaml`)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sical
  labels:
    name: sical
```

#### 部署配置 (`k8s/frontend-deployment.yaml`)

- **副本数**: 2
- **资源限制**: CPU 500m, 内存 512Mi
- **健康检查**: HTTP探针
- **滚动更新**: 最大不可用 1 个Pod

#### 服务配置

- **类型**: ClusterIP
- **端口**: 80
- **目标端口**: 80

#### Ingress配置

- **域名**: sical.local
- **路径**: /
- **后端**: sical-frontend-service:80

### Jenkins配置

#### Pipeline配置 (`Jenkinsfile`)

Pipeline包含以下阶段：

1. **Checkout**: 检出代码
2. **Install Dependencies**: 安装依赖
3. **Run Tests**: 运行测试
4. **Build**: 构建应用
5. **Build Docker Image**: 构建Docker镜像
6. **Push to Registry**: 推送到本地Registry
7. **Security Scan**: 安全扫描
8. **Deploy to K8s**: 部署到Kubernetes
9. **Health Check**: 健康检查
10. **Notify**: 发送通知

#### 凭据配置

需要配置以下凭据：

- **docker-registry**: Docker Registry凭据
- **kubeconfig**: Kubernetes配置
- **git-credentials**: Git仓库凭据
- **slack-token**: Slack通知Token（可选）

## 🔧 维护操作

### 查看应用状态

```bash
# 查看Pod状态
kubectl get pods -n sical

# 查看服务状态
kubectl get services -n sical

# 查看Ingress状态
kubectl get ingress -n sical
```

### 查看日志

```bash
# 查看应用日志
kubectl logs -f deployment/sical-frontend -n sical

# 查看Jenkins日志
docker logs jenkins

# 查看Nginx日志
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx
```

### 重新部署

```bash
# 重启服务
./deploy.sh --restart

# 重新构建和部署
./deploy.sh

# 仅重新部署（不重新构建）
kubectl rollout restart deployment/sical-frontend -n sical
```

### 扩缩容

```bash
# 扩展到3个副本
kubectl scale deployment sical-frontend --replicas=3 -n sical

# 查看扩缩容状态
kubectl get pods -n sical -w
```

### 更新配置

```bash
# 更新ConfigMap
kubectl apply -f k8s/configmap.yaml

# 重启部署以应用新配置
kubectl rollout restart deployment/sical-frontend -n sical
```

## 🐛 故障排除

### 常见问题

#### 1. Pod无法启动

```bash
# 查看Pod详细信息
kubectl describe pod <pod-name> -n sical

# 查看Pod日志
kubectl logs <pod-name> -n sical

# 检查镜像是否存在
docker images | grep sical-frontend
```

#### 2. 无法访问应用

```bash
# 检查Ingress状态
kubectl get ingress -n sical

# 检查Ingress Controller
kubectl get pods -n ingress-nginx

# 检查hosts文件配置
cat /etc/hosts | grep sical.local
```

#### 3. Jenkins无法连接Kubernetes

```bash
# 检查kubeconfig
docker exec jenkins kubectl cluster-info

# 重新复制kubeconfig
docker cp ~/.kube/config jenkins:/var/jenkins_home/.kube/config
docker exec jenkins chown jenkins:jenkins /var/jenkins_home/.kube/config
```

#### 4. 镜像推送失败

```bash
# 检查Registry状态
curl http://localhost:5000/v2/_catalog

# 重启Registry
docker-compose restart registry

# 检查Docker daemon配置
cat /etc/docker/daemon.json
```

### 日志收集

```bash
# 创建日志收集脚本
cat > collect-logs.sh << 'EOF'
#!/bin/bash
mkdir -p debug-logs
kubectl get all -n sical > debug-logs/k8s-resources.txt
kubectl describe pods -n sical > debug-logs/pod-details.txt
kubectl logs deployment/sical-frontend -n sical > debug-logs/app-logs.txt
docker logs jenkins > debug-logs/jenkins-logs.txt
docker logs local-registry > debug-logs/registry-logs.txt
tar -czf debug-logs-$(date +%Y%m%d-%H%M%S).tar.gz debug-logs/
EOF

chmod +x collect-logs.sh
./collect-logs.sh
```

## 🏗️ 架构说明

### 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │     Jenkins     │    │   Kubernetes    │
│                 │    │                 │    │    Cluster      │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │    Git    │  │───▶│  │ Pipeline  │  │───▶│  │   Pods    │  │
│  │   Repo    │  │    │  │           │  │    │  │           │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Local Docker   │    │  Docker Registry│    │  Ingress Nginx  │
│   Environment   │    │                 │    │                 │
│                 │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  ┌───────────┐  │    │  │  Images   │  │    │  │   Routes  │  │
│  │   Tests   │  │    │  │           │  │    │  │           │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 数据流

1. **开发阶段**: 开发者提交代码到Git仓库
2. **构建阶段**: Jenkins检测到代码变更，触发Pipeline
3. **测试阶段**: 运行单元测试和集成测试
4. **打包阶段**: 构建Docker镜像并推送到本地Registry
5. **部署阶段**: 更新Kubernetes部署配置
6. **验证阶段**: 执行健康检查和烟雾测试
7. **通知阶段**: 发送部署结果通知

### 网络配置

- **Kind集群网络**: 10.244.0.0/16
- **Service网络**: 10.96.0.0/12
- **Ingress端口**: 80, 443
- **Registry端口**: 5000
- **Jenkins端口**: 8080, 50000

## 📚 参考资料

- [Kind官方文档](https://kind.sigs.k8s.io/)
- [Jenkins Pipeline文档](https://www.jenkins.io/doc/book/pipeline/)
- [Kubernetes官方文档](https://kubernetes.io/docs/)
- [Docker官方文档](https://docs.docker.com/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

## 🤝 贡献

如果您发现问题或有改进建议，请：

1. 创建Issue描述问题
2. Fork项目并创建功能分支
3. 提交Pull Request

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。