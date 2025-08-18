#!/bin/bash

# SiCal项目 - Kubernetes集群设置脚本
# 用于创建本地Kind集群并配置必要的组件

set -e

echo "🚀 开始设置SiCal Kubernetes集群..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要工具
check_prerequisites() {
    echo -e "${BLUE}检查必要工具...${NC}"
    
    command -v docker >/dev/null 2>&1 || { echo -e "${RED}错误: Docker未安装${NC}"; exit 1; }
    command -v kind >/dev/null 2>&1 || { echo -e "${RED}错误: Kind未安装${NC}"; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}错误: kubectl未安装${NC}"; exit 1; }
    command -v helm >/dev/null 2>&1 || { echo -e "${RED}错误: Helm未安装${NC}"; exit 1; }
    
    echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
}

# 创建Kind集群
create_cluster() {
    echo -e "${BLUE}创建Kind集群...${NC}"
    
    # 检查集群是否已存在
    if kind get clusters | grep -q "sical-cluster"; then
        echo -e "${YELLOW}集群 'sical-cluster' 已存在，删除旧集群...${NC}"
        kind delete cluster --name sical-cluster
    fi
    
    # 获取配置文件路径
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    K8S_DIR="$SCRIPT_DIR/../k8s"
    
    # 创建新集群
    kind create cluster --config="$K8S_DIR/kind-config.yaml" --wait=300s
    
    echo -e "${GREEN}✅ Kind集群创建成功${NC}"
}

# 配置kubectl上下文
setup_kubectl() {
    echo -e "${BLUE}配置kubectl上下文...${NC}"
    
    kubectl cluster-info --context kind-sical-cluster
    kubectl config use-context kind-sical-cluster
    
    echo -e "${GREEN}✅ kubectl配置完成${NC}"
}

# 安装Nginx Ingress Controller
install_ingress() {
    echo -e "${BLUE}安装Nginx Ingress Controller...${NC}"
    
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
    
    echo -e "${YELLOW}等待Ingress Controller就绪...${NC}"
    kubectl wait --namespace ingress-nginx \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=90s
    
    echo -e "${GREEN}✅ Nginx Ingress Controller安装完成${NC}"
}

# 安装Metrics Server
install_metrics_server() {
    echo -e "${BLUE}安装Metrics Server...${NC}"
    
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    # 为Kind集群修补Metrics Server配置
    kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
        {
            "op": "add",
            "path": "/spec/template/spec/containers/0/args/-",
            "value": "--kubelet-insecure-tls"
        }
    ]'
    
    echo -e "${GREEN}✅ Metrics Server安装完成${NC}"
}

# 创建命名空间
create_namespaces() {
    echo -e "${BLUE}创建应用命名空间...${NC}"
    
    kubectl apply -f k8s/namespace.yaml
    
    echo -e "${GREEN}✅ 命名空间创建完成${NC}"
}

# 设置本地Docker Registry
setup_local_registry() {
    echo -e "${BLUE}设置本地Docker Registry连接...${NC}"
    
    # 创建Registry配置
    kubectl create configmap local-registry-hosting --from-literal=localRegistryHosting.v1='{"host":"localhost:5000","help":"https://kind.sigs.k8s.io/docs/user/local-registry/"}' -n kube-public --dry-run=client -o yaml | kubectl apply -f -
    
    echo -e "${GREEN}✅ 本地Registry配置完成${NC}"
}

# 安装Dashboard (可选)
install_dashboard() {
    echo -e "${BLUE}安装Kubernetes Dashboard...${NC}"
    
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
    
    # 创建Dashboard管理员用户
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF
    
    echo -e "${GREEN}✅ Kubernetes Dashboard安装完成${NC}"
    echo -e "${YELLOW}访问Dashboard: kubectl proxy 然后访问 http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/${NC}"
}

# 验证集群状态
verify_cluster() {
    echo -e "${BLUE}验证集群状态...${NC}"
    
    echo "节点状态:"
    kubectl get nodes
    
    echo "\n命名空间:"
    kubectl get namespaces
    
    echo "\nIngress Controller状态:"
    kubectl get pods -n ingress-nginx
    
    echo -e "${GREEN}✅ 集群验证完成${NC}"
}

# 显示访问信息
show_access_info() {
    echo -e "${GREEN}🎉 SiCal Kubernetes集群设置完成！${NC}"
    echo -e "${BLUE}访问信息:${NC}"
    echo "• 集群名称: sical-cluster"
    echo "• 上下文: kind-sical-cluster"
    echo "• Ingress: http://localhost (需要配置hosts)"
    echo "• Dashboard Token: kubectl -n kubernetes-dashboard create token admin-user"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "1. 启动本地Docker Registry: docker-compose up -d registry"
    echo "2. 构建并推送前端镜像"
    echo "3. 部署应用: kubectl apply -f k8s/"
    echo "4. 配置hosts文件: echo '127.0.0.1 sical.local' >> /etc/hosts"
}

# 主函数
main() {
    check_prerequisites
    create_cluster
    setup_kubectl
    install_ingress
    install_metrics_server
    create_namespaces
    setup_local_registry
    install_dashboard
    verify_cluster
    show_access_info
}

# 执行主函数
main "$@"