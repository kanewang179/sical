#!/bin/bash

# Docker 国内镜像源配置脚本
# 解决国内网络环境下 Docker 镜像拉取问题

echo "🇨🇳 配置 Docker 国内镜像源"
echo "======================================"

# Docker 配置目录
DOCKER_CONFIG_DIR="$HOME/.docker"
echo "📍 Docker 配置目录: $DOCKER_CONFIG_DIR"

# 创建配置目录（如果不存在）
mkdir -p "$DOCKER_CONFIG_DIR"

# 停止 Docker Desktop
echo "⏹️  停止 Docker Desktop..."
osascript -e 'quit app "Docker Desktop"' 2>/dev/null || true
sleep 5

# 备份现有配置
if [ -f "$DOCKER_CONFIG_DIR/daemon.json" ]; then
    BACKUP_FILE="$DOCKER_CONFIG_DIR/daemon.json.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$DOCKER_CONFIG_DIR/daemon.json" "$BACKUP_FILE"
    echo "📝 备份现有配置到: $BACKUP_FILE"
fi

# 创建包含多个国内镜像源的配置
echo "📝 创建国内镜像源配置..."
cat > "$DOCKER_CONFIG_DIR/daemon.json" << 'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://docker.nju.edu.cn",
    "https://docker.mirrors.ustc.edu.cn",
    "https://reg-mirror.qiniu.com",
    "https://registry.docker-cn.com"
  ],
  "insecure-registries": [
    "localhost:5000",
    "127.0.0.1:5000",
    "docker.m.daocloud.io",
    "dockerproxy.com",
    "docker.nju.edu.cn",
    "docker.mirrors.ustc.edu.cn",
    "reg-mirror.qiniu.com",
    "registry.docker-cn.com"
  ],
  "experimental": false,
  "debug": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

echo "✅ Docker 配置创建完成"
echo "📋 新配置内容:"
cat "$DOCKER_CONFIG_DIR/daemon.json"

# 启动 Docker Desktop
echo "🚀 启动 Docker Desktop..."
open -a "Docker Desktop"
echo "⏳ 等待 Docker Desktop 启动..."
sleep 30

# 等待 Docker 服务启动
echo "⏳ 等待 Docker 服务就绪..."
for i in {1..30}; do
    if docker info > /dev/null 2>&1; then
        echo "✅ Docker 服务已启动"
        break
    fi
    echo "等待中... ($i/30)"
    sleep 2
done

# 测试镜像源连通性
echo ""
echo "🌐 测试镜像源连通性..."
MIRRORS=(
    "https://docker.m.daocloud.io"
    "https://dockerproxy.com"
    "https://docker.nju.edu.cn"
    "https://docker.mirrors.ustc.edu.cn"
    "https://reg-mirror.qiniu.com"
    "https://registry.docker-cn.com"
)

for mirror in "${MIRRORS[@]}"; do
    echo "测试: $mirror"
    if curl -I "$mirror/v2/" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
        echo "✅ $mirror - 连接正常"
    else
        echo "❌ $mirror - 连接失败"
    fi
done

# 测试镜像拉取
echo ""
echo "🧪 测试镜像拉取..."
echo "测试镜像: hello-world"
if docker pull hello-world:latest; then
    echo "✅ hello-world 拉取成功"
else
    echo "❌ hello-world 拉取失败"
fi

echo "测试镜像: alpine"
if docker pull alpine:latest; then
    echo "✅ alpine 拉取成功"
else
    echo "❌ alpine 拉取失败"
fi

echo "测试镜像: node:18-alpine"
if docker pull node:18-alpine; then
    echo "✅ node:18-alpine 拉取成功"
else
    echo "❌ node:18-alpine 拉取失败"
fi

echo "======================================"
echo "🎉 Docker 国内镜像源配置完成！"
echo ""
echo "📝 配置说明:"
echo "   - 已配置多个国内镜像源，Docker 会自动选择可用的源"
echo "   - 如果某个源不可用，会自动尝试下一个源"
echo "   - 配置文件位置: $DOCKER_CONFIG_DIR/daemon.json"
echo ""
echo "🔧 其他解决方案:"
echo "   1. 使用代理: 配置 HTTP/HTTPS 代理"
echo "   2. 手动下载: 从其他渠道下载镜像文件后导入"
echo "   3. 私有仓库: 搭建内网 Docker 仓库"
echo "   4. 云服务: 使用阿里云、腾讯云等容器镜像服务"
echo ""
echo "💡 如果仍有问题，请尝试:"
echo "   - 重启 Docker Desktop"
echo "   - 检查网络连接"
echo "   - 使用 VPN 或代理"
echo "   - 联系网络管理员"