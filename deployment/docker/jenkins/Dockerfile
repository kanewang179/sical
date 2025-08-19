# 使用mirrors.json配置的Docker镜像源加速
# 通过read-mirrors.sh脚本动态获取镜像源配置
ARG DOCKER_HUB_PROXY=docker.m.daocloud.io
FROM ${DOCKER_HUB_PROXY}/jenkins/jenkins:lts

# 切换到root用户安装工具
USER root

# 定义镜像源变量
# 从mirrors.json读取镜像源配置
COPY mirrors.json /tmp/mirrors.json
COPY docker/read-mirrors.sh /tmp/read-mirrors.sh
RUN chmod +x /tmp/read-mirrors.sh && \
    . /tmp/read-mirrors.sh && \
    echo "DEBIAN_MIRROR=${DEBIAN_MIRROR}" >> /tmp/mirrors.env && \
    echo "DEBIAN_SECURITY_MIRROR=${DEBIAN_SECURITY_MIRROR}" >> /tmp/mirrors.env && \
    echo "DOCKER_CE_MIRROR=${DOCKER_CE_MIRROR}" >> /tmp/mirrors.env && \
    echo "DOCKER_HUB_PROXY=${DOCKER_HUB_PROXY}" >> /tmp/mirrors.env && \
    echo "KUBERNETES_OSS_REPO=${KUBERNETES_OSS}" >> /tmp/mirrors.env && \
    echo "GITHUB_PROXY=${GITHUB_PROXY}" >> /tmp/mirrors.env && \
    echo "HELM_REPO=${HELM_REPOSITORY}" >> /tmp/mirrors.env && \
    echo "NODEJS_MIRROR=${NODEJS_MIRROR}" >> /tmp/mirrors.env && \
    echo "JENKINS_UPDATE_CENTER=${JENKINS_UPDATE_CENTER}" >> /tmp/mirrors.env

# 从环境文件读取变量
RUN . /tmp/mirrors.env && \
    export DEBIAN_MIRROR && \
    export DEBIAN_SECURITY_MIRROR

# 配置国内镜像源加速下载
RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list.d/debian.sources || \
    (echo "deb ${DEBIAN_MIRROR}/ bookworm main" > /etc/apt/sources.list && \
     echo "deb ${DEBIAN_MIRROR}/ bookworm-updates main" >> /etc/apt/sources.list && \
     echo "deb ${DEBIAN_SECURITY_MIRROR}/ bookworm-security main" >> /etc/apt/sources.list)

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# 定义 Docker 镜像源变量
# Docker CE镜像源已在上面的mirrors.env中定义

# 安装 Docker CE CLI (使用阿里云镜像源)
RUN curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# 定义 Kubernetes 工具镜像源变量
# Kubernetes、GitHub和Helm镜像源已在上面的mirrors.env中定义

# 安装kubectl（使用阿里云镜像源，自动检测架构）
RUN ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') && \
    KUBECTL_VERSION=$(curl -L -s https://kubernetes.oss-cn-hangzhou.aliyuncs.com/kubernetes-release/release/stable.txt) && \
    curl -LO "https://kubernetes.oss-cn-hangzhou.aliyuncs.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/linux/${ARCH}/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/

# 安装Kind（使用DaoCloud镜像源，自动检测架构）
RUN ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') && \
    curl -Lo ./kind "https://files.m.daocloud.io/github.com/kubernetes-sigs/kind/releases/download/v0.20.0/kind-linux-${ARCH}" \
    && chmod +x ./kind \
    && mv ./kind /usr/local/bin/kind

# 安装Helm（使用官方源，自动检测架构）
RUN ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') && \
    curl -fsSL "https://get.helm.sh/helm-v3.12.3-linux-${ARCH}.tar.gz" -o helm.tar.gz \
    && tar -zxvf helm.tar.gz \
    && mv linux-${ARCH}/helm /usr/local/bin/helm \
    && rm -rf helm.tar.gz linux-${ARCH}

# 定义 Node.js 镜像源变量
# Node.js镜像源已在上面的mirrors.env中定义

# 安装Node.js和npm（使用NodeSource官方源）
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# 创建Jenkins用户的.kube目录
RUN mkdir -p /var/jenkins_home/.kube \
    && chown jenkins:jenkins /var/jenkins_home/.kube

# 将jenkins用户添加到docker组
RUN groupadd -g 999 docker || true \
    && usermod -aG docker jenkins

# 复制初始化脚本
COPY docker/jenkins/init.groovy /usr/share/jenkins/ref/init.groovy.d/

# 复制插件列表
COPY docker/jenkins/plugins.txt /usr/share/jenkins/ref/plugins.txt

# 定义 Jenkins 镜像源变量
# Jenkins更新中心已在上面的mirrors.env中定义

# 配置Jenkins插件国内镜像源
RUN mkdir -p /usr/share/jenkins/ref/updates && \
    echo "{\"connectionCheckUrl\":\"${JENKINS_UPDATE_CENTER}/current/update-center.json\",\"id\":\"default\",\"url\":\"${JENKINS_UPDATE_CENTER}/current/update-center.json\"}" > /usr/share/jenkins/ref/updates/default.json

# 安装插件（使用国内镜像源，添加详细日志）
RUN set -x && \
    echo "开始安装Jenkins插件..." && \
    jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt --plugin-download-directory /usr/share/jenkins/ref/plugins --verbose && \
    echo "Jenkins插件安装完成!"

# 切换回jenkins用户
USER jenkins

# 跳过初始设置向导
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# 暴露端口
EXPOSE 8080 50000