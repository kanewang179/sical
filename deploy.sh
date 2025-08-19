#!/bin/bash

# SiCal 快捷部署脚本
# 按顺序执行各个部署脚本

set -e

echo "🚀 SiCal 部署脚本"
echo "================================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/deployment/scripts"
DOCKER_DIR="$SCRIPT_DIR/deployment/docker"

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --setup-mirrors     只配置镜像源"
    echo "  --build-only        只构建服务"
    echo "  --verify-only       只验证配置"
    echo "  --skip-mirrors      跳过镜像源配置"
    echo "  --skip-optimization 跳过构建优化"
    echo "  --help, -h          显示此帮助信息"
    echo ""
    echo "默认执行完整部署流程："
    echo "  1. 配置镜像源"
    echo "  2. 构建优化"
    echo "  3. 构建服务"
    echo "  4. 验证配置"
}

# 解析命令行参数
SETUP_MIRRORS_ONLY=false
BUILD_ONLY=false
VERIFY_ONLY=false
SKIP_MIRRORS=false
SKIP_OPTIMIZATION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --setup-mirrors)
            SETUP_MIRRORS_ONLY=true
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --verify-only)
            VERIFY_ONLY=true
            shift
            ;;
        --skip-mirrors)
            SKIP_MIRRORS=true
            shift
            ;;
        --skip-optimization)
            SKIP_OPTIMIZATION=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 错误处理函数
handle_error() {
    log_error "部署过程中发生错误，退出码: $1"
    exit $1
}

trap 'handle_error $?' ERR

# 执行步骤1: 配置镜像源
if [[ "$SETUP_MIRRORS_ONLY" == "true" ]]; then
    log_step "步骤1: 配置镜像源"
    "$SCRIPTS_DIR/setup-mirrors.sh" "$@"
    log_success "镜像源配置完成"
    exit 0
fi

if [[ "$SKIP_MIRRORS" == "false" && "$BUILD_ONLY" == "false" && "$VERIFY_ONLY" == "false" ]]; then
    log_step "步骤1: 配置镜像源"
    "$SCRIPTS_DIR/setup-mirrors.sh"
    log_success "镜像源配置完成"
fi

# 执行步骤2: 构建优化
if [[ "$SKIP_OPTIMIZATION" == "false" && "$VERIFY_ONLY" == "false" && "$SETUP_MIRRORS_ONLY" == "false" ]]; then
    log_step "步骤2: 构建优化"
    "$SCRIPTS_DIR/build-optimization.sh" --skip-cache
    log_success "构建优化完成"
fi

# 执行步骤3: 构建服务
if [[ "$BUILD_ONLY" == "true" || ("$VERIFY_ONLY" == "false" && "$SETUP_MIRRORS_ONLY" == "false") ]]; then
    log_step "步骤3: 构建服务"
    "$SCRIPTS_DIR/build-services.sh" "$@"
    log_success "服务构建完成"
    
    if [[ "$BUILD_ONLY" == "true" ]]; then
        exit 0
    fi
fi

# 执行步骤4: 验证配置
if [[ "$VERIFY_ONLY" == "true" || ("$BUILD_ONLY" == "false" && "$SETUP_MIRRORS_ONLY" == "false") ]]; then
    log_step "步骤4: 验证配置"
    "$SCRIPTS_DIR/verify-mirrors.sh"
    log_success "配置验证完成"
    
    if [[ "$VERIFY_ONLY" == "true" ]]; then
        exit 0
    fi
fi

log_success "🎉 SiCal 部署完成！"
echo ""
log_info "接下来可以使用以下命令启动服务："
log_info "cd $DOCKER_DIR && ./setup-env.sh && docker-compose -f docker-compose-docker-only.yml up -d"
