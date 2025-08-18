#!/bin/bash

# 验证无 VPN 环境下 Docker 镜像拉取功能
echo "🔍 验证无 VPN 环境下 Docker 功能"
echo "======================================"

# 检查当前镜像源配置
echo "📋 当前镜像源配置:"
docker info | grep -A 10 'Registry Mirrors'
echo ""

# 测试各种类型的镜像拉取
echo "🧪 测试镜像拉取功能..."
echo ""

# 测试小镜像
echo "1. 测试小镜像 (busybox):"
if docker pull busybox:latest; then
    echo "✅ busybox 拉取成功"
else
    echo "❌ busybox 拉取失败"
fi
echo ""

# 测试中等镜像
echo "2. 测试中等镜像 (ubuntu:20.04):"
if docker pull ubuntu:20.04; then
    echo "✅ ubuntu:20.04 拉取成功"
else
    echo "❌ ubuntu:20.04 拉取失败"
fi
echo ""

# 测试开发常用镜像
echo "3. 测试开发常用镜像 (postgres:13):"
if docker pull postgres:13; then
    echo "✅ postgres:13 拉取成功"
else
    echo "❌ postgres:13 拉取失败"
fi
echo ""

# 测试构建镜像
echo "4. 测试构建镜像 (maven:3.8-openjdk-11):"
if docker pull maven:3.8-openjdk-11; then
    echo "✅ maven:3.8-openjdk-11 拉取成功"
else
    echo "❌ maven:3.8-openjdk-11 拉取失败"
fi
echo ""

# 检查已拉取的镜像
echo "📦 已拉取的镜像列表:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -10
echo ""

# 测试容器运行
echo "🚀 测试容器运行功能..."
echo "启动 hello-world 容器:"
if docker run --rm hello-world; then
    echo "✅ 容器运行成功"
else
    echo "❌ 容器运行失败"
fi
echo ""

# 测试网络连接性
echo "🌐 测试网络连接性..."
echo "启动临时 alpine 容器测试网络:"
if docker run --rm alpine:latest ping -c 3 baidu.com; then
    echo "✅ 容器网络连接正常"
else
    echo "❌ 容器网络连接失败"
fi
echo ""

# 清理测试镜像（可选）
echo "🧹 清理测试镜像 (可选):"
echo "如需清理测试镜像，请运行:"
echo "docker rmi busybox:latest ubuntu:20.04 postgres:13 maven:3.8-openjdk-11"
echo ""

echo "======================================"
echo "🎉 Docker 无 VPN 环境验证完成！"
echo ""
echo "📊 总结:"
echo "   - 镜像源: 使用国内镜像源 (daocloud.io 等)"
echo "   - 拉取功能: 已测试多种类型镜像"
echo "   - 容器运行: 已验证基本功能"
echo "   - 网络连接: 已测试容器内网络"
echo ""
echo "💡 如果遇到问题:"
echo "   1. 检查网络连接"
echo "   2. 重启 Docker Desktop"
echo "   3. 尝试其他镜像源"
echo "   4. 检查防火墙设置"