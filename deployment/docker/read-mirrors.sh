#!/bin/sh

# 从mirrors.json读取镜像源配置的脚本

# 在Docker容器中使用固定路径，在主机上使用相对路径
if [ -f "/tmp/mirrors.json" ]; then
    MIRRORS_JSON="/tmp/mirrors.json"
elif [ -f "$(dirname "$0")/../mirrors.json" ]; then
    MIRRORS_JSON="$(dirname "$0")/../mirrors.json"
else
    MIRRORS_JSON="./mirrors.json"
fi

# 检查mirrors.json是否存在
if [ ! -f "$MIRRORS_JSON" ]; then
    echo "Error: mirrors.json not found at $MIRRORS_JSON" >&2
    exit 1
fi

# 简化的配置读取函数
get_config() {
    local path="$1"
    
    # 检查可用的Python命令
    local python_cmd=""
    if command -v python3 >/dev/null 2>&1; then
        python_cmd="python3"
    elif command -v /usr/bin/python3 >/dev/null 2>&1; then
        python_cmd="/usr/bin/python3"
    elif command -v python >/dev/null 2>&1; then
        python_cmd="python"
    else
        echo "" # 如果没有Python，返回空字符串
        return
    fi
    
    $python_cmd -c "
import json
try:
    with open('$MIRRORS_JSON', 'r') as f:
        data = json.load(f)
    keys = '$path'.split('.')
    result = data
    for key in keys:
        if isinstance(result, dict) and key in result:
            result = result[key]
        else:
            result = ''
            break
    print(result if result else '')
except:
    print('')
"
}

# 导出镜像源配置
export NPM_REGISTRY=$(get_config "mirrors.npm.registry")
export GOPROXY_URL=$(get_config "mirrors.golang.goproxy")
export DOCKER_MIRRORS=$(get_config "mirrors.docker.registry_mirrors")
export DOCKER_HUB_PROXY=$(get_config "mirrors.docker.hub_proxy.primary")
export UBUNTU_MIRROR=$(get_config "mirrors.ubuntu.archive")
export DEBIAN_MIRROR=$(get_config "mirrors.debian.archive")
export DEBIAN_SECURITY_MIRROR=$(get_config "mirrors.debian.security")
export ALPINE_MIRROR=$(get_config "mirrors.alpine.main")
export PYPI_INDEX=$(get_config "mirrors.pypi.index_url")
export GITHUB_PROXY=$(get_config "mirrors.github.raw_content")
export JENKINS_UPDATE_CENTER=$(get_config "mirrors.jenkins.update_center")
export HELM_REPOSITORY=$(get_config "mirrors.helm.repository")
export KUBERNETES_OSS_REPO=$(get_config "mirrors.kubernetes_oss.repository")
export HELM_REPO=$(get_config "mirrors.helm.repository")
export KUBECTL_DOWNLOAD_URL=$(get_config "mirrors.kubectl.download_url")
export KUBECTL_MIRROR_URL=$(get_config "mirrors.kubectl.mirror_url")
export KUSTOMIZE_DOWNLOAD_URL=$(get_config "mirrors.kustomize.mirror_url")
export KIND_BINARY_DOWNLOAD_URL=$(get_config "mirrors.kind_binary.mirror_url")
export DOCKER_COMPOSE_DOWNLOAD_URL=$(get_config "mirrors.docker_compose.mirror_url")
export DOCKER_CE_MIRROR=$(get_config "mirrors.docker_ce.repository")
export NODEJS_MIRROR=$(get_config "mirrors.nodejs.repository")

# 如果作为脚本直接运行，输出所有变量
if [ "$(basename "$0")" = "read-mirrors.sh" ]; then
    echo "# 镜像源配置变量"
    echo "NPM_REGISTRY=$NPM_REGISTRY"
    echo "GOPROXY_URL=$GOPROXY_URL"
    echo "DOCKER_MIRRORS=$DOCKER_MIRRORS"
    echo "DOCKER_HUB_PROXY=$DOCKER_HUB_PROXY"
    echo "UBUNTU_MIRROR=$UBUNTU_MIRROR"
    echo "DEBIAN_MIRROR=$DEBIAN_MIRROR"
    echo "DEBIAN_SECURITY_MIRROR=$DEBIAN_SECURITY_MIRROR"
    echo "ALPINE_MIRROR=$ALPINE_MIRROR"
    echo "PYPI_INDEX=$PYPI_INDEX"
    echo "GITHUB_PROXY=$GITHUB_PROXY"
    echo "JENKINS_UPDATE_CENTER=$JENKINS_UPDATE_CENTER"
    echo "HELM_REPOSITORY=$HELM_REPOSITORY"
    echo "KUBERNETES_OSS_REPO=$KUBERNETES_OSS_REPO"
    echo "HELM_REPO=$HELM_REPO"
    echo "KUBECTL_DOWNLOAD_URL=$KUBECTL_DOWNLOAD_URL"
    echo "KUBECTL_MIRROR_URL=$KUBECTL_MIRROR_URL"
    echo "KUSTOMIZE_DOWNLOAD_URL=$KUSTOMIZE_DOWNLOAD_URL"
    echo "KIND_BINARY_DOWNLOAD_URL=$KIND_BINARY_DOWNLOAD_URL"
    echo "DOCKER_COMPOSE_DOWNLOAD_URL=$DOCKER_COMPOSE_DOWNLOAD_URL"
    echo "DOCKER_CE_MIRROR=$DOCKER_CE_MIRROR"
    echo "NODEJS_MIRROR=$NODEJS_MIRROR"
fi