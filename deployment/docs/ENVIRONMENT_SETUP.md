# 本地环境配置指南

本文档将帮助您配置运行 SiCal 部署方案所需的本地环境。

## 📋 环境检查结果

基于当前系统检查，以下是您的环境状态：

### ✅ 已安装的工具

- **Docker**: v28.3.2 ✅
- **Docker Compose**: v2.38.2 ✅
- **kubectl**: v1.33.3 ✅
- **Node.js**: v20.19.4 ✅
- **npm**: v10.8.2 ✅

### ❌ 需要安装的工具

- **Kind**: 未安装 ❌
- **Helm**: 未安装 ❌
- **Kubernetes 集群**: Docker Desktop 中未启用 ❌

## 🛠️ 安装缺失工具

### 1. 安装 Kind

Kind 是用于在 Docker 容器中运行本地 Kubernetes 集群的工具。

#### macOS 安装方法：

```bash
# 使用 Homebrew 安装（推荐）
brew install kind

# 或者使用 curl 直接下载
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-darwin-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

#### 验证安装：
```bash
kind version
```

### 2. 安装 Helm

Helm 是 Kubernetes 的包管理器。

#### macOS 安装方法：

```bash
# 使用 Homebrew 安装（推荐）
brew install helm

# 或者使用脚本安装
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### 验证安装：
```bash
helm version
```

### 3. 配置 Kubernetes 集群

您有两个选择：

#### 选项 A：使用 Kind（推荐）

安装 Kind 后，我们的部署脚本会自动创建和配置 Kind 集群。

#### 选项 B：启用 Docker Desktop Kubernetes

1. 打开 Docker Desktop
2. 进入 Settings（设置）
3. 选择 Kubernetes 标签页
4. 勾选 "Enable Kubernetes"
5. 点击 "Apply & Restart"

## 🚀 快速安装脚本

为了简化安装过程，您可以运行以下脚本：

```bash
#!/bin/bash

echo "🛠️  开始安装 SiCal 部署环境依赖..."

# 检查是否安装了 Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew 未安装，请先安装 Homebrew:"
    echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# 安装 Kind
echo "📦 安装 Kind..."
brew install kind

# 安装 Helm
echo "📦 安装 Helm..."
brew install helm

echo "✅ 安装完成！"
echo ""
echo "🔍 验证安装："
kind version
helm version

echo ""
echo "🚀 现在您可以运行部署脚本了："
echo "./deploy.sh --setup"
```

将上述脚本保存为 `install-deps.sh` 并运行：

```bash
chmod +x install-deps.sh
./install-deps.sh
```

## 📝 环境验证

安装完成后，运行以下命令验证环境：

```bash
# 检查所有必需工具
echo "=== 环境检查 ==="
docker --version
docker-compose --version
kind version
kubectl version --client
helm version
node --version
npm --version

echo ""
echo "✅ 如果所有命令都成功执行，您的环境已准备就绪！"
```

## 🔧 故障排除

### 常见问题

1. **Permission denied 错误**
   ```bash
   sudo chown -R $(whoami) /usr/local/bin
   ```

2. **Homebrew 安装失败**
   - 确保您有管理员权限
   - 检查网络连接
   - 参考 [Homebrew 官方文档](https://brew.sh/)

3. **Docker 权限问题**
   ```bash
   sudo usermod -aG docker $USER
   # 然后重新登录或重启终端
   ```

4. **Kind 集群创建失败**
   - 确保 Docker 正在运行
   - 检查是否有足够的系统资源（内存 > 4GB）
   - 关闭其他占用大量资源的应用

## 📚 参考资料

- [Kind 官方文档](https://kind.sigs.k8s.io/)
- [Helm 官方文档](https://helm.sh/docs/)
- [Docker Desktop 文档](https://docs.docker.com/desktop/)
- [kubectl 安装指南](https://kubernetes.io/docs/tasks/tools/)

## 🎯 下一步

环境配置完成后，您可以：

1. 运行环境初始化：`./deploy.sh --setup`
2. 构建和部署应用：`./deploy.sh`
3. 查看详细部署指南：[DEPLOYMENT.md](DEPLOYMENT.md)

如果遇到任何问题，请参考 [故障排除指南](DEPLOYMENT.md#故障排除) 或提交 Issue。