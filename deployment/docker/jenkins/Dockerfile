FROM jenkins/jenkins:lts

# 切换到root用户安装工具
USER root

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
    && rm -rf /var/lib/apt/lists/*

# 安装Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# 安装kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/

# 安装Kind
RUN curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64 \
    && chmod +x ./kind \
    && mv ./kind /usr/local/bin/kind

# 安装Helm
RUN curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | tee /usr/share/keyrings/helm.gpg > /dev/null \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | tee /etc/apt/sources.list.d/helm-stable-debian.list \
    && apt-get update \
    && apt-get install -y helm \
    && rm -rf /var/lib/apt/lists/*

# 安装Node.js和npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# 创建Jenkins用户的.kube目录
RUN mkdir -p /var/jenkins_home/.kube \
    && chown jenkins:jenkins /var/jenkins_home/.kube

# 将jenkins用户添加到docker组
RUN groupadd -g 999 docker || true \
    && usermod -aG docker jenkins

# 复制初始化脚本
COPY init.groovy /usr/share/jenkins/ref/init.groovy.d/

# 复制插件列表
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt

# 安装插件
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# 切换回jenkins用户
USER jenkins

# 跳过初始设置向导
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# 暴露端口
EXPOSE 8080 50000