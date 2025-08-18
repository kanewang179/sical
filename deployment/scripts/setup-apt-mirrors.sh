#!/bin/bash

# APT 国内镜像源配置脚本
# 用于在 Docker 容器或 Linux 系统中配置国内 APT 镜像源

set -e

echo "🇨🇳 配置 APT 国内镜像源"
echo "======================================"

# 检测系统版本
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
    CODENAME=$VERSION_CODENAME
else
    echo "❌ 无法检测系统版本"
    exit 1
fi

echo "📍 检测到系统: $OS $VER ($CODENAME)"

# 备份原始源列表
if [ -f /etc/apt/sources.list ]; then
    BACKUP_FILE="/etc/apt/sources.list.backup.$(date +%Y%m%d_%H%M%S)"
    cp /etc/apt/sources.list "$BACKUP_FILE"
    echo "📝 备份原始源列表到: $BACKUP_FILE"
fi

# 根据系统版本配置镜像源
case "$OS" in
    *"Ubuntu"*)
        echo "🔧 配置 Ubuntu 国内镜像源..."
        cat > /etc/apt/sources.list << EOF
# Ubuntu $VER ($CODENAME) 国内镜像源
# 阿里云镜像源
deb https://mirrors.aliyun.com/ubuntu/ $CODENAME main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ $CODENAME-updates main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ $CODENAME-backports main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ $CODENAME-security main restricted universe multiverse

# 清华大学镜像源 (备用)
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $CODENAME main restricted universe multiverse
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $CODENAME-updates main restricted universe multiverse
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $CODENAME-backports main restricted universe multiverse
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ $CODENAME-security main restricted universe multiverse

# 中科大镜像源 (备用)
# deb https://mirrors.ustc.edu.cn/ubuntu/ $CODENAME main restricted universe multiverse
# deb https://mirrors.ustc.edu.cn/ubuntu/ $CODENAME-updates main restricted universe multiverse
# deb https://mirrors.ustc.edu.cn/ubuntu/ $CODENAME-backports main restricted universe multiverse
# deb https://mirrors.ustc.edu.cn/ubuntu/ $CODENAME-security main restricted universe multiverse
EOF
        ;;
    *"Debian"*)
        echo "🔧 配置 Debian 国内镜像源..."
        cat > /etc/apt/sources.list << EOF
# Debian $VER ($CODENAME) 国内镜像源
# 阿里云镜像源
deb https://mirrors.aliyun.com/debian/ $CODENAME main contrib non-free
deb https://mirrors.aliyun.com/debian/ $CODENAME-updates main contrib non-free
deb https://mirrors.aliyun.com/debian-security/ $CODENAME-security main contrib non-free

# 清华大学镜像源 (备用)
# deb https://mirrors.tuna.tsinghua.edu.cn/debian/ $CODENAME main contrib non-free
# deb https://mirrors.tuna.tsinghua.edu.cn/debian/ $CODENAME-updates main contrib non-free
# deb https://mirrors.tuna.tsinghua.edu.cn/debian-security/ $CODENAME-security main contrib non-free

# 中科大镜像源 (备用)
# deb https://mirrors.ustc.edu.cn/debian/ $CODENAME main contrib non-free
# deb https://mirrors.ustc.edu.cn/debian/ $CODENAME-updates main contrib non-free
# deb https://mirrors.ustc.edu.cn/debian-security/ $CODENAME-security main contrib non-free
EOF
        ;;
    *)
        echo "⚠️  未知系统类型: $OS"
        echo "请手动配置 APT 镜像源"
        exit 1
        ;;
esac

echo "✅ APT 镜像源配置完成"
echo "📋 新配置内容:"
cat /etc/apt/sources.list

# 更新软件包列表
echo "\n🔄 更新软件包列表..."
if apt-get update; then
    echo "✅ 软件包列表更新成功"
else
    echo "❌ 软件包列表更新失败"
    echo "尝试恢复原始配置..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" /etc/apt/sources.list
        echo "✅ 已恢复原始配置"
    fi
    exit 1
fi

# 测试镜像源连通性
echo "\n🧪 测试镜像源连通性..."
MIRRORS=(
    "https://mirrors.aliyun.com"
    "https://mirrors.tuna.tsinghua.edu.cn"
    "https://mirrors.ustc.edu.cn"
)

for mirror in "${MIRRORS[@]}"; do
    echo "测试: $mirror"
    if curl -I "$mirror" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
        echo "✅ $mirror - 连接正常"
    else
        echo "❌ $mirror - 连接失败"
    fi
done

echo "\n======================================"
echo "🎉 APT 国内镜像源配置完成！"
echo ""
echo "📝 配置说明:"
echo "   - 主要使用阿里云镜像源"
echo "   - 备用源已注释，可根据需要启用"
echo "   - 原始配置已备份到: $BACKUP_FILE"
echo ""
echo "🔧 如果仍有问题，请尝试:"
echo "   1. 启用备用镜像源"
echo "   2. 检查网络连接"
echo "   3. 恢复原始配置: cp $BACKUP_FILE /etc/apt/sources.list"
echo "   4. 使用其他镜像源"