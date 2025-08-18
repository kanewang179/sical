# SiCal前端部署 - 快速开始指南

🚀 **5分钟快速部署SiCal前端应用到本地Kubernetes环境**

## 📋 前置条件

确保已安装以下工具：

```bash
# 检查工具是否已安装
docker --version
docker-compose --version
kind --version
kubectl version --client
helm version
```

如果缺少工具，请参考 [DEPLOYMENT.md](./DEPLOYMENT.md#系统要求) 进行安装。

## 🎯 一键部署

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd sical
```

### 2. 执行部署脚本

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 一键部署（包含环境初始化、构建、部署）
./deploy.sh
```

### 3. 配置域名解析

```bash
# 添加本地域名解析
echo '127.0.0.1 sical.local' | sudo tee -a /etc/hosts
```

### 4. 访问应用

- **前端应用**: http://sical.local
- **Jenkins**: http://localhost:8080 (用户名: admin, 密码: admin123)

## 🔧 分步部署（可选）

如果需要分步执行，可以使用以下命令：

```bash
# 1. 仅初始化环境
./deploy.sh --setup

# 2. 仅构建镜像
./deploy.sh --build

# 3. 仅部署应用
./deploy.sh --deploy
```

## 📊 验证部署

```bash
# 检查Pod状态
kubectl get pods -n sical

# 检查服务状态
kubectl get services -n sical

# 查看应用日志
kubectl logs -f deployment/sical-frontend -n sical
```

## 🛠️ 常用操作

```bash
# 重启应用
./deploy.sh --restart

# 清理环境
./deploy.sh --clean

# 查看帮助
./deploy.sh --help
```

## 🐛 遇到问题？

1. **检查所有服务状态**:
   ```bash
   kubectl get all -n sical
   docker-compose ps
   ```

2. **查看详细日志**:
   ```bash
   kubectl describe pods -n sical
   docker logs jenkins
   ```

3. **重新部署**:
   ```bash
   ./deploy.sh --clean
   ./deploy.sh
   ```

更多故障排除信息请参考 [DEPLOYMENT.md](./DEPLOYMENT.md#故障排除)。

## 📚 更多信息

- [详细部署文档](./DEPLOYMENT.md)
- [项目架构说明](./DEPLOYMENT.md#架构说明)
- [维护操作指南](./DEPLOYMENT.md#维护操作)

---

**🎉 恭喜！您已成功部署SiCal前端应用！**