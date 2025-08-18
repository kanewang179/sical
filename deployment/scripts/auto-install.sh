#!/bin/bash

# 自动化部署脚本 - 支持 macOS 和 CentOS
# 安装顺序: Docker -> Kubernetes -> Jenkins
# 作者: SICAL 项目团队
# 版本: 1.0.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 步骤链条管理
STEPS=(
    "detect_os:检测操作系统"
    "install_docker:安装 Docker"
    "install_kubernetes:安装 Kubernetes"
    "install_jenkins:安装 Jenkins"
    "configure_services:配置服务"
    "verify_installation:验证安装"
)

CURRENT_STEP=0
TOTAL_STEPS=${#STEPS[@]}

# 步骤执行函数
execute_step() {
    local step_name=$1
    local step_desc=$2
    
    CURRENT_STEP=$((CURRENT_STEP + 1))
    log_info "步骤 ${CURRENT_STEP}/${TOTAL_STEPS}: ${step_desc}"
    echo "========================================"
    
    # 执行对应的函数
    $step_name
    
    log_success "步骤 ${CURRENT_STEP} 完成: ${step_desc}"
    echo ""
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        log_info "检测到 macOS 系统"
    elif [[ -f /etc/centos-release ]]; then
        OS="centos"
        log_info "检测到 CentOS 系统"
    elif [[ -f /etc/redhat-release ]]; then
        OS="centos"
        log_info "检测到 RedHat 系统（使用 CentOS 安装方式）"
    else
        log_error "不支持的操作系统"
        exit 1
    fi
}

# 安装 Docker
install_docker() {
    log_info "开始安装 Docker..."
    
    if command -v docker &> /dev/null; then
        log_warning "Docker 已安装，跳过安装步骤"
        return 0
    fi
    
    case $OS in
        "macos")
            install_docker_macos
            ;;
        "centos")
            install_docker_centos
            ;;
    esac
    
    # 启动 Docker 服务
    if [[ $OS == "centos" ]]; then
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
        log_warning "请重新登录以使 Docker 用户组生效"
    fi
    
    # 验证 Docker 安装
    if docker --version &> /dev/null; then
        log_success "Docker 安装成功: $(docker --version)"
    else
        log_error "Docker 安装失败"
        exit 1
    fi
}

# macOS 安装 Docker
install_docker_macos() {
    log_info "在 macOS 上安装 Docker..."
    
    # 检查是否安装了 Homebrew
    if ! command -v brew &> /dev/null; then
        log_info "安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # 使用 Homebrew 安装 Docker
    brew install --cask docker
    
    log_info "请手动启动 Docker Desktop 应用程序"
    log_warning "等待 Docker Desktop 启动完成后按任意键继续..."
    read -n 1 -s
}

# CentOS 安装 Docker
install_docker_centos() {
    log_info "在 CentOS 上安装 Docker..."
    
    # 卸载旧版本
    sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine
    
    # 安装依赖
    sudo yum install -y yum-utils device-mapper-persistent-data lvm2
    
    # 添加 Docker 仓库
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    
    # 安装 Docker CE
    sudo yum install -y docker-ce docker-ce-cli containerd.io
}

# 安装 Kubernetes
install_kubernetes() {
    log_info "开始安装 Kubernetes..."
    
    if command -v kubectl &> /dev/null; then
        log_warning "kubectl 已安装，跳过安装步骤"
    else
        case $OS in
            "macos")
                install_kubernetes_macos
                ;;
            "centos")
                install_kubernetes_centos
                ;;
        esac
    fi
    
    # 验证 kubectl 安装
    if kubectl version --client &> /dev/null; then
        log_success "kubectl 安装成功: $(kubectl version --client --short)"
    else
        log_error "kubectl 安装失败"
        exit 1
    fi
}

# macOS 安装 Kubernetes
install_kubernetes_macos() {
    log_info "在 macOS 上安装 Kubernetes..."
    
    # 安装 kubectl
    brew install kubectl
    
    # 安装 kind (用于本地 Kubernetes 集群)
    brew install kind
    
    # 创建本地 Kubernetes 集群
    if ! kind get clusters | grep -q "sical-cluster"; then
        log_info "创建本地 Kubernetes 集群..."
        kind create cluster --name sical-cluster --config deployment/k8s/kind-config.yaml
    fi
}

# CentOS 安装 Kubernetes
install_kubernetes_centos() {
    log_info "在 CentOS 上安装 Kubernetes..."
    
    # 添加 Kubernetes 仓库
    cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
    
    # 安装 kubeadm, kubelet, kubectl
    sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
    sudo systemctl enable kubelet
    
    # 安装 kind
    curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
    chmod +x ./kind
    sudo mv ./kind /usr/local/bin/kind
    
    # 创建本地 Kubernetes 集群
    if ! kind get clusters | grep -q "sical-cluster"; then
        log_info "创建本地 Kubernetes 集群..."
        kind create cluster --name sical-cluster --config deployment/k8s/kind-config.yaml
    fi
}

# 安装 Jenkins
install_jenkins() {
    log_info "开始安装 Jenkins..."
    
    # 检查 Jenkins 容器是否已运行
    if docker ps | grep -q "jenkins-github"; then
        log_warning "Jenkins 容器已运行，跳过安装步骤"
        return 0
    fi
    
    # 构建自定义 Jenkins 镜像
    log_info "构建自定义 Jenkins 镜像..."
    docker build -t jenkins-github:latest -f deployment/docker/jenkins/Dockerfile.github deployment/docker/jenkins/
    
    # 创建 Jenkins 数据卷
    docker volume create jenkins_home
    
    # 运行 Jenkins 容器
    log_info "启动 Jenkins 容器..."
    docker run -d \
        --name jenkins-github \
        --restart unless-stopped \
        -p 8080:8080 \
        -p 50000:50000 \
        -v jenkins_home:/var/jenkins_home \
        -v /var/run/docker.sock:/var/run/docker.sock \
        jenkins-github:latest
    
    # 等待 Jenkins 启动
    log_info "等待 Jenkins 启动..."
    sleep 30
    
    # 获取初始管理员密码
    if docker exec jenkins-github test -f /var/jenkins_home/secrets/initialAdminPassword; then
        JENKINS_PASSWORD=$(docker exec jenkins-github cat /var/jenkins_home/secrets/initialAdminPassword)
        log_success "Jenkins 初始管理员密码: ${JENKINS_PASSWORD}"
        echo "请保存此密码，用于首次登录 Jenkins"
    fi
}

# 配置服务
configure_services() {
    log_info "配置服务..."
    
    # 配置 kubectl 上下文
    kubectl config use-context kind-sical-cluster
    
    # 创建命名空间
    kubectl create namespace sical --dry-run=client -o yaml | kubectl apply -f -
    
    # 应用 Kubernetes 配置
    if [[ -f "deployment/k8s/namespace.yaml" ]]; then
        kubectl apply -f deployment/k8s/namespace.yaml
    fi
    
    if [[ -f "deployment/k8s/configmap.yaml" ]]; then
        kubectl apply -f deployment/k8s/configmap.yaml
    fi
    
    log_success "服务配置完成"
}

# 验证安装
verify_installation() {
    log_info "验证安装结果..."
    
    echo "========================================"
    echo "安装验证报告"
    echo "========================================"
    
    # 验证 Docker
    if docker --version &> /dev/null; then
        echo "✅ Docker: $(docker --version)"
    else
        echo "❌ Docker: 未安装或无法访问"
    fi
    
    # 验证 Kubernetes
    if kubectl version --client &> /dev/null; then
        echo "✅ kubectl: $(kubectl version --client --short)"
        
        if kubectl cluster-info &> /dev/null; then
            echo "✅ Kubernetes 集群: 运行中"
        else
            echo "❌ Kubernetes 集群: 无法连接"
        fi
    else
        echo "❌ kubectl: 未安装或无法访问"
    fi
    
    # 验证 Jenkins
    if docker ps | grep -q "jenkins-github"; then
        echo "✅ Jenkins: 容器运行中"
        echo "   访问地址: http://localhost:8080"
    else
        echo "❌ Jenkins: 容器未运行"
    fi
    
    echo "========================================"
    log_success "安装验证完成"
}

# 清理函数
cleanup() {
    log_info "执行清理操作..."
    # 这里可以添加清理逻辑
}

# 信号处理
trap cleanup EXIT

# 主函数
main() {
    echo "========================================"
    echo "SICAL 项目自动化部署脚本"
    echo "支持系统: macOS, CentOS"
    echo "安装组件: Docker, Kubernetes, Jenkins"
    echo "========================================"
    echo ""
    
    # 检查是否以 root 权限运行（CentOS 需要）
    if [[ $OS == "centos" && $EUID -eq 0 ]]; then
        log_error "请不要以 root 用户运行此脚本"
        exit 1
    fi
    
    # 执行安装步骤
    for step in "${STEPS[@]}"; do
        IFS=':' read -r step_name step_desc <<< "$step"
        execute_step "$step_name" "$step_desc"
    done
    
    echo "========================================"
    log_success "所有安装步骤已完成！"
    echo ""
    echo "下一步操作:"
    echo "1. 访问 Jenkins: http://localhost:8080"
    echo "2. 使用初始管理员密码登录"
    echo "3. 配置 GitHub 集成"
    echo "4. 运行 CI/CD 流水线"
    echo "========================================"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi