#!/bin/bash

# SiCal 快捷部署脚本
# 这是一个快捷脚本，实际的部署脚本位于 deployment/scripts/deploy.sh

echo "🚀 SiCal 部署脚本"
echo "正在调用主部署脚本..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 调用主部署脚本
exec "$SCRIPT_DIR/deployment/scripts/deploy.sh" "$@"