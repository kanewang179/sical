#!/bin/bash

# 设置镜像源环境变量的脚本
# 从mirrors.json读取配置并导出为环境变量

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIRRORS_JSON="${SCRIPT_DIR}/../mirrors.json"
READ_MIRRORS_SCRIPT="${SCRIPT_DIR}/read-mirrors.sh"

# 检查mirrors.json文件是否存在
if [[ ! -f "$MIRRORS_JSON" ]]; then
    echo "错误: 找不到mirrors.json文件: $MIRRORS_JSON"
    exit 1
fi

# 检查read-mirrors.sh脚本是否存在
if [[ ! -f "$READ_MIRRORS_SCRIPT" ]]; then
    echo "错误: 找不到read-mirrors.sh脚本: $READ_MIRRORS_SCRIPT"
    exit 1
fi

# 执行read-mirrors.sh脚本生成环境变量
echo "正在从mirrors.json读取镜像源配置..."
source "$READ_MIRRORS_SCRIPT"

# 映射变量名以匹配docker-compose的期望
# KUBERNETES_OSS_REPO已经在read-mirrors.sh中正确设置，无需重新映射
export HELM_REPO="$HELM_REPOSITORY"
export GOPROXY="$GOPROXY_URL"
export NPM_REGISTRY="$NPM_REGISTRY"

# 导出所有镜像源相关的环境变量
export DEBIAN_MIRROR
export DEBIAN_SECURITY_MIRROR
export DOCKER_CE_MIRROR
export KUBERNETES_OSS_REPO
export GITHUB_PROXY
export HELM_REPO
export NODEJS_MIRROR
export JENKINS_UPDATE_CENTER
export NPM_REGISTRY
export GOPROXY
export DOCKER_MIRRORS
export ALPINE_MIRROR

echo "镜像源环境变量已设置完成"
echo "DEBIAN_MIRROR: $DEBIAN_MIRROR"
echo "DOCKER_CE_MIRROR: $DOCKER_CE_MIRROR"
echo "KUBERNETES_OSS_REPO: $KUBERNETES_OSS_REPO"
echo "GITHUB_PROXY: $GITHUB_PROXY"
echo "HELM_REPO: $HELM_REPO"
echo "NODEJS_MIRROR: $NODEJS_MIRROR"
echo "JENKINS_UPDATE_CENTER: $JENKINS_UPDATE_CENTER"

# 如果传入了参数，则执行该命令
if [[ $# -gt 0 ]]; then
    echo "执行命令: $@"
    exec "$@"
fi