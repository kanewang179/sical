#!/bin/bash

# 启动支持 GitHub 集成的 Jenkins 服务
# 简化版本，不需要 sudo 权限

set -e

echo "🚀 启动支持 GitHub 集成的 Jenkins 服务..."

# 检查当前目录
if [ ! -f "deployment/scripts/setup-jenkins-github.sh" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 进入 Docker 目录
cd deployment/docker

# 停止现有的 Jenkins 服务（如果正在运行）
echo "📦 停止现有的 Jenkins 服务..."
docker-compose down || true

# 构建新的 Jenkins 镜像
echo "🔨 构建支持 GitHub 的 Jenkins 镜像..."
docker build -t jenkins-github:latest -f jenkins/Dockerfile.github jenkins/

# 更新 docker-compose.yml 使用新镜像
echo "📝 更新 Docker Compose 配置..."
cp docker-compose.yml docker-compose.yml.bak
sed 's/image: jenkins-custom:latest/image: jenkins-github:latest/' docker-compose.yml.bak > docker-compose.yml

# 启动 Jenkins 服务
echo "🚀 启动 Jenkins 服务..."
docker-compose up -d

# 等待 Jenkins 启动
echo "⏳ 等待 Jenkins 启动..."
sleep 30

# 检查 Jenkins 状态
echo "🔍 检查 Jenkins 状态..."
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Jenkins 已成功启动!"
    echo ""
    echo "📋 访问信息:"
    echo "   URL: http://localhost:8080"
    echo "   用户名: admin"
    echo "   密码: admin123"
    echo ""
    echo "🔧 GitHub 配置已应用:"
    echo "   仓库: https://github.com/kanewang179/sical.git"
    echo "   用户名: kanewang179"
    echo "   Token: 已配置"
    echo ""
    echo "📝 下一步:"
    echo "   1. 访问 Jenkins Web 界面"
    echo "   2. 检查 Pipeline 任务 'sical-frontend-deploy-github'"
    echo "   3. 手动触发构建测试"
else
    echo "❌ Jenkins 启动失败，请检查日志:"
    echo "   docker-compose logs jenkins"
    exit 1
fi

echo "🎉 Jenkins GitHub 集成服务启动完成!"