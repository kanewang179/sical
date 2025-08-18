// Jenkins 插件国内镜像源配置
// 在 Jenkins 启动时自动配置插件更新中心为国内镜像源

import jenkins.model.Jenkins
import hudson.model.UpdateSite
import hudson.model.UpdateCenter

def jenkins = Jenkins.getInstance()
def updateCenter = jenkins.getUpdateCenter()

// 清除现有的更新站点
updateCenter.getSites().clear()

// 添加国内镜像源
def chinaMirrors = [
    [
        id: 'tsinghua',
        url: 'https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json',
        note: '清华大学镜像源'
    ],
    [
        id: 'ustc', 
        url: 'https://mirrors.ustc.edu.cn/jenkins/updates/update-center.json',
        note: '中科大镜像源'
    ],
    [
        id: 'huawei',
        url: 'https://mirrors.huaweicloud.com/jenkins/updates/update-center.json', 
        note: '华为云镜像源'
    ],
    [
        id: 'aliyun',
        url: 'https://mirrors.aliyun.com/jenkins/updates/update-center.json',
        note: '阿里云镜像源'
    ]
]

// 尝试添加可用的镜像源
boolean mirrorAdded = false

for (mirror in chinaMirrors) {
    try {
        println "尝试配置 Jenkins 插件镜像源: ${mirror.note}"
        
        // 测试镜像源连通性
        def connection = new URL(mirror.url).openConnection()
        connection.setConnectTimeout(5000)
        connection.setReadTimeout(10000)
        connection.connect()
        
        if (connection.responseCode == 200) {
            // 添加镜像源
            def site = new UpdateSite(mirror.id, mirror.url)
            updateCenter.getSites().add(site)
            
            println "✅ 成功配置 Jenkins 插件镜像源: ${mirror.note}"
            println "   URL: ${mirror.url}"
            mirrorAdded = true
            break
        }
    } catch (Exception e) {
        println "❌ 镜像源 ${mirror.note} 连接失败: ${e.message}"
        continue
    }
}

// 如果所有国内镜像源都不可用，使用官方源作为备用
if (!mirrorAdded) {
    println "⚠️  所有国内镜像源不可用，使用官方更新中心"
    def defaultSite = new UpdateSite('default', 'https://updates.jenkins.io/update-center.json')
    updateCenter.getSites().add(defaultSite)
}

// 保存配置
jenkins.save()

println "🎉 Jenkins 插件镜像源配置完成"
println "当前配置的更新站点:"
updateCenter.getSites().each { site ->
    println "  - ${site.getId()}: ${site.getUrl()}"
}

// 强制更新插件信息
try {
    updateCenter.doRefreshUpdates()
    println "✅ 插件更新信息刷新完成"
} catch (Exception e) {
    println "⚠️  插件更新信息刷新失败: ${e.message}"
}