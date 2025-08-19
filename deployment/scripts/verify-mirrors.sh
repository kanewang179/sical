#!/bin/bash

# 验证镜像源配置脚本
# 检查所有 Dockerfile 和配置文件是否正确使用了 mirrors.json 中的变量

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"
MIRRORS_JSON="$DEPLOYMENT_DIR/mirrors.json"

log_info "开始验证镜像源配置..."
log_info "部署目录: $DEPLOYMENT_DIR"
log_info "镜像源配置文件: $MIRRORS_JSON"

# 检查 mirrors.json 是否存在
if [ ! -f "$MIRRORS_JSON" ]; then
    log_error "mirrors.json 文件不存在: $MIRRORS_JSON"
    exit 1
fi

# 检查 Dockerfile.base-tools 中的 ARG 变量
log_info "检查 Dockerfile.base-tools..."
BASE_TOOLS_DOCKERFILE="$DEPLOYMENT_DIR/docker/Dockerfile.base-tools"
if [ -f "$BASE_TOOLS_DOCKERFILE" ]; then
    if grep -q "ARG KUBERNETES_OSS_REPO" "$BASE_TOOLS_DOCKERFILE" && \
       grep -q "ARG HELM_REPO" "$BASE_TOOLS_DOCKERFILE" && \
       grep -q "ARG GITHUB_PROXY" "$BASE_TOOLS_DOCKERFILE"; then
        log_info "✓ Dockerfile.base-tools 已正确配置 ARG 变量"
    else
        log_warn "⚠ Dockerfile.base-tools 缺少部分 ARG 变量"
    fi
else
    log_error "Dockerfile.base-tools 不存在"
fi

# 检查 Jenkins Dockerfile 中的 ARG 变量
log_info "检查 Jenkins Dockerfile..."
JENKINS_DOCKERFILE="$DEPLOYMENT_DIR/docker/jenkins/Dockerfile"
if [ -f "$JENKINS_DOCKERFILE" ]; then
    if grep -q "ARG DEBIAN_MIRROR" "$JENKINS_DOCKERFILE" && \
       grep -q "ARG JENKINS_UPDATE_CENTER" "$JENKINS_DOCKERFILE" && \
       grep -q "ARG DOCKER_CE_MIRROR" "$JENKINS_DOCKERFILE"; then
        log_info "✓ Jenkins Dockerfile 已正确配置 ARG 变量"
    else
        log_warn "⚠ Jenkins Dockerfile 缺少部分 ARG 变量"
    fi
else
    log_error "Jenkins Dockerfile 不存在"
fi

# 检查 docker-compose 文件中的构建参数
log_info "检查 docker-compose 构建参数..."
DOCKER_COMPOSE_FILE="$DEPLOYMENT_DIR/docker/docker-compose-docker-only.yml"
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    if grep -q "KUBERNETES_OSS_REPO:" "$DOCKER_COMPOSE_FILE" && \
       grep -q "JENKINS_UPDATE_CENTER:" "$DOCKER_COMPOSE_FILE" && \
       grep -q "DEBIAN_MIRROR:" "$DOCKER_COMPOSE_FILE"; then
        log_info "✓ docker-compose 文件已正确配置构建参数"
    else
        log_warn "⚠ docker-compose 文件缺少部分构建参数"
    fi
else
    log_error "docker-compose 文件不存在"
fi

# 检查 deploy-unified.sh 中的环境变量导出
log_info "检查 deploy-unified.sh 环境变量导出..."
DEPLOY_SCRIPT="$DEPLOYMENT_DIR/scripts/deploy-unified.sh"
if [ -f "$DEPLOY_SCRIPT" ]; then
    if grep -q "export KUBERNETES_OSS_REPO" "$DEPLOY_SCRIPT" && \
       grep -q "export JENKINS_UPDATE_CENTER" "$DEPLOY_SCRIPT" && \
       grep -q "export DEBIAN_MIRROR" "$DEPLOY_SCRIPT"; then
        log_info "✓ deploy-unified.sh 已正确配置环境变量导出"
    else
        log_warn "⚠ deploy-unified.sh 缺少部分环境变量导出"
    fi
else
    log_error "deploy-unified.sh 不存在"
fi

# 检查是否还有硬编码的 URL
log_info "检查是否还有硬编码的镜像源地址..."
HARDCODED_URLS=$(find "$DEPLOYMENT_DIR" -type f \( -name "*.dockerfile" -o -name "Dockerfile*" -o -name "*.yml" -o -name "*.yaml" -o -name "*.sh" \) \
    -exec grep -l "https://mirrors\." {} \; 2>/dev/null | \
    xargs grep -n "https://mirrors\." 2>/dev/null | \
    grep -v "ARG\|\${\|mirrors\.json" || true)

if [ -n "$HARDCODED_URLS" ]; then
    log_warn "发现可能的硬编码镜像源地址:"
    echo "$HARDCODED_URLS"
else
    log_info "✓ 未发现硬编码的镜像源地址"
fi

# 验证 mirrors.json 格式
log_info "验证 mirrors.json 格式..."
if command -v jq >/dev/null 2>&1; then
    if jq empty "$MIRRORS_JSON" >/dev/null 2>&1; then
        log_info "✓ mirrors.json 格式正确"
    else
        log_error "mirrors.json 格式错误"
        exit 1
    fi
else
    log_warn "未安装 jq，跳过 JSON 格式验证"
fi

log_info "镜像源配置验证完成！"
log_info "建议运行 './deploy-unified.sh --setup-mirrors' 测试镜像源连通性"