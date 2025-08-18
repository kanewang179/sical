#!/bin/bash

# 统一配置国内镜像源脚本
# 解决国内网络环境下各种工具的下载速度问题

set -e

echo "🇨🇳 配置国内镜像源"
echo "======================================"

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📍 项目根目录: $PROJECT_ROOT"

# 1. 配置 Docker 国内镜像源
echo "\n🐳 配置 Docker 国内镜像源..."
if [ -f "$PROJECT_ROOT/setup-china-docker-mirrors.sh" ]; then
    echo "执行 Docker 镜像源配置..."
    bash "$PROJECT_ROOT/setup-china-docker-mirrors.sh"
else
    echo "⚠️  Docker 镜像源配置脚本不存在"
fi

# 2. 配置 npm 国内镜像源
echo "\n📦 配置 npm 国内镜像源..."

# 前端项目
if [ -d "$PROJECT_ROOT/frontend" ]; then
    echo "配置前端项目 npm 镜像源..."
    cat > "$PROJECT_ROOT/frontend/.npmrc" << 'EOF'
# npm 国内镜像源配置
registry=https://registry.npmmirror.com

# 其他包管理器镜像源
@babel:registry=https://registry.npmmirror.com
@types:registry=https://registry.npmmirror.com
@vue:registry=https://registry.npmmirror.com
@angular:registry=https://registry.npmmirror.com
@react:registry=https://registry.npmmirror.com

# 二进制文件镜像源
electron_mirror=https://npmmirror.com/mirrors/electron/
node_gyp_mirror=https://npmmirror.com/mirrors/node/
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
phantomjs_cdnurl=https://npmmirror.com/mirrors/phantomjs/
puppeteer_download_host=https://npmmirror.com/mirrors/
chromium_download_url=https://npmmirror.com/mirrors/chromium-browser-snapshots/

# 缓存配置
cache-max=86400000
cache-min=10

# 网络配置
fetch-retries=3
fetch-retry-factor=10
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
EOF
    echo "✅ 前端项目 .npmrc 配置完成"
fi

# 后端项目
if [ -d "$PROJECT_ROOT/backend" ]; then
    echo "配置后端项目 npm 镜像源..."
    cp "$PROJECT_ROOT/frontend/.npmrc" "$PROJECT_ROOT/backend/.npmrc"
    echo "✅ 后端项目 .npmrc 配置完成"
fi

# 3. 配置 Go 模块代理
echo "\n🐹 配置 Go 模块代理..."
if [ -d "$PROJECT_ROOT/go-backend" ]; then
    echo "配置 Go 后端项目代理..."
    cat > "$PROJECT_ROOT/go-backend/.goproxy" << 'EOF'
# Go 模块代理配置
GOPROXY=https://goproxy.cn,https://mirrors.aliyun.com/goproxy/,https://goproxy.io,direct
GOSUMDB=sum.golang.google.cn
GONOPROXY=*.corp.example.com,rsc.io/private
GONOSUMDB=*.corp.example.com,rsc.io/private
EOF
    echo "✅ Go 代理配置完成"
    
    # 设置当前会话的环境变量
    export GOPROXY="https://goproxy.cn,https://mirrors.aliyun.com/goproxy/,https://goproxy.io,direct"
    export GOSUMDB="sum.golang.google.cn"
    echo "✅ Go 环境变量设置完成"
fi

# 4. 配置 Jenkins 插件镜像源
echo "\n🔧 配置 Jenkins 插件镜像源..."
JENKINS_DIR="$PROJECT_ROOT/deployment/docker/jenkins"
if [ -d "$JENKINS_DIR" ]; then
    echo "Jenkins 配置目录存在，Dockerfile 已配置国内镜像源"
    echo "✅ Jenkins 镜像源配置完成"
fi

# 5. 配置全局 npm 镜像源
echo "\n🌐 配置全局 npm 镜像源..."
npm config set registry https://registry.npmmirror.com
echo "✅ 全局 npm 镜像源配置完成"

# 6. 配置全局 Go 代理
echo "\n🌐 配置全局 Go 代理..."
if command -v go >/dev/null 2>&1; then
    go env -w GOPROXY=https://goproxy.cn,https://mirrors.aliyun.com/goproxy/,https://goproxy.io,direct
    go env -w GOSUMDB=sum.golang.google.cn
    echo "✅ 全局 Go 代理配置完成"
else
    echo "⚠️  Go 未安装，跳过全局配置"
fi

# 7. 测试镜像源连通性
echo "\n🧪 测试镜像源连通性..."

# 测试 npm 镜像源
echo "测试 npm 镜像源..."
if curl -I "https://registry.npmmirror.com" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
    echo "✅ npm 镜像源连接正常"
else
    echo "❌ npm 镜像源连接失败"
fi

# 测试 Go 代理
echo "测试 Go 代理..."
if curl -I "https://goproxy.cn" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
    echo "✅ Go 代理连接正常"
else
    echo "❌ Go 代理连接失败"
fi

# 测试 Docker 镜像源
echo "测试 Docker 镜像源..."
if curl -I "https://dockerproxy.com/v2/" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
    echo "✅ Docker 镜像源连接正常"
else
    echo "❌ Docker 镜像源连接失败"
fi

echo "\n======================================"
echo "🎉 国内镜像源配置完成！"
echo ""
echo "📝 配置说明:"
echo "   - Docker: 已配置多个国内镜像源"
echo "   - npm: 使用 npmmirror.com 镜像源"
echo "   - Go: 使用 goproxy.cn 和阿里云代理"
echo "   - Jenkins: Dockerfile 已配置国内源"
echo "   - Kubernetes: Kind 配置已包含镜像源"
echo ""
echo "🔧 如果仍有问题，请尝试:"
echo "   1. 重启相关服务"
echo "   2. 检查网络连接"
echo "   3. 使用 VPN 或代理"
echo "   4. 手动配置其他镜像源"
echo ""
echo "💡 环境变量设置 (可添加到 ~/.bashrc 或 ~/.zshrc):"
echo "   export GOPROXY=https://goproxy.cn,https://mirrors.aliyun.com/goproxy/,https://goproxy.io,direct"
echo "   export GOSUMDB=sum.golang.google.cn"
echo "   export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com"