#!/bin/zsh

# 测试Docker Hub镜像源速度的脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试镜像
TEST_IMAGE="hello-world:latest"

# Docker镜像源列表
DOCKER_MIRRORS=(
    "https://docker.m.daocloud.io"
    "https://docker.unsee.tech"
    "https://dockerpull.org"
    "https://hub.rat.dev"
    "https://docker.rainbond.cc"
)

echo -e "${GREEN}找到 ${#DOCKER_MIRRORS[@]} 个Docker镜像源${NC}"

# 清理可能存在的测试镜像
echo -e "${YELLOW}清理现有的测试镜像...${NC}"
docker rmi "$TEST_IMAGE" 2>/dev/null || true

# 测试结果
fastest_mirror=""
fastest_time=999999

# 测试每个镜像源
for mirror in "${DOCKER_MIRRORS[@]}"; do
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}测试镜像源: $mirror${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # 清理之前的镜像
    docker rmi "$TEST_IMAGE" 2>/dev/null || true
    
    # 记录开始时间
    start_time=$(date +%s)
    
    # 尝试从当前镜像源拉取镜像
    if docker pull "$mirror/$TEST_IMAGE" 2>&1; then
        # 记录结束时间
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        
        echo -e "${GREEN}✓ 成功! 耗时: ${duration}秒${NC}"
        
        # 检查是否是最快的
        if [ $duration -lt $fastest_time ]; then
            fastest_time=$duration
            fastest_mirror="$mirror"
        fi
        
        # 清理镜像
        docker rmi "$mirror/$TEST_IMAGE" 2>/dev/null || true
    else
        echo -e "${RED}✗ 失败${NC}"
    fi
    
    echo -e "${YELLOW}等待2秒后测试下一个镜像源...${NC}"
    sleep 2
done

# 显示测试结果
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}测试结果汇总${NC}"
echo -e "${BLUE}========================================${NC}"

if [[ -n "$fastest_mirror" ]]; then
    echo -e "\n${GREEN}🏆 最快的镜像源: $fastest_mirror (${fastest_time}秒)${NC}"
    
    # 提取镜像源域名
    domain=$(echo "$fastest_mirror" | sed 's|https\?://||' | sed 's|/.*||')
    
    echo -e "\n${YELLOW}将 $domain 设置为主要代理...${NC}"
    
    # 更新mirrors.json中的primary配置
    python3 -c "
import json
with open('../mirrors.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
data['mirrors']['docker']['hub_proxy']['primary'] = '$domain'
with open('../mirrors.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
"
    echo -e "${GREEN}✓ 已更新mirrors.json，将 $domain 设置为主要代理${NC}"
else
    echo -e "\n${RED}没有找到可用的镜像源${NC}"
fi

echo -e "\n${BLUE}测试完成!${NC}"