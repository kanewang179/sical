# SiCal 部署配置

本目录包含了 SiCal 前端应用的完整部署配置，支持 Docker、Kubernetes 和 Jenkins 的本地部署。

## 📁 目录结构

```
deployment/
├── docker/                    # Docker 相关配置
│   ├── docker-compose.yml     # Docker Compose 配置文件
│   └── jenkins/               # Jenkins 自定义镜像
│       ├── Dockerfile         # Jenkins Dockerfile
│       ├── init.groovy        # Jenkins 初始化脚本
│       └── plugins.txt        # Jenkins 插件列表
├── k8s/                       # Kubernetes 配置文件
│   ├── kind-config.yaml       # Kind 集群配置
│   ├── namespace.yaml         # 命名空间配置
│   ├── configmap.yaml         # ConfigMap 配置
│   └── frontend-deployment.yaml # 前端应用部署配置
├── scripts/                   # 自动化脚本
│   ├── deploy.sh              # 主部署脚本
│   ├── setup-k8s.sh          # Kubernetes 集群设置
│   └── setup-jenkins.sh      # Jenkins 设置脚本
├── ci/                        # CI/CD 配置
│   └── Jenkinsfile            # Jenkins Pipeline 配置
├── docs/                      # 文档
│   ├── DEPLOYMENT.md          # 详细部署指南
│   └── QUICKSTART.md          # 快速开始指南
└── README.md                  # 本文件
```

## 🚀 快速开始

### 方法一：使用根目录快捷脚本

```bash
# 在项目根目录执行
./deploy.sh
```

### 方法二：直接使用部署脚本

```bash
# 进入部署目录
cd deployment/scripts

# 执行部署脚本
./deploy.sh
```

## 📋 主要功能

### 🛠️ 环境初始化
```bash
./deploy.sh --setup
```
- 创建 Kind Kubernetes 集群
- 配置 Jenkins CI/CD 环境
- 启动必要的基础服务

### 🏗️ 应用构建
```bash
./deploy.sh --build
```
- 构建前端 Docker 镜像
- 推送到本地 Registry

### 🚀 应用部署
```bash
./deploy.sh --deploy
```
- 部署到 Kubernetes 集群
- 配置服务和 Ingress

### 🧹 环境清理
```bash
./deploy.sh --clean
```
- 清理所有部署资源
- 删除 Kind 集群

## 🔧 配置说明

### Docker 配置
- **docker-compose.yml**: 定义本地开发环境的服务
- **jenkins/**: Jenkins 自定义镜像配置

### Kubernetes 配置
- **kind-config.yaml**: 本地 Kind 集群配置
- **namespace.yaml**: 应用命名空间
- **configmap.yaml**: 应用配置映射
- **frontend-deployment.yaml**: 前端应用部署配置

### CI/CD 配置
- **Jenkinsfile**: Jenkins Pipeline 定义
- **scripts/**: 自动化部署脚本

## 📖 详细文档

- [部署指南](docs/DEPLOYMENT.md) - 详细的部署说明和配置
- [快速开始](docs/QUICKSTART.md) - 快速部署指南

## 🔗 相关链接

- [Kind 文档](https://kind.sigs.k8s.io/)
- [Jenkins 文档](https://www.jenkins.io/doc/)
- [Kubernetes 文档](https://kubernetes.io/docs/)
- [Docker 文档](https://docs.docker.com/)

## 🤝 贡献

如果您发现任何问题或有改进建议，请提交 Issue 或 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证。