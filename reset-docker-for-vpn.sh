#!/bin/bash

# 重置 Docker 配置以使用 VPN 连接官方源
echo "🔧 重置 Docker 配置 - 使用官方源（VPN 环境）"
echo "======================================"

# Docker 配置目录
DOCKER_CONFIG_DIR="$HOME/.docker"
echo "📍 Docker 配置目录: $DOCKER_CONFIG_DIR"

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

# 创建简化配置（仅保留本地注册表设置）
echo "📝 创建简化 Docker 配置（官方源）..."
cat > "$DOCKER_CONFIG_DIR/daemon.json" << 'EOF'
{
  "insecure-registries": [
    "localhost:5000",
    "127.0.0.1:5000"
  ],
  "experimental": false,
  "debug": false
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

# 测试网络连接
echo ""
echo "🌐 测试网络连接..."
echo "测试 Docker Hub 连接:"
if curl -I https://registry-1.docker.io/v2/ --connect-timeout 10 --max-time 30; then
    echo "✅ Docker Hub 连接正常"
else
    echo "❌ Docker Hub 连接失败"
fi

# 测试镜像拉取
echo ""
echo "🧪 测试镜像拉取（官方源 + VPN）..."
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
echo "🎉 Docker 配置重置完成！"
echo "📝 现在使用官方 Docker Hub（通过 VPN）"
echo "📁 备份文件位置: $BACKUP_FILE"