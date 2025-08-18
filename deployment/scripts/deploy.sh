#!/bin/bash

# SiCal项目 - 一键部署脚本
# 用于自动化部署前端应用到本地Docker和Kubernetes环境

set -e

echo "🚀 SiCal前端应用一键部署脚本"
echo "======================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="sical"
FRONTEND_IMAGE="sical-frontend"
REGISTRY_URL="localhost:5000"
KUBE_NAMESPACE="sical"
CLUSTER_NAME="sical-cluster"

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -s, --setup             初始化环境（安装Kind集群和Jenkins）"
    echo "  -b, --build             仅构建前端镜像"
    echo "  -d, --deploy            仅部署到Kubernetes"
    echo "  -c, --clean             清理所有资源"
    echo "  -r, --restart           重启服务"
    echo "  --skip-tests            跳过测试步骤"
    echo "  --skip-build            跳过构建步骤"
    echo "  --dev                   开发模式部署"
    echo "  --configure-mirrors     配置Docker和Kind镜像源"
    echo ""
    echo "示例:"
    echo "  $0                      完整部署流程"
    echo "  $0 --setup              初始化环境"
    echo "  $0 --build              仅构建镜像"
    echo "  $0 --deploy             仅部署应用"
    echo "  $0 --clean              清理环境"
    echo "  $0 --configure-mirrors  配置镜像源（解决网络问题）"
}

# 解析命令行参数
SETUP_ONLY=false
BUILD_ONLY=false
DEPLOY_ONLY=false
CLEAN_ONLY=false
RESTART_ONLY=false
SKIP_TESTS=false
SKIP_BUILD=false
DEV_MODE=false
CONFIGURE_MIRRORS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--setup)
            SETUP_ONLY=true
            shift
            ;;
        -b|--build)
            BUILD_ONLY=true
            shift
            ;;
        -d|--deploy)
            DEPLOY_ONLY=true
            shift
            ;;
        -c|--clean)
            CLEAN_ONLY=true
            shift
            ;;
        -r|--restart)
            RESTART_ONLY=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        --configure-mirrors)
            CONFIGURE_MIRRORS=true
            shift
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 检查必要工具
check_prerequisites() {
    echo -e "${BLUE}🔍 检查必要工具...${NC}"
    
    local missing_tools=()
    
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v docker-compose >/dev/null 2>&1 || missing_tools+=("docker-compose")
    command -v kind >/dev/null 2>&1 || missing_tools+=("kind")
    command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
    command -v helm >/dev/null 2>&1 || missing_tools+=("helm")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}❌ 缺少必要工具: ${missing_tools[*]}${NC}"
        echo -e "${YELLOW}请安装缺少的工具后重试${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
}

# 环境初始化
setup_environment() {
    echo -e "${PURPLE}🛠️  初始化环境...${NC}"
    
    # 获取脚本目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    
    # 设置脚本执行权限
    chmod +x "$SCRIPT_DIR"/*.sh
    
    # 创建必要目录
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/jenkins-data"
    
    # 启动基础服务
    echo -e "${BLUE}启动基础服务...${NC}"
    cd "$SCRIPT_DIR/../docker"
    docker-compose up -d registry postgres redis
    cd "$PROJECT_ROOT"
    
    # 等待服务启动
    sleep 10
    
    # 设置Kubernetes集群
    echo -e "${BLUE}设置Kubernetes集群...${NC}"
    "$SCRIPT_DIR/setup-k8s.sh"
    
    # 设置Jenkins
    echo -e "${BLUE}设置Jenkins...${NC}"
    "$SCRIPT_DIR/setup-jenkins.sh"
    
    echo -e "${GREEN}✅ 环境初始化完成${NC}"
}

# 运行测试
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        echo -e "${YELLOW}⏭️  跳过测试步骤${NC}"
        return
    fi
    
    echo -e "${BLUE}🧪 运行前端测试...${NC}"
    
    # 获取项目根目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    
    cd "$PROJECT_ROOT/frontend"
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}安装依赖...${NC}"
        npm install
    fi
    
    # 运行测试
    npm run test -- --watchAll=false --coverage
    
    cd ..
    
    echo -e "${GREEN}✅ 测试通过${NC}"
}

# 构建前端镜像
build_frontend() {
    if [ "$SKIP_BUILD" = true ]; then
        echo -e "${YELLOW}⏭️  跳过构建步骤${NC}"
        return
    fi
    
    echo -e "${BLUE}🏗️  构建前端镜像...${NC}"
    
    cd frontend
    
    # 构建Docker镜像
    local image_tag="${REGISTRY_URL}/${FRONTEND_IMAGE}:$(date +%Y%m%d-%H%M%S)"
    local latest_tag="${REGISTRY_URL}/${FRONTEND_IMAGE}:latest"
    
    docker build -t "$image_tag" -t "$latest_tag" .
    
    # 推送到本地Registry
    docker push "$image_tag"
    docker push "$latest_tag"
    
    # 保存镜像标签
    echo "$image_tag" > "$PROJECT_ROOT/logs/latest-image-tag.txt"
    
    cd "$PROJECT_ROOT"
    
    echo -e "${GREEN}✅ 前端镜像构建完成: $image_tag${NC}"
}

# 部署到Kubernetes
deploy_to_kubernetes() {
    echo -e "${BLUE}🚀 部署到Kubernetes...${NC}"
    
    # 确保使用正确的上下文
    kubectl config use-context kind-${CLUSTER_NAME}
    
    # 获取部署配置目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    K8S_DIR="$SCRIPT_DIR/../k8s"
    
    # 创建命名空间
    kubectl apply -f "$K8S_DIR/namespace.yaml"
    
    # 应用ConfigMap
    kubectl apply -f "$K8S_DIR/configmap.yaml"
    
    # 更新部署镜像
    if [ -f "$PROJECT_ROOT/logs/latest-image-tag.txt" ]; then
        local image_tag=$(cat "$PROJECT_ROOT/logs/latest-image-tag.txt")
        kubectl set image deployment/sical-frontend sical-frontend="$image_tag" -n "$KUBE_NAMESPACE"
    fi
    
    # 应用部署配置
    kubectl apply -f "$K8S_DIR/frontend-deployment.yaml"
    
    # 等待部署完成
    kubectl rollout status deployment/sical-frontend -n "$KUBE_NAMESPACE" --timeout=300s
    
    # 验证部署
    kubectl get pods -n "$KUBE_NAMESPACE"
    
    echo -e "${GREEN}✅ 部署完成${NC}"
}

# 健康检查
health_check() {
    echo -e "${BLUE}🏥 执行健康检查...${NC}"
    
    # 检查Pod状态
    local ready_pods=$(kubectl get pods -n "$KUBE_NAMESPACE" -l app=sical-frontend --field-selector=status.phase=Running --no-headers | wc -l)
    
    if [ "$ready_pods" -gt 0 ]; then
        echo -e "${GREEN}✅ 应用Pod运行正常 ($ready_pods 个)${NC}"
    else
        echo -e "${RED}❌ 应用Pod未正常运行${NC}"
        kubectl describe pods -n "$KUBE_NAMESPACE" -l app=sical-frontend
        return 1
    fi
    
    # 检查服务
    local service_status=$(kubectl get service sical-frontend-service -n "$KUBE_NAMESPACE" --no-headers 2>/dev/null | wc -l)
    
    if [ "$service_status" -gt 0 ]; then
        echo -e "${GREEN}✅ 服务运行正常${NC}"
    else
        echo -e "${RED}❌ 服务未正常运行${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ 健康检查通过${NC}"
}

# 配置镜像源
configure_registry_mirrors() {
    echo -e "${BLUE}🔧 配置Docker和Kind镜像源...${NC}"
    
    # 获取项目根目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    
    # 检查镜像源配置脚本是否存在
    MIRROR_SCRIPT="$PROJECT_ROOT/configure-registry-mirrors.sh"
    
    if [ ! -f "$MIRROR_SCRIPT" ]; then
        echo -e "${RED}❌ 镜像源配置脚本不存在: $MIRROR_SCRIPT${NC}"
        echo -e "${YELLOW}请确保 configure-registry-mirrors.sh 脚本存在于项目根目录${NC}"
        exit 1
    fi
    
    # 执行镜像源配置脚本
    echo -e "${BLUE}执行镜像源配置脚本...${NC}"
    cd "$PROJECT_ROOT"
    bash "$MIRROR_SCRIPT"
    
    echo -e "${GREEN}✅ 镜像源配置完成${NC}"
    echo -e "${YELLOW}⚠️  请重启 Docker Desktop 以应用新配置${NC}"
    echo -e "${BLUE}配置完成后，可以使用以下命令创建集群:${NC}"
    echo "kind create cluster --config deployment/k8s/kind-config-with-mirrors.yaml"
}

# 清理资源
clean_resources() {
    echo -e "${YELLOW}🧹 清理资源...${NC}"
    
    # 删除Kubernetes资源
    kubectl delete namespace "$KUBE_NAMESPACE" --ignore-not-found=true
    
    # 停止Docker服务
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR/../docker"
    docker-compose down -v
    
    # 删除Kind集群
    kind delete cluster --name "$CLUSTER_NAME"
    
    # 清理Docker镜像
    docker rmi $(docker images "${REGISTRY_URL}/${FRONTEND_IMAGE}" -q) 2>/dev/null || true
    
    # 清理日志
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    rm -rf "$PROJECT_ROOT/logs"/*
    
    echo -e "${GREEN}✅ 资源清理完成${NC}"
}

# 重启服务
restart_services() {
    echo -e "${BLUE}🔄 重启服务...${NC}"
    
    # 重启Kubernetes部署
    kubectl rollout restart deployment/sical-frontend -n "$KUBE_NAMESPACE"
    kubectl rollout status deployment/sical-frontend -n "$KUBE_NAMESPACE" --timeout=300s
    
    # 重启Docker服务
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR/../docker"
    docker-compose restart
    
    echo -e "${GREEN}✅ 服务重启完成${NC}"
}

# 显示访问信息
show_access_info() {
    echo -e "${CYAN}======================================${NC}"
    echo -e "${GREEN}🎉 SiCal前端应用部署完成！${NC}"
    echo -e "${CYAN}======================================${NC}"
    echo -e "${BLUE}访问信息:${NC}"
    echo "• 前端应用: http://sical.local (需要配置hosts)"
    echo "• Jenkins: http://localhost:8080 (admin/admin123)"
    echo "• Kubernetes Dashboard: kubectl proxy"
    echo "• 本地Registry: http://localhost:5000"
    echo ""
    echo -e "${YELLOW}配置hosts文件:${NC}"
    echo "echo '127.0.0.1 sical.local' | sudo tee -a /etc/hosts"
    echo ""
    echo -e "${YELLOW}常用命令:${NC}"
    echo "• 查看Pod状态: kubectl get pods -n $KUBE_NAMESPACE"
    echo "• 查看日志: kubectl logs -f deployment/sical-frontend -n $KUBE_NAMESPACE"
    echo "• 重新部署: $0 --restart"
    echo "• 清理环境: $0 --clean"
}

# 主函数
main() {
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 检查必要工具
    check_prerequisites
    
    # 根据参数执行相应操作
    if [ "$CONFIGURE_MIRRORS" = true ]; then
        configure_registry_mirrors
        exit 0
    elif [ "$CLEAN_ONLY" = true ]; then
        clean_resources
        exit 0
    elif [ "$SETUP_ONLY" = true ]; then
        setup_environment
        exit 0
    elif [ "$BUILD_ONLY" = true ]; then
        run_tests
        build_frontend
        exit 0
    elif [ "$DEPLOY_ONLY" = true ]; then
        deploy_to_kubernetes
        health_check
        show_access_info
        exit 0
    elif [ "$RESTART_ONLY" = true ]; then
        restart_services
        health_check
        exit 0
    fi
    
    # 完整部署流程
    echo -e "${PURPLE}开始完整部署流程...${NC}"
    
    # 如果是首次运行，初始化环境
    if ! kind get clusters | grep -q "$CLUSTER_NAME"; then
        setup_environment
    fi
    
    # 运行测试
    run_tests
    
    # 构建镜像
    build_frontend
    
    # 部署应用
    deploy_to_kubernetes
    
    # 健康检查
    health_check
    
    # 显示访问信息
    show_access_info
    
    # 计算总耗时
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    echo -e "${GREEN}✅ 部署完成，总耗时: ${duration}秒${NC}"
}

# 错误处理
trap 'echo -e "${RED}❌ 部署过程中发生错误${NC}"; exit 1' ERR

# 执行主函数
main "$@"