#!/bin/bash

# SiCal项目 - Jenkins设置脚本
# 用于自动化Jenkins配置和集成

set -e

echo "🚀 开始设置SiCal Jenkins环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要工具
check_prerequisites() {
    echo -e "${BLUE}检查必要工具...${NC}"
    
    command -v docker >/dev/null 2>&1 || { echo -e "${RED}错误: Docker未安装${NC}"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}错误: Docker Compose未安装${NC}"; exit 1; }
    
    echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
}

# 构建自定义Jenkins镜像
build_jenkins_image() {
    echo -e "${BLUE}构建自定义Jenkins镜像...${NC}"
    
    # 获取脚本目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    JENKINS_DIR="$SCRIPT_DIR/../docker/jenkins"
    
    cd "$JENKINS_DIR"
    docker build -t sical-jenkins:latest .
    cd "$PROJECT_ROOT"
    
    echo -e "${GREEN}✅ Jenkins镜像构建完成${NC}"
}

# 启动Jenkins服务
start_jenkins() {
    echo -e "${BLUE}启动Jenkins服务...${NC}"
    
    # 获取脚本目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    
    # 创建Jenkins数据目录
    mkdir -p "$PROJECT_ROOT/jenkins-data"
    sudo chown -R 1000:1000 "$PROJECT_ROOT/jenkins-data"
    
    # 启动Jenkins容器
    cd "$SCRIPT_DIR/../docker"
    docker-compose up -d jenkins
    cd "$PROJECT_ROOT"
    
    echo -e "${YELLOW}等待Jenkins启动...${NC}"
    sleep 30
    
    # 等待Jenkins完全启动
    while ! curl -s http://localhost:8080/login >/dev/null; do
        echo "等待Jenkins启动..."
        sleep 10
    done
    
    echo -e "${GREEN}✅ Jenkins启动完成${NC}"
}

# 配置Jenkins与Kubernetes集成
setup_kubernetes_integration() {
    echo -e "${BLUE}配置Jenkins与Kubernetes集成...${NC}"
    
    # 获取Kubernetes配置
    KUBE_CONFIG_PATH="$HOME/.kube/config"
    
    if [ -f "$KUBE_CONFIG_PATH" ]; then
        # 复制kubeconfig到Jenkins容器
        docker cp "$KUBE_CONFIG_PATH" jenkins:/var/jenkins_home/.kube/config
        docker exec jenkins chown jenkins:jenkins /var/jenkins_home/.kube/config
        
        echo -e "${GREEN}✅ Kubernetes配置已复制到Jenkins${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到Kubernetes配置文件，请手动配置${NC}"
    fi
}

# 配置Docker集成
setup_docker_integration() {
    echo -e "${BLUE}配置Jenkins与Docker集成...${NC}"
    
    # 确保Jenkins容器可以访问Docker socket
    docker exec jenkins ls -la /var/run/docker.sock
    
    echo -e "${GREEN}✅ Docker集成配置完成${NC}"
}

# 创建Jenkins Pipeline任务
create_pipeline_job() {
    echo -e "${BLUE}创建Jenkins Pipeline任务...${NC}"
    
    # 创建Pipeline任务配置
    cat > pipeline-job.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@1400.v7fd111b_ec82f">
  <actions/>
  <description>SiCal前端自动化部署Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.plugins.jira.JiraProjectProperty plugin="jira@3.7"/>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@3883.vb_3ff2a_a_d10eb_">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@5.2.2">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/your-username/sical.git</url>
          <credentialsId>git-credentials</credentialsId>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="empty-list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

    # 使用Jenkins CLI创建任务
    docker exec jenkins java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://localhost:8080/ -auth admin:admin123 create-job sical-frontend-deploy < pipeline-job.xml
    
    rm pipeline-job.xml
    
    echo -e "${GREEN}✅ Pipeline任务创建完成${NC}"
}

# 配置Webhook
setup_webhooks() {
    echo -e "${BLUE}配置Git Webhooks...${NC}"
    
    echo -e "${YELLOW}请手动配置Git仓库的Webhook:${NC}"
    echo "URL: http://your-jenkins-url:8080/github-webhook/"
    echo "事件: Push events, Pull request events"
    
    echo -e "${GREEN}✅ Webhook配置信息已提供${NC}"
}

# 验证Jenkins配置
verify_jenkins() {
    echo -e "${BLUE}验证Jenkins配置...${NC}"
    
    # 检查Jenkins状态
    if curl -s http://localhost:8080/login | grep -q "Jenkins"; then
        echo -e "${GREEN}✅ Jenkins Web界面可访问${NC}"
    else
        echo -e "${RED}❌ Jenkins Web界面不可访问${NC}"
    fi
    
    # 检查Docker连接
    if docker exec jenkins docker version >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Jenkins可以访问Docker${NC}"
    else
        echo -e "${RED}❌ Jenkins无法访问Docker${NC}"
    fi
    
    # 检查kubectl连接
    if docker exec jenkins kubectl version --client >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Jenkins可以访问kubectl${NC}"
    else
        echo -e "${RED}❌ Jenkins无法访问kubectl${NC}"
    fi
}

# 显示访问信息
show_access_info() {
    echo -e "${GREEN}🎉 SiCal Jenkins环境设置完成！${NC}"
    echo -e "${BLUE}访问信息:${NC}"
    echo "• Jenkins URL: http://localhost:8080"
    echo "• 用户名: admin"
    echo "• 密码: admin123"
    echo "• Pipeline任务: sical-frontend-deploy"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "1. 访问Jenkins Web界面"
    echo "2. 配置Git仓库凭据"
    echo "3. 配置Slack通知（可选）"
    echo "4. 运行第一次构建测试"
    echo "5. 配置Git仓库的Webhook"
}

# 清理函数
cleanup() {
    echo -e "${BLUE}清理临时文件...${NC}"
    rm -f pipeline-job.xml
}

# 错误处理
trap cleanup EXIT

# 主函数
main() {
    check_prerequisites
    build_jenkins_image
    start_jenkins
    setup_kubernetes_integration
    setup_docker_integration
    create_pipeline_job
    setup_webhooks
    verify_jenkins
    show_access_info
}

# 执行主函数
main "$@"