#!/bin/bash

# SiCal项目 - 构建优化脚本
# 优化Docker构建过程，提高构建效率
# 作者: AI Assistant

set -e

echo "⚡ SiCal项目构建优化脚本"
echo "================================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
    echo "  --setup-buildx          仅配置Docker buildx"
    echo "  --clean-cache           仅清理Docker缓存"
    echo "  --skip-cache            跳过清理Docker缓存"
    echo "  --build-base            仅构建基础工具镜像"
    echo "  --verify                仅验证构建结果"
    echo ""
    echo "示例:"
    echo "  $0                      执行完整的构建优化"
    echo "  $0 --check             仅检查Docker环境"
    echo "  $0 --skip-cache        跳过清理Docker缓存"
    echo "  $0 --clean-cache       仅清理Docker缓存"
    echo "  $0 --build-base        仅构建基础工具镜像"
}

# 解析命令行参数
CHECK_ONLY=false
SETUP_BUILDX_ONLY=false
CLEAN_CACHE_ONLY=false
SKIP_CACHE=false
BUILD_BASE_ONLY=false
VERIFY_ONLY=false

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
        --setup-buildx)
            SETUP_BUILDX_ONLY=true
            shift
            ;;
        --clean-cache)
            CLEAN_CACHE_ONLY=true
            shift
            ;;
        --skip-cache)
            SKIP_CACHE=true
            shift
            ;;
        --build-base)
            BUILD_BASE_ONLY=true
            shift
            ;;
        --verify)
            VERIFY_ONLY=true
            shift
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
    elif command -v python3 >/dev/null 2>&1; then
        local config=$(python3 -c "
import json
with open('$mirrors_file', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f\"KUBERNETES_OSS={data['mirrors']['kubernetes_oss']['repository']}\")
print(f\"HELM_REPOSITORY={data['mirrors']['helm']['repository']}\")
print(f\"GITHUB_PROXY={data['mirrors']['github']['releases']}\")
")
        eval "$config"
    else
        log_warning "未找到 jq 或 python3，使用默认镜像源配置"
        KUBERNETES_OSS="https://kubernetes.oss-cn-hangzhou.aliyuncs.com"
        HELM_REPOSITORY="https://mirrors.huaweicloud.com/helm/"
        GITHUB_PROXY="https://ghproxy.com/https://github.com"
    fi
    
    log_info "镜像源配置加载完成"
}

# 检查Docker是否运行
check_docker() {
    log_info "检查Docker服务状态..."
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker服务未运行，请启动Docker后重试"
        exit 1
    fi
    log_success "Docker服务运行正常"
}

# 配置Docker buildx
setup_buildx() {
    log_info "配置Docker buildx..."
    
    # 删除现有的buildx实例（如果存在）
    if docker buildx ls | grep -q "sical-builder"; then
        log_info "删除现有的buildx实例: sical-builder"
        docker buildx rm sical-builder || true
    fi
    
    # 使用默认构建器，它会使用daemon.json中配置的镜像源
    log_info "使用默认构建器（支持镜像源配置）"
    docker buildx use default
    
    log_success "buildx配置完成"
}

# 清理Docker缓存
clean_cache() {
    log_warning "清理Docker缓存..."
    read -p "是否要清理Docker缓存？这将删除所有未使用的镜像和容器 (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker system prune -a -f
        docker builder prune -a -f
        log_success "Docker缓存清理完成"
    else
        log_info "跳过缓存清理"
    fi
}

# 构建基础工具镜像
build_base_tools() {
    log_info "构建基础工具镜像..."
    
    # 确保镜像源配置已加载
    if [ -z "$KUBERNETES_OSS" ]; then
        load_mirrors_config
    fi
    
    cd "$(dirname "$DOCKER_DIR")"
    
    # 使用buildx构建，启用缓存，传递镜像源参数
    docker buildx build \
        --file docker/Dockerfile.base-tools \
        --tag sical/base-tools:latest \
        --build-arg KUBERNETES_OSS_REPO="$KUBERNETES_OSS" \
        --build-arg HELM_REPO="$HELM_REPOSITORY" \
        --build-arg GITHUB_PROXY="$GITHUB_PROXY" \
        --cache-from type=local,src=/tmp/.buildx-cache \
        --cache-to type=local,dest=/tmp/.buildx-cache-new,mode=max \
        --load \
        .
    
    # 更新缓存
    if [ -d "/tmp/.buildx-cache-new" ]; then
        rm -rf /tmp/.buildx-cache
        mv /tmp/.buildx-cache-new /tmp/.buildx-cache
    fi
    
    log_success "基础工具镜像构建完成"
}

# 验证构建结果
verify_build() {
    log_info "验证构建结果..."
    
    # 检查基础工具镜像
    if docker images | grep -q "sical/base-tools"; then
        log_success "✅ 基础工具镜像: sical/base-tools"
    else
        log_error "❌ 基础工具镜像构建失败"
    fi
    
    # 检查服务镜像
    local services=("jenkins" "kind" "kubectl")
    for service in "${services[@]}"; do
        if docker images | grep -q "sical.*${service}"; then
            log_success "✅ 服务镜像: ${service}"
        else
            log_warning "⚠️  服务镜像可能缺失: ${service}"
        fi
    done
    
    # 显示镜像大小
    log_info "镜像大小统计:"
    docker images | grep "sical" | awk '{print $1":"$2"\t"$7$8}'
}

# 主函数
main() {
    if [ "$CHECK_ONLY" = true ]; then
        check_docker
    elif [ "$SETUP_BUILDX_ONLY" = true ]; then
        check_docker
        setup_buildx
    elif [ "$CLEAN_CACHE_ONLY" = true ]; then
        check_docker
        clean_cache
    elif [ "$BUILD_BASE_ONLY" = true ]; then
        check_docker
        load_mirrors_config
        build_base_tools
    elif [ "$VERIFY_ONLY" = true ]; then
        verify_build
    else
        # 完整的构建优化流程
        check_docker
        setup_buildx
        if [ "$SKIP_CACHE" != true ]; then
            clean_cache
        else
            log_info "跳过Docker缓存清理"
        fi
        load_mirrors_config
        build_base_tools
        verify_build
    fi
}

# 执行主函数
main "$@"