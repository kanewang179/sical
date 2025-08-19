#!/bin/bash

# Kind集群健康检查脚本
# 用于检查Kind Kubernetes集群的健康状态

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

# 检查kubeconfig文件
check_kubeconfig() {
    if [ ! -f "$KUBECONFIG" ]; then
        log_error "kubeconfig文件不存在: $KUBECONFIG"
        return 1
    fi
    log_info "kubeconfig文件存在"
    return 0
}

# 检查kubectl连接
check_kubectl_connection() {
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log_error "无法连接到Kubernetes集群"
        return 1
    fi
    log_info "kubectl连接正常"
    return 0
}

# 检查节点状态
check_nodes() {
    local ready_nodes
    ready_nodes=$(kubectl get nodes --no-headers | grep -c "Ready" || echo "0")
    
    if [ "$ready_nodes" -eq 0 ]; then
        log_error "没有就绪的节点"
        return 1
    fi
    
    log_info "发现 $ready_nodes 个就绪节点"
    return 0
}

# 检查系统Pod状态
check_system_pods() {
    local running_pods
    running_pods=$(kubectl get pods -n kube-system --no-headers | grep -c "Running" || echo "0")
    
    if [ "$running_pods" -lt 3 ]; then
        log_warn "kube-system命名空间中运行的Pod数量较少: $running_pods"
        kubectl get pods -n kube-system
        return 1
    fi
    
    log_info "kube-system命名空间中有 $running_pods 个运行中的Pod"
    return 0
}

# 主健康检查函数
main() {
    log_info "开始Kind集群健康检查..."
    
    local exit_code=0
    
    # 执行各项检查
    check_kubeconfig || exit_code=1
    check_kubectl_connection || exit_code=1
    check_nodes || exit_code=1
    check_system_pods || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        log_info "✅ Kind集群健康检查通过"
    else
        log_error "❌ Kind集群健康检查失败"
    fi
    
    return $exit_code
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi