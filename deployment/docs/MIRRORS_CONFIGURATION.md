# 镜像源统一配置说明

## 概述

本文档说明了 `/Users/admin/code/sical/deployment` 目录下所有下载都已统一使用 `mirrors.json` 中定义的镜像源变量的配置情况。

## 配置文件

### 主配置文件
- **mirrors.json**: 统一镜像源配置文件，包含所有镜像源的定义
- **deploy-unified.sh**: 部署脚本，负责读取和应用镜像源配置
- **verify-mirrors.sh**: 验证脚本，检查镜像源配置是否正确应用

## 已配置的镜像源

### 1. NPM 镜像源
- **配置位置**: `mirrors.json` -> `mirrors.npm.registry`
- **默认值**: `https://registry.npmmirror.com`
- **应用范围**: 前端和后端 Node.js 项目

### 2. Docker 镜像源
- **配置位置**: `mirrors.json` -> `mirrors.docker.registry_mirrors`
- **默认值**: 多个国内 Docker 镜像加速器
- **应用范围**: Docker 镜像拉取

### 3. Go 模块代理
- **配置位置**: `mirrors.json` -> `mirrors.golang.goproxy`
- **默认值**: `https://goproxy.cn,direct`
- **应用范围**: Go 后端项目依赖下载

### 4. Kubernetes 相关
- **K8s OSS**: `mirrors.json` -> `mirrors.kubernetes_oss.repository`
- **Helm**: `mirrors.json` -> `mirrors.helm.repository`
- **应用范围**: kubectl、helm、kind 等工具下载

### 5. Linux 发行版镜像源
- **Ubuntu**: `mirrors.json` -> `mirrors.ubuntu.archive/security`
- **Debian**: `mirrors.json` -> `mirrors.debian.archive/security`
- **Alpine**: `mirrors.json` -> `mirrors.alpine.main`
- **应用范围**: Docker 镜像构建时的包管理器

### 6. 其他镜像源
- **PyPI**: `mirrors.json` -> `mirrors.pypi.index_url`
- **Jenkins**: `mirrors.json` -> `mirrors.jenkins.update_center`
- **GitHub 代理**: `mirrors.json` -> `mirrors.github.releases`
- **Docker CE**: `mirrors.json` -> `mirrors.docker_ce.repository`
- **Node.js**: `mirrors.json` -> `mirrors.nodejs.repository`

## 已修改的文件

### 1. Dockerfile 文件
- **Dockerfile.base-tools**: 使用 ARG 变量替换硬编码的下载地址
- **jenkins/Dockerfile**: 使用 ARG 变量替换硬编码的镜像源地址

### 2. Docker Compose 文件
- **docker-compose-docker-only.yml**: 添加构建参数，传递镜像源变量

### 3. 部署脚本
- **deploy-unified.sh**: 
  - 从 `mirrors.json` 读取镜像源配置
  - 支持 jq 和 python3 两种解析方式
  - 提供默认配置作为备用
  - 导出环境变量供 docker-compose 使用

### 4. Jenkins 配置
- **jenkins-plugin-mirror.groovy**: 使用环境变量替换硬编码的更新中心地址
- **init.groovy**: 使用环境变量替换硬编码的 GitHub 仓库地址

### 5. CI/CD 配置
- **Jenkinsfile.docker-only**: 使用环境变量替换硬编码的 GitHub 仓库地址

## 使用方法

### 1. 设置镜像源
```bash
cd /Users/admin/code/sical/deployment
./scripts/deploy-unified.sh --setup-mirrors
```

### 2. 验证配置
```bash
./scripts/verify-mirrors.sh
```

### 3. 构建服务
```bash
./scripts/deploy-unified.sh --build-services
```

## 配置优先级

1. **环境变量**: 如果设置了相应的环境变量，将优先使用
2. **mirrors.json**: 从配置文件读取（需要 jq 或 python3）
3. **默认配置**: 当无法解析 JSON 文件时使用的备用配置

## 自定义配置

### 修改镜像源
编辑 `mirrors.json` 文件，修改相应的镜像源地址：

```json
{
  "mirrors": {
    "npm": {
      "registry": "https://your-custom-npm-registry.com"
    }
  }
}
```

### 添加新的镜像源
1. 在 `mirrors.json` 中添加新的镜像源配置
2. 在 `deploy-unified.sh` 中添加相应的解析逻辑
3. 在需要使用的地方添加环境变量或 ARG 参数

## 注意事项

1. **网络连通性**: 部分镜像源可能因网络问题无法访问，建议配置备用镜像源
2. **版本兼容性**: 确保镜像源支持所需的软件版本
3. **安全性**: 使用可信的镜像源，避免安全风险
4. **定期更新**: 定期检查和更新镜像源地址，确保可用性

## 故障排除

### 镜像源连接失败
1. 检查网络连接
2. 尝试使用备用镜像源
3. 检查镜像源地址是否正确

### 配置未生效
1. 确保 `mirrors.json` 格式正确
2. 检查是否安装了 jq 或 python3
3. 验证环境变量是否正确导出

### 构建失败
1. 检查 Dockerfile 中的 ARG 参数是否正确
2. 确认 docker-compose 文件中的构建参数配置
3. 查看构建日志中的错误信息