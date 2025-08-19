# 镜像源配置说明

本目录中的所有Docker镜像和服务现在都从 `mirrors.json` 文件中读取镜像源配置，而不是使用硬编码的链接。

## 使用方法

### 1. 运行Docker Compose服务

使用 `setup-env.sh` 脚本来设置环境变量并运行docker-compose：

```bash
# 在deployment/docker目录下
./setup-env.sh docker-compose -f docker-compose-docker-only.yml up -d
```

或者分步执行：

```bash
# 1. 设置环境变量
source ./setup-env.sh

# 2. 运行docker-compose
docker-compose -f docker-compose-docker-only.yml up -d
```

### 2. 验证镜像源配置

可以运行setup-env.sh脚本查看当前的镜像源配置：

```bash
./setup-env.sh
```

## 配置的镜像源

以下镜像源现在都从 `../scripts/mirrors.json` 文件中读取：

- **DEBIAN_MIRROR**: Debian软件包镜像源
- **DEBIAN_SECURITY_MIRROR**: Debian安全更新镜像源
- **DOCKER_CE_MIRROR**: Docker CE安装镜像源
- **KUBERNETES_OSS_REPO**: Kubernetes工具下载镜像源
- **GITHUB_PROXY**: GitHub代理镜像源
- **HELM_REPO**: Helm包管理器镜像源
- **NODEJS_MIRROR**: Node.js安装镜像源
- **JENKINS_UPDATE_CENTER**: Jenkins插件更新中心镜像源
- **NPM_REGISTRY**: NPM包管理器镜像源
- **GOPROXY**: Go模块代理
- **DOCKER_MIRRORS**: Docker镜像拉取镜像源
- **ALPINE_MIRROR**: Alpine Linux镜像源

## 修改镜像源

要修改镜像源配置，请编辑 `../scripts/mirrors.json` 文件，然后重新运行服务。

## 注意事项

1. 必须先运行 `setup-env.sh` 脚本设置环境变量，否则docker-compose会因为缺少环境变量而失败
2. 如果修改了 `mirrors.json` 文件，需要重新运行 `setup-env.sh` 脚本
3. 所有的镜像源配置都集中在 `mirrors.json` 文件中，便于统一管理和维护