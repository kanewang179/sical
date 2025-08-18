#!/bin/bash

# 自动化安装配置文件
# 用于配置安装选项和环境变量

# ===========================================
# 基础配置
# ===========================================

# 项目名称
export PROJECT_NAME="sical"

# 安装模式 (full|minimal|custom)
# full: 安装所有组件
# minimal: 仅安装 Docker 和基础 Jenkins
# custom: 根据下面的开关自定义安装
export INSTALL_MODE="full"

# ===========================================
# 组件安装开关
# ===========================================

# Docker 安装
export INSTALL_DOCKER=true

# Kubernetes 安装
export INSTALL_KUBERNETES=true

# Jenkins 安装
export INSTALL_JENKINS=true

# 本地 Kubernetes 集群 (kind)
export CREATE_LOCAL_CLUSTER=true

# ===========================================
# 网络配置
# ===========================================

# 使用国内镜像源
export USE_CHINA_MIRRORS=true

# Docker 镜像仓库
export DOCKER_REGISTRY="registry.cn-hangzhou.aliyuncs.com"

# NPM 镜像源
export NPM_REGISTRY="https://registry.npmmirror.com"

# Go 代理
export GOPROXY="https://goproxy.cn,direct"

# ===========================================
# 服务配置
# ===========================================

# Jenkins 端口
export JENKINS_HTTP_PORT=8080
export JENKINS_AGENT_PORT=50000

# Kubernetes 集群名称
export K8S_CLUSTER_NAME="${PROJECT_NAME}-cluster"

# Kubernetes 命名空间
export K8S_NAMESPACE="${PROJECT_NAME}"

# ===========================================
# 路径配置
# ===========================================

# 项目根目录
export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 部署配置目录
export DEPLOYMENT_DIR="${PROJECT_ROOT}/deployment"

# Docker 配置目录
export DOCKER_DIR="${DEPLOYMENT_DIR}/docker"

# Kubernetes 配置目录
export K8S_DIR="${DEPLOYMENT_DIR}/k8s"

# 脚本目录
export SCRIPTS_DIR="${DEPLOYMENT_DIR}/scripts"

# ===========================================
# 版本配置
# ===========================================

# Docker 版本 (留空使用最新版)
export DOCKER_VERSION=""

# Kubernetes 版本
export KUBERNETES_VERSION="v1.28.0"

# Kind 版本
export KIND_VERSION="v0.20.0"

# Jenkins 版本
export JENKINS_VERSION="lts"

# ===========================================
# 高级配置
# ===========================================

# 跳过确认提示
export SKIP_CONFIRMATION=false

# 详细日志输出
export VERBOSE_LOGGING=true

# 安装后自动启动服务
export AUTO_START_SERVICES=true

# 安装失败时自动清理
export AUTO_CLEANUP_ON_FAILURE=true

# ===========================================
# 系统检测配置
# ===========================================

# 最小内存要求 (GB)
export MIN_MEMORY_GB=4

# 最小磁盘空间要求 (GB)
export MIN_DISK_GB=20

# 检查系统要求
export CHECK_SYSTEM_REQUIREMENTS=true

# ===========================================
# 备份配置
# ===========================================

# 安装前备份现有配置
export BACKUP_EXISTING_CONFIG=true

# 备份目录
export BACKUP_DIR="${PROJECT_ROOT}/backup/$(date +%Y%m%d_%H%M%S)"

# ===========================================
# 函数定义
# ===========================================

# 加载配置
load_config() {
    local config_file="$1"
    if [[ -f "$config_file" ]]; then
        source "$config_file"
        echo "已加载配置文件: $config_file"
    fi
}

# 验证配置
validate_config() {
    local errors=0
    
    # 检查必需的环境变量
    if [[ -z "$PROJECT_NAME" ]]; then
        echo "错误: PROJECT_NAME 未设置"
        ((errors++))
    fi
    
    if [[ -z "$PROJECT_ROOT" ]]; then
        echo "错误: PROJECT_ROOT 未设置"
        ((errors++))
    fi
    
    # 检查安装模式
    if [[ ! "$INSTALL_MODE" =~ ^(full|minimal|custom)$ ]]; then
        echo "错误: INSTALL_MODE 必须是 full、minimal 或 custom"
        ((errors++))
    fi
    
    # 检查端口是否被占用
    if [[ "$INSTALL_JENKINS" == "true" ]]; then
        if lsof -i :"$JENKINS_HTTP_PORT" &>/dev/null; then
            echo "警告: 端口 $JENKINS_HTTP_PORT 已被占用"
        fi
    fi
    
    return $errors
}

# 显示配置摘要
show_config_summary() {
    echo "========================================"
    echo "安装配置摘要"
    echo "========================================"
    echo "项目名称: $PROJECT_NAME"
    echo "安装模式: $INSTALL_MODE"
    echo "项目根目录: $PROJECT_ROOT"
    echo ""
    echo "组件安装:"
    echo "  Docker: $INSTALL_DOCKER"
    echo "  Kubernetes: $INSTALL_KUBERNETES"
    echo "  Jenkins: $INSTALL_JENKINS"
    echo "  本地集群: $CREATE_LOCAL_CLUSTER"
    echo ""
    echo "网络配置:"
    echo "  使用国内镜像: $USE_CHINA_MIRRORS"
    echo "  Docker 仓库: $DOCKER_REGISTRY"
    echo ""
    echo "服务端口:"
    echo "  Jenkins HTTP: $JENKINS_HTTP_PORT"
    echo "  Jenkins Agent: $JENKINS_AGENT_PORT"
    echo "========================================"
}

# 应用安装模式
apply_install_mode() {
    case "$INSTALL_MODE" in
        "minimal")
            INSTALL_KUBERNETES=false
            CREATE_LOCAL_CLUSTER=false
            ;;
        "custom")
            # 使用用户自定义的设置
            ;;
        "full")
            # 默认全部安装
            ;;
    esac
}

# 初始化配置
init_config() {
    # 应用安装模式
    apply_install_mode
    
    # 验证配置
    if ! validate_config; then
        echo "配置验证失败，请检查配置文件"
        exit 1
    fi
    
    # 显示配置摘要
    if [[ "$VERBOSE_LOGGING" == "true" ]]; then
        show_config_summary
    fi
}

# 如果直接运行此文件，则显示配置
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    init_config
fi