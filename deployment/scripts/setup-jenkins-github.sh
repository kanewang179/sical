#!/bin/bash

# SiCal Jenkins GitHub集成环境设置脚本
# 此脚本用于设置支持从GitHub拉取代码的Jenkins环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}🚀 开始设置SiCal Jenkins GitHub集成环境...${NC}"
echo "项目根目录: $PROJECT_ROOT"

# 检查必要工具
check_prerequisites() {
    echo -e "${BLUE}检查必要工具...${NC}"
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose未安装，请先安装Docker Compose${NC}"
        exit 1
    fi
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git未安装，请先安装Git${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
}

# 构建Jenkins镜像
build_jenkins_image() {
    echo -e "${BLUE}构建Jenkins镜像...${NC}"
    
    cd "$SCRIPT_DIR/../docker/jenkins"
    
    # 备份原始初始化脚本
    if [ -f "init.groovy" ]; then
        cp init.groovy init.groovy.backup
    fi
    
    # 使用GitHub集成的初始化脚本
    cp init-github.groovy init.groovy
    
    # 构建镜像
    docker build -t sical-jenkins:github .
    
    # 恢复原始脚本
    if [ -f "init.groovy.backup" ]; then
        mv init.groovy.backup init.groovy
    else
        rm -f init.groovy
    fi
    
    cd "$PROJECT_ROOT"
    
    echo -e "${GREEN}✅ Jenkins镜像构建完成${NC}"
}

# 启动Jenkins服务
start_jenkins() {
    echo -e "${BLUE}启动Jenkins服务...${NC}"
    
    # 停止现有的Jenkins容器
    docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.yml" down jenkins || true
    
    # 创建Jenkins数据目录
    mkdir -p "$PROJECT_ROOT/jenkins-data"
    sudo chown -R 1000:1000 "$PROJECT_ROOT/jenkins-data" || true
    
    # 更新docker-compose.yml以使用新镜像
    cd "$SCRIPT_DIR/../docker"
    
    # 备份原始docker-compose.yml
    cp docker-compose.yml docker-compose.yml.backup
    
    # 替换Jenkins镜像
    sed -i.bak 's|image: jenkins/jenkins:lts|image: sical-jenkins:github|g' docker-compose.yml
    
    # 启动Jenkins容器
    docker-compose up -d jenkins
    
    # 恢复原始docker-compose.yml
    mv docker-compose.yml.backup docker-compose.yml
    rm -f docker-compose.yml.bak
    
    cd "$PROJECT_ROOT"
    
    echo -e "${YELLOW}等待Jenkins启动...${NC}"
    sleep 30
    
    # 等待Jenkins完全启动
    local max_attempts=30
    local attempt=1
    
    while ! curl -s http://localhost:8080/login >/dev/null; do
        if [ $attempt -ge $max_attempts ]; then
            echo -e "${RED}❌ Jenkins启动超时${NC}"
            exit 1
        fi
        echo "等待Jenkins启动... (尝试 $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    echo -e "${GREEN}✅ Jenkins启动完成${NC}"
}

# 配置Jenkins与Kubernetes集成
setup_kubernetes_integration() {
    echo -e "${BLUE}配置Jenkins与Kubernetes集成...${NC}"
    
    # 获取Kubernetes配置
    KUBE_CONFIG_PATH="$HOME/.kube/config"
    
    if [ -f "$KUBE_CONFIG_PATH" ]; then
        # 复制kubeconfig到Jenkins容器
        docker cp "$KUBE_CONFIG_PATH" jenkins:/var/jenkins_home/.kube/config
        docker exec jenkins chown jenkins:jenkins /var/jenkins_home/.kube/config
        
        echo -e "${GREEN}✅ Kubernetes配置已复制到Jenkins${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到Kubernetes配置文件，请手动配置${NC}"
    fi
}

# 配置Docker集成
setup_docker_integration() {
    echo -e "${BLUE}配置Jenkins与Docker集成...${NC}"
    
    # 确保Jenkins容器可以访问Docker socket
    docker exec jenkins ls -la /var/run/docker.sock
    
    echo -e "${GREEN}✅ Docker集成配置完成${NC}"
}

# 验证Jenkins配置
verify_jenkins() {
    echo -e "${BLUE}验证Jenkins配置...${NC}"
    
    # 检查Jenkins状态
    if curl -s http://localhost:8080/login | grep -q "Jenkins"; then
        echo -e "${GREEN}✅ Jenkins Web界面可访问${NC}"
    else
        echo -e "${RED}❌ Jenkins Web界面不可访问${NC}"
    fi
    
    # 检查Docker连接
    if docker exec jenkins docker version >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Jenkins可以访问Docker${NC}"
    else
        echo -e "${RED}❌ Jenkins无法访问Docker${NC}"
    fi
    
    # 检查kubectl连接
    if docker exec jenkins kubectl version --client >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Jenkins可以访问kubectl${NC}"
    else
        echo -e "${RED}❌ Jenkins无法访问kubectl${NC}"
    fi
    
    # 检查Git
    if docker exec jenkins git --version >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Jenkins可以访问Git${NC}"
    else
        echo -e "${RED}❌ Jenkins无法访问Git${NC}"
    fi
}

# 显示配置指南
show_configuration_guide() {
    echo -e "${GREEN}🎉 SiCal Jenkins GitHub集成环境设置完成！${NC}"
    echo -e "${BLUE}访问信息:${NC}"
    echo "• Jenkins URL: http://localhost:8080"
    echo "• 用户名: admin"
    echo "• 密码: admin123"
    echo "• Pipeline任务: sical-frontend-deploy-github"
    echo ""
    echo -e "${YELLOW}重要配置步骤:${NC}"
    echo "1. 访问Jenkins Web界面 (http://localhost:8080)"
    echo "2. 使用 admin/admin123 登录"
    echo "3. 进入 'Manage Jenkins' > 'Manage Credentials'"
    echo "4. 更新 'git-credentials' 凭据:"
    echo "   - 用户名: 你的GitHub用户名"
    echo "   - 密码: 你的GitHub Personal Access Token"
    echo "5. 编辑Pipeline任务 'sical-frontend-deploy-github':"
    echo "   - 更新Git仓库URL为实际的GitHub仓库地址 (https://github.com/kanewang179/sical.git)"
    echo "   - 确认分支名称 (默认: main)"
    echo "6. 在GitHub仓库中配置Webhook:"
    echo "   - URL: http://your-jenkins-url:8080/github-webhook/"
    echo "   - 事件: Push events, Pull request events"
    echo "7. 运行第一次构建测试"
    echo ""
    echo -e "${BLUE}文件说明:${NC}"
    echo "• frontend/Dockerfile.multistage: 多阶段构建Dockerfile"
    echo "• deployment/ci/Jenkinsfile.github: GitHub集成的Jenkinsfile"
    echo "• deployment/docker/jenkins/init-github.groovy: GitHub集成初始化脚本"
    echo ""
    echo -e "${YELLOW}注意事项:${NC}"
    echo "• 确保GitHub仓库是公开的，或者配置了正确的访问权限"
    echo "• Personal Access Token需要repo权限"
    echo "• 如果使用私有仓库，需要配置SSH密钥或Personal Access Token"
}

# 清理函数
cleanup() {
    echo -e "${BLUE}清理临时文件...${NC}"
    # 清理可能的临时文件
}

# 错误处理
trap cleanup EXIT

# 主函数
main() {
    check_prerequisites
    build_jenkins_image
    start_jenkins
    setup_kubernetes_integration
    setup_docker_integration
    verify_jenkins
    show_configuration_guide
}

# 执行主函数
main "$@"