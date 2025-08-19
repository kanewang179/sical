#!/bin/bash

# SiCal项目 - 镜像源配置脚本
# 配置国内镜像源以提高下载速度
# 作者: AI Assistant

set -e

echo "🔧 SiCal项目镜像源配置脚本"
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
    echo "  --test                  测试镜像源连通性"
    echo "  --apt                   配置APT镜像源"
    echo ""
    echo "示例:"
    echo "  $0                      配置所有镜像源"
    echo "  $0 --test              仅测试镜像源连通性"
    echo "  $0 --apt               仅配置APT镜像源"
}

# 解析命令行参数
TEST_ONLY=false
APT_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --test)
            TEST_ONLY=true
            shift
            ;;
        --apt)
            APT_ONLY=true
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
        NPM_REGISTRY=$(jq -r '.mirrors.npm.registry' "$mirrors_file")
        DOCKER_MIRRORS=$(jq -r '.mirrors.docker.registry_mirrors[]' "$mirrors_file" | tr '\n' ',' | sed 's/,$//')
        GOPROXY_URL=$(jq -r '.mirrors.golang.goproxy' "$mirrors_file")
        UBUNTU_MIRROR=$(jq -r '.mirrors.ubuntu.archive' "$mirrors_file")
        DEBIAN_MIRROR=$(jq -r '.mirrors.debian.archive' "$mirrors_file")
        DEBIAN_SECURITY_MIRROR=$(jq -r '.mirrors.debian.security' "$mirrors_file")
        ALPINE_MIRROR=$(jq -r '.mirrors.alpine.main' "$mirrors_file")
        PYPI_INDEX=$(jq -r '.mirrors.pypi.index_url' "$mirrors_file")
        JENKINS_UPDATE_CENTER=$(jq -r '.mirrors.jenkins.update_center' "$mirrors_file")
        HELM_REPOSITORY=$(jq -r '.mirrors.helm.repository' "$mirrors_file")
        KUBERNETES_OSS=$(jq -r '.mirrors.kubernetes_oss.repository' "$mirrors_file")
        GITHUB_PROXY=$(jq -r '.mirrors.github.releases' "$mirrors_file")
        DOCKER_CE_MIRROR=$(jq -r '.mirrors.docker_ce.repository' "$mirrors_file")
        NODEJS_MIRROR=$(jq -r '.mirrors.nodejs.repository' "$mirrors_file")
    elif command -v python3 >/dev/null 2>&1; then
        local config=$(python3 -c "
import json
with open('$mirrors_file', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f\"NPM_REGISTRY={data['mirrors']['npm']['registry']}\")
print(f\"GOPROXY_URL={data['mirrors']['golang']['goproxy']}\")
print(f\"UBUNTU_MIRROR={data['mirrors']['ubuntu']['archive']}\")
print(f\"DEBIAN_MIRROR={data['mirrors']['debian']['archive']}\")
print(f\"DEBIAN_SECURITY_MIRROR={data['mirrors']['debian']['security']}\")
print(f\"ALPINE_MIRROR={data['mirrors']['alpine']['main']}\")
print(f\"PYPI_INDEX={data['mirrors']['pypi']['index_url']}\")
print(f\"JENKINS_UPDATE_CENTER={data['mirrors']['jenkins']['update_center']}\")
print(f\"HELM_REPOSITORY={data['mirrors']['helm']['repository']}\")
print(f\"KUBERNETES_OSS={data['mirrors']['kubernetes_oss']['repository']}\")
print(f\"GITHUB_PROXY={data['mirrors']['github']['releases']}\")
print(f\"DOCKER_CE_MIRROR={data['mirrors']['docker_ce']['repository']}\")
print(f\"NODEJS_MIRROR={data['mirrors']['nodejs']['repository']}\")
print(f\"DOCKER_MIRRORS={','.join(data['mirrors']['docker']['registry_mirrors'])}\")
")
        eval "$config"
    else
        log_warning "未找到 jq 或 python3，使用默认镜像源配置"
        NPM_REGISTRY="https://registry.npmmirror.com"
        DOCKER_MIRRORS="https://docker.mirrors.ustc.edu.cn,https://hub-mirror.c.163.com"
        GOPROXY_URL="https://goproxy.cn,direct"
        UBUNTU_MIRROR="https://mirrors.aliyun.com/ubuntu/"
        DEBIAN_MIRROR="https://mirrors.aliyun.com/debian/"
        DEBIAN_SECURITY_MIRROR="https://mirrors.aliyun.com/debian-security/"
        ALPINE_MIRROR="https://mirrors.aliyun.com/alpine/"
        PYPI_INDEX="https://pypi.tuna.tsinghua.edu.cn/simple/"
        JENKINS_UPDATE_CENTER="https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json"
        HELM_REPOSITORY="https://mirrors.huaweicloud.com/helm/"
        KUBERNETES_OSS="https://kubernetes.oss-cn-hangzhou.aliyuncs.com"
        GITHUB_PROXY="https://ghproxy.com/https://github.com"
        DOCKER_CE_MIRROR="https://mirrors.aliyun.com/docker-ce"
        NODEJS_MIRROR="https://mirrors.aliyun.com/nodesource"
    fi
    
    log_info "镜像源配置加载完成"
    log_info "NPM Registry: $NPM_REGISTRY"
    log_info "Docker Mirrors: $DOCKER_MIRRORS"
}

# 配置国内镜像源
setup_china_mirrors() {
    log_step "配置国内镜像源..."
    
    # 加载镜像源配置
    load_mirrors_config
    
    # 1. 配置 npm 国内镜像源
    log_info "配置 npm 国内镜像源..."
    
    # 前端项目
    if [ -d "$PROJECT_ROOT/frontend" ]; then
        log_info "配置前端项目 npm 镜像源..."
        cat > "$PROJECT_ROOT/frontend/.npmrc" << EOF
# npm 国内镜像源配置
registry=$NPM_REGISTRY

# 其他包管理器镜像源
@babel:registry=$NPM_REGISTRY
@types:registry=$NPM_REGISTRY
@vue:registry=$NPM_REGISTRY
@angular:registry=$NPM_REGISTRY
@react:registry=$NPM_REGISTRY

# 二进制文件镜像源（基于npm镜像源域名）
# 从NPM_REGISTRY提取域名用于二进制文件下载
NPM_DOMAIN=\$(echo "$NPM_REGISTRY" | sed 's|https://registry\\.|https://|' | sed 's|/.*||')
electron_mirror=\${NPM_DOMAIN}/mirrors/electron/
node_gyp_mirror=\${NPM_DOMAIN}/mirrors/node/
sass_binary_site=\${NPM_DOMAIN}/mirrors/node-sass/
phantomjs_cdnurl=\${NPM_DOMAIN}/mirrors/phantomjs/
puppeteer_download_host=\${NPM_DOMAIN}/mirrors/
chromium_download_url=\${NPM_DOMAIN}/mirrors/chromium-browser-snapshots/

# 缓存配置
cache-max=86400000
cache-min=10

# 网络配置
fetch-retries=3
fetch-retry-factor=10
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
EOF
        log_success "前端项目 .npmrc 配置完成"
    fi
    
    # 后端项目
    if [ -d "$PROJECT_ROOT/backend" ]; then
        log_info "配置后端项目 npm 镜像源..."
        cp "$PROJECT_ROOT/frontend/.npmrc" "$PROJECT_ROOT/backend/.npmrc"
        log_success "后端项目 .npmrc 配置完成"
    fi
    
    # 2. 配置 Go 模块代理
    log_info "配置 Go 模块代理..."
    if [ -d "$PROJECT_ROOT/go-backend" ]; then
        log_info "配置 Go 后端项目代理..."
        cat > "$PROJECT_ROOT/go-backend/.goproxy" << EOF
# Go 模块代理配置
GOPROXY=$GOPROXY_URL
GOSUMDB=sum.golang.google.cn
GONOPROXY=*.corp.example.com,rsc.io/private
GONOSUMDB=*.corp.example.com,rsc.io/private
EOF
        log_success "Go 代理配置完成"
        
        # 设置当前会话的环境变量
        export GOPROXY="$GOPROXY_URL"
        export GOSUMDB="sum.golang.google.cn"
        log_success "Go 环境变量设置完成"
    fi
    
    # 3. 配置Docker国内镜像源
    log_info "配置Docker国内镜像源..."
    if [ -f "/etc/docker/daemon.json" ]; then
        log_warning "Docker daemon.json已存在，请手动添加镜像源配置"
    else
        log_info "创建Docker daemon.json配置..."
        if command -v sudo >/dev/null 2>&1; then
            sudo mkdir -p /etc/docker
            # 将逗号分隔的镜像源转换为JSON数组格式
            local docker_mirrors_json=$(echo "$DOCKER_MIRRORS" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/')
            sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    $docker_mirrors_json
  ],
  "insecure-registries": ["localhost:5000"]
}
EOF
            log_success "Docker镜像源配置完成，请重启Docker服务"
        else
            log_warning "无sudo权限，跳过Docker镜像源配置"
        fi
    fi
    
    # 4. 配置全局 npm 镜像源
    log_info "配置全局 npm 镜像源..."
    if command -v npm >/dev/null 2>&1; then
        npm config set registry "$NPM_REGISTRY"
        log_success "全局 npm 镜像源配置完成"
    else
        log_warning "npm 未安装，跳过全局配置"
    fi
    
    # 5. 配置全局 Go 代理
    log_info "配置全局 Go 代理..."
    if command -v go >/dev/null 2>&1; then
        go env -w GOPROXY="$GOPROXY_URL"
        go env -w GOSUMDB=sum.golang.google.cn
        log_success "全局 Go 代理配置完成"
    else
        log_warning "Go 未安装，跳过全局配置"
    fi
    
    log_success "国内镜像源配置完成"
}

# 测试镜像源连通性
test_mirror_connectivity() {
    log_info "测试镜像源连通性..."
    
    # 确保镜像源配置已加载
    if [ -z "$NPM_REGISTRY" ]; then
        load_mirrors_config
    fi
    
    local mirrors=(
        "$NPM_REGISTRY"
        "$(echo $GOPROXY_URL | cut -d',' -f1)"
        "$(echo $DOCKER_MIRRORS | cut -d',' -f1)"
        "$ALPINE_MIRROR"
        "$KUBERNETES_OSS"
        "$HELM_REPOSITORY"
    )
    
    local names=(
        "npm镜像源"
        "Go代理"
        "Docker镜像源(DaoCloud)"
        "Alpine镜像源(阿里云)"
        "Kubernetes镜像源"
        "Helm镜像源"
    )
    
    for i in "${!mirrors[@]}"; do
        local mirror="${mirrors[$i]}"
        local name="${names[$i]}"
        
        if curl -I "$mirror" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
            log_success "✅ $name - 连接正常"
        else
            log_warning "❌ $name - 连接失败"
        fi
    done
}

# 配置APT镜像源
setup_apt_mirrors() {
    log_info "配置 APT 国内镜像源..."
    
    # 检测系统版本
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        CODENAME=$VERSION_CODENAME
    else
        log_warning "无法检测系统版本，跳过APT配置"
        return
    fi
    
    log_info "检测到系统: $OS $VER ($CODENAME)"
    
    # 备份原始源列表
    if [ -f /etc/apt/sources.list ]; then
        BACKUP_FILE="/etc/apt/sources.list.backup.$(date +%Y%m%d_%H%M%S)"
        if command -v sudo >/dev/null 2>&1; then
            sudo cp /etc/apt/sources.list "$BACKUP_FILE"
            log_info "备份原始源列表到: $BACKUP_FILE"
        else
            log_warning "无sudo权限，跳过APT配置"
            return
        fi
    fi
    
    # 根据系统版本配置镜像源
    case "$OS" in
        *"Ubuntu"*)
            log_info "配置 Ubuntu 国内镜像源..."
            sudo tee /etc/apt/sources.list > /dev/null << EOF
# Ubuntu $VER ($CODENAME) 国内镜像源
# 配置的镜像源: $UBUNTU_MIRROR
deb $UBUNTU_MIRROR $CODENAME main restricted universe multiverse
deb $UBUNTU_MIRROR $CODENAME-updates main restricted universe multiverse
deb $UBUNTU_MIRROR $CODENAME-backports main restricted universe multiverse
deb $UBUNTU_MIRROR $CODENAME-security main restricted universe multiverse
EOF
            ;;
        *"Debian"*)
            log_info "配置 Debian 国内镜像源..."
            sudo tee /etc/apt/sources.list > /dev/null << EOF
# Debian $VER ($CODENAME) 国内镜像源
# 配置的镜像源: $DEBIAN_MIRROR
deb $DEBIAN_MIRROR $CODENAME main contrib non-free
deb $DEBIAN_MIRROR $CODENAME-updates main contrib non-free
deb $(echo $DEBIAN_MIRROR | sed 's/debian/debian-security/') $CODENAME-security main contrib non-free
EOF
            ;;
        *)
            log_warning "未知系统类型: $OS，跳过APT配置"
            return
            ;;
    esac
    
    # 更新软件包列表
    log_info "更新软件包列表..."
    if sudo apt-get update; then
        log_success "APT镜像源配置完成"
    else
        log_error "软件包列表更新失败"
        if [ -f "$BACKUP_FILE" ]; then
            sudo cp "$BACKUP_FILE" /etc/apt/sources.list
            log_info "已恢复原始配置"
        fi
    fi
}

# 主函数
main() {
    if [ "$TEST_ONLY" = true ]; then
        load_mirrors_config
        test_mirror_connectivity
    elif [ "$APT_ONLY" = true ]; then
        load_mirrors_config
        setup_apt_mirrors
    else
        setup_china_mirrors
        setup_apt_mirrors
        test_mirror_connectivity
    fi
}

# 执行主函数
main "$@"