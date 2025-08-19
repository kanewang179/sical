#!/bin/bash

# SiCal项目 - 服务构建脚本
# 构建所有服务镜像
# 作者: AI Assistant

set -e

echo "🔨 SiCal项目服务构建脚本"
echo "================================================"

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
GITHUB_REPO="${GITHUB_REPO:-https://github.com/kanewang179/sical.git}"
GITHUB_BRANCH="main"

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$SCRIPT_DIR/../docker"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  --check                 仅检查Docker环境"
    echo "  --setup                 仅准备环境"
    echo "  --build                 仅构建服务镜像"
    echo "  --verify                仅验证构建结果"
    echo "  --skip-base-tools       跳过base-tools镜像构建（使用已有镜像）"
    echo "  --github-token TOKEN    设置GitHub访问令牌"
    echo ""
    echo "示例:"
    echo "  $0                      执行完整的服务构建"
    echo "  $0 --check             仅检查Docker环境"
    echo "  $0 --build             仅构建服务镜像"
    echo "  $0 --skip-base-tools   跳过base-tools构建"
    echo "  $0 --github-token xxx   使用GitHub令牌构建"
}

# 解析命令行参数
CHECK_ONLY=false
SETUP_ONLY=false
BUILD_ONLY=false
VERIFY_ONLY=false
SKIP_BASE_TOOLS=false
GITHUB_TOKEN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --check)
            CHECK_ONLY=true
            shift
            ;;
        --setup)
            SETUP_ONLY=true
            shift
            ;;
        --build)
            BUILD_ONLY=true
            shift
            ;;
        --verify)
            VERIFY_ONLY=true
            shift
            ;;
        --skip-base-tools)
            SKIP_BASE_TOOLS=true
            shift
            ;;
        --github-token)
            GITHUB_TOKEN="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 读取镜像源配置
load_mirrors_config() {
    local mirrors_file="$PROJECT_ROOT/deployment/mirrors.json"
    
    if [ ! -f "$mirrors_file" ]; then
        log_error "镜像源配置文件不存在: $mirrors_file"
        return 1
    fi
    
    # 使用 jq 或 python 解析 JSON（优先使用 jq）
    if command -v jq >/dev/null 2>&1; then
        KUBERNETES_OSS=$(jq -r '.mirrors.kubernetes_oss.repository' "$mirrors_file")
        HELM_REPOSITORY=$(jq -r '.mirrors.helm.repository' "$mirrors_file")
        GITHUB_PROXY=$(jq -r '.mirrors.github.releases' "$mirrors_file")
        DEBIAN_MIRROR=$(jq -r '.mirrors.debian.archive' "$mirrors_file")
        DEBIAN_SECURITY_MIRROR=$(jq -r '.mirrors.debian.security' "$mirrors_file")
        DOCKER_CE_MIRROR=$(jq -r '.mirrors.docker_ce.repository' "$mirrors_file")
        DOCKER_HUB_PROXY=$(jq -r '.mirrors.docker.hub_proxy.primary' "$mirrors_file")
        NODEJS_MIRROR=$(jq -r '.mirrors.nodejs.repository' "$mirrors_file")
        JENKINS_UPDATE_CENTER=$(jq -r '.mirrors.jenkins.update_center' "$mirrors_file")
    elif command -v python3 >/dev/null 2>&1; then
        local config=$(python3 -c "
import json
with open('$mirrors_file', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f\"KUBERNETES_OSS={data['mirrors']['kubernetes_oss']['repository']}\")
print(f\"HELM_REPOSITORY={data['mirrors']['helm']['repository']}\")
print(f\"GITHUB_PROXY={data['mirrors']['github']['releases']}\")
print(f\"DEBIAN_MIRROR={data['mirrors']['debian']['archive']}\")
print(f\"DEBIAN_SECURITY_MIRROR={data['mirrors']['debian']['security']}\")
print(f\"DOCKER_CE_MIRROR={data['mirrors']['docker_ce']['repository']}\")
print(f\"DOCKER_HUB_PROXY={data['mirrors']['docker']['hub_proxy']['primary']}\")
print(f\"NODEJS_MIRROR={data['mirrors']['nodejs']['repository']}\")
print(f\"JENKINS_UPDATE_CENTER={data['mirrors']['jenkins']['update_center']}\")
")
        eval "$config"
    else
        log_warning "未找到 jq 或 python3，使用默认镜像源配置"
        KUBERNETES_OSS="https://kubernetes.oss-cn-hangzhou.aliyuncs.com"
        HELM_REPOSITORY="https://mirrors.huaweicloud.com/helm/"
        GITHUB_PROXY="https://ghproxy.com/https://github.com"
        DEBIAN_MIRROR="https://mirrors.aliyun.com/debian/"
        DEBIAN_SECURITY_MIRROR="https://mirrors.aliyun.com/debian-security/"
        DOCKER_CE_MIRROR="https://mirrors.aliyun.com/docker-ce"
        DOCKER_HUB_PROXY="docker.unsee.tech"
        NODEJS_MIRROR="https://mirrors.aliyun.com/nodesource"
        JENKINS_UPDATE_CENTER="https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json"
    fi
    
    log_info "镜像源配置加载完成"
}

# 检查Docker环境
check_docker_environment() {
    log_step "检查Docker环境..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker守护进程未运行，请启动Docker"
        exit 1
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 准备环境
setup_environment() {
    log_step "准备Docker-only环境..."
    
    cd "$DOCKER_DIR"
    
    # 创建必要的目录
    mkdir -p "$PROJECT_ROOT/jenkins-data-github"
    mkdir -p "$DOCKER_DIR/kubeconfig"
    mkdir -p "$PROJECT_ROOT/logs"
    
    # 设置GitHub Token环境变量
    if [ -n "$GITHUB_TOKEN" ]; then
        export GITHUB_TOKEN="$GITHUB_TOKEN"
        log_success "GitHub Token已设置"
    fi
    
    log_success "环境准备完成"
}

# 构建所有服务
build_services() {
    log_info "构建所有服务镜像..."
    
    # 确保镜像源配置已加载
    if [ -z "$KUBERNETES_OSS" ]; then
        load_mirrors_config
    fi
    
    cd "$DOCKER_DIR"
    
    # 导出镜像源环境变量供 docker-compose 使用
    export KUBERNETES_OSS_REPO="$KUBERNETES_OSS"
    export HELM_REPO="$HELM_REPOSITORY"
    export GITHUB_PROXY="$GITHUB_PROXY"
    export DEBIAN_MIRROR="$DEBIAN_MIRROR"
    export DEBIAN_SECURITY_MIRROR="$DEBIAN_SECURITY_MIRROR"
    export DOCKER_CE_MIRROR="$DOCKER_CE_MIRROR"
    export DOCKER_HUB_PROXY="$DOCKER_HUB_PROXY"
    export NODEJS_MIRROR="$NODEJS_MIRROR"
    export JENKINS_UPDATE_CENTER="$JENKINS_UPDATE_CENTER"
    
    # 构建Jenkins GitHub镜像
    log_info "构建Jenkins GitHub镜像..."
    docker-compose -f docker-compose-docker-only.yml build jenkins-github
    
    # 构建Kind集群镜像
    log_info "构建Kind集群镜像..."
    docker-compose -f docker-compose-docker-only.yml build kind-cluster
    
    # 构建kubectl镜像
    log_info "构建kubectl镜像..."
    docker-compose -f docker-compose-docker-only.yml build kubectl
    
    # 根据选项决定是否构建base-tools
    if [ "$SKIP_BASE_TOOLS" = true ]; then
        log_info "跳过base-tools构建，使用已有镜像..."
        # 构建除base-tools外的所有服务
        docker-compose -f docker-compose-docker-only.yml build \
            --parallel \
            --build-arg BUILDKIT_INLINE_CACHE=1 \
            jenkins-github kind-cluster kubectl
    else
        log_info "构建所有服务镜像（包括base-tools）..."
        docker-compose -f docker-compose-docker-only.yml build \
            --parallel \
            --build-arg BUILDKIT_INLINE_CACHE=1
    fi
    
    log_success "所有服务镜像构建完成"
}

# 验证构建结果
verify_build() {
    log_info "验证构建结果..."
    
    # 检查基础工具镜像
    if docker images | grep -q "sical/base-tools"; then
        log_success "✅ 基础工具镜像: sical/base-tools"
    else
        log_warning "⚠️  基础工具镜像可能缺失: sical/base-tools"
    fi
    
    # 检查服务镜像
    local services=("jenkins-github" "kind-cluster" "kubectl")
    for service in "${services[@]}"; do
        if docker images | grep -q ".*${service}"; then
            log_success "✅ 服务镜像: ${service}"
        else
            log_warning "⚠️  服务镜像可能缺失: ${service}"
        fi
    done
    
    # 显示所有相关镜像
    log_info "所有相关镜像:"
    docker images | grep -E "(sical|jenkins|kind|kubectl)" || log_warning "未找到相关镜像"
    
    # 显示镜像大小统计
    log_info "镜像大小统计:"
    docker images | grep -E "(sical|jenkins|kind|kubectl)" | awk '{print $1":"$2"\t"$7$8}' || true
}

# 主函数
main() {
    if [ "$CHECK_ONLY" = true ]; then
        check_docker_environment
    elif [ "$SETUP_ONLY" = true ]; then
        check_docker_environment
        setup_environment
    elif [ "$BUILD_ONLY" = true ]; then
        check_docker_environment
        load_mirrors_config
        build_services
    elif [ "$VERIFY_ONLY" = true ]; then
        verify_build
    else
        # 完整的服务构建流程
        check_docker_environment
        setup_environment
        load_mirrors_config
        build_services
        verify_build
    fi
}

# 执行主函数
main "$@"