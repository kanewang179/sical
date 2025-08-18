#!/bin/bash

# Jenkins GitHub 镜像构建脚本 - 带详细进度显示
# 显示构建进度、速度和预期时间

echo "🚀 开始构建 Jenkins GitHub 镜像..."
echo "📊 构建配置:"
echo "   - 镜像名称: jenkins-github:docker-only"
echo "   - 构建模式: 无缓存 (--no-cache)"
echo "   - 进度显示: 详细模式 (plain)"
echo "   - 预计步骤: 8个构建步骤"
echo "   - 预计时间: 10-15分钟"
echo ""

# 记录开始时间
START_TIME=$(date +%s)

echo "⏰ 构建开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 设置环境变量以获得最佳进度显示
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

# 执行构建命令
docker-compose -f docker-compose-github.yml build \
  --progress=plain \
  --no-cache \
  jenkins-github 2>&1 | while IFS= read -r line; do
    
    # 显示当前时间戳
    CURRENT_TIME=$(date '+%H:%M:%S')
    
    # 计算已用时间
    CURRENT_TIMESTAMP=$(date +%s)
    ELAPSED=$((CURRENT_TIMESTAMP - START_TIME))
    ELAPSED_MIN=$((ELAPSED / 60))
    ELAPSED_SEC=$((ELAPSED % 60))
    
    # 检测构建步骤
    if [[ $line =~ \#[0-9]+\ \[[0-9]+/[0-9]+\] ]]; then
        echo "[$CURRENT_TIME] [已用时: ${ELAPSED_MIN}m${ELAPSED_SEC}s] 🔨 $line"
    elif [[ $line =~ "Get:" ]] && [[ $line =~ "kB" ]]; then
        # 提取下载信息
        SIZE=$(echo "$line" | grep -o '\[[0-9.]\+[[:space:]]\?[kMG]B\]' | tr -d '[]')
        echo "[$CURRENT_TIME] [已用时: ${ELAPSED_MIN}m${ELAPSED_SEC}s] 📥 下载: $SIZE - $line"
    elif [[ $line =~ "DONE" ]]; then
        echo "[$CURRENT_TIME] [已用时: ${ELAPSED_MIN}m${ELAPSED_SEC}s] ✅ $line"
    elif [[ $line =~ "transferring" ]]; then
        echo "[$CURRENT_TIME] [已用时: ${ELAPSED_MIN}m${ELAPSED_SEC}s] 📤 $line"
    else
        echo "[$CURRENT_TIME] [已用时: ${ELAPSED_MIN}m${ELAPSED_SEC}s] $line"
    fi
done

# 记录结束时间
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
TOTAL_MIN=$((TOTAL_TIME / 60))
TOTAL_SEC=$((TOTAL_TIME % 60))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 构建完成!"
echo "⏱️  总耗时: ${TOTAL_MIN}分${TOTAL_SEC}秒"
echo "📅 完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🔍 验证构建结果:"
docker images | grep jenkins-github
echo ""
echo "🚀 启动服务命令:"
echo "   docker-compose -f docker-compose-github.yml up -d"
echo ""