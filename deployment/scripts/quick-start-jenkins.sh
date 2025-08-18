#!/bin/bash

# 快速启动 Jenkins 服务（使用现有镜像）
echo "🚀 快速启动 Jenkins 服务..."

# 检查是否在项目根目录
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 停止现有的 Jenkins 服务
echo "🛑 停止现有 Jenkins 服务..."
docker-compose -f deployment/docker/docker-compose.yml down 2>/dev/null || true

# 创建必要的目录
mkdir -p jenkins-data

# 启动 Jenkins 服务（使用官方镜像）
echo "🔧 启动 Jenkins 服务..."
cat > deployment/docker/docker-compose-quick.yml << 'EOF'
version: '3.8'
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins-github
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - ./../../jenkins-data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JENKINS_OPTS=--httpPort=8080
    user: root
EOF

# 启动服务
docker-compose -f deployment/docker/docker-compose-quick.yml up -d

# 等待 Jenkins 启动
echo "⏳ 等待 Jenkins 启动..."
sleep 10

# 检查服务状态
if docker ps | grep -q jenkins-github; then
    echo "✅ Jenkins 服务启动成功！"
    echo ""
    echo "📋 访问信息:"
    echo "   Jenkins URL: http://localhost:8080"
    echo ""
    echo "🔑 获取初始密码:"
    echo "   docker exec jenkins-github cat /var/jenkins_home/secrets/initialAdminPassword"
    echo ""
    echo "📝 下一步操作:"
    echo "   1. 访问 Jenkins 并完成初始设置"
    echo "   2. 安装推荐的插件"
    echo "   3. 创建管理员用户"
    echo "   4. 配置 GitHub 凭据"
    echo "   5. 创建新的 Pipeline 项目"
else
    echo "❌ Jenkins 启动失败，请检查 Docker 服务"
    exit 1
fi