#!/usr/bin/env node

/**
 * SiCal 文档版本管理工具
 * 用于自动化管理文档版本、生成变更日志、归档版本等
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentVersionManager {
  constructor() {
    this.configPath = path.join(__dirname, '../.version-config.json');
    this.config = this.loadConfig();
    this.docsRoot = path.join(__dirname, '../');
  }

  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error('无法加载版本配置文件:', error.message);
      process.exit(1);
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('✅ 配置文件已更新');
    } catch (error) {
      console.error('❌ 保存配置文件失败:', error.message);
    }
  }

  /**
   * 解析语义化版本号
   */
  parseVersion(version) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) {
      throw new Error(`无效的版本号格式: ${version}`);
    }
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }

  /**
   * 递增版本号
   */
  incrementVersion(currentVersion, type) {
    const version = this.parseVersion(currentVersion);
    
    switch (type) {
      case 'major':
        version.major++;
        version.minor = 0;
        version.patch = 0;
        break;
      case 'minor':
        version.minor++;
        version.patch = 0;
        break;
      case 'patch':
        version.patch++;
        break;
      default:
        throw new Error(`无效的版本类型: ${type}`);
    }
    
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  /**
   * 获取当前日期字符串
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 更新文档的版本信息
   */
  updateDocumentVersion(filePath, newVersion, changes) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
      const match = content.match(frontMatterRegex);
      
      if (!match) {
        console.warn(`⚠️  文件 ${filePath} 没有找到版本信息头部`);
        return false;
      }

      // 解析现有的YAML前置信息
      const yamlContent = match[1];
      const lines = yamlContent.split('\n');
      const updatedLines = [];
      let inChangelog = false;
      let changelogIndent = '';

      for (let line of lines) {
        if (line.startsWith('version:')) {
          updatedLines.push(`version: "${newVersion}"`);
        } else if (line.startsWith('last_updated:')) {
          updatedLines.push(`last_updated: "${this.getCurrentDate()}"`);
        } else if (line.startsWith('changelog:')) {
          updatedLines.push(line);
          // 添加新的变更记录
          updatedLines.push(`  - version: "${newVersion}"`);
          updatedLines.push(`    date: "${this.getCurrentDate()}"`);
          updatedLines.push(`    changes: ${JSON.stringify(changes)}`);
          inChangelog = true;
        } else if (inChangelog && line.match(/^\s*-\s*version:/)) {
          // 保留现有的变更记录
          updatedLines.push(line);
          inChangelog = false;
        } else if (!inChangelog || !line.match(/^\s*-\s*(version|date|changes):/)) {
          updatedLines.push(line);
        }
      }

      // 重新构建文件内容
      const newContent = content.replace(
        frontMatterRegex,
        `---\n${updatedLines.join('\n')}\n---\n`
      );

      fs.writeFileSync(filePath, newContent);
      console.log(`✅ 已更新 ${filePath} 到版本 ${newVersion}`);
      return true;
    } catch (error) {
      console.error(`❌ 更新文件 ${filePath} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 批量更新文档版本
   */
  bumpVersion(type, changes, targetDocs = null) {
    const currentVersion = this.config.versioning.current_version;
    const newVersion = this.incrementVersion(currentVersion, type);
    
    console.log(`🚀 准备将版本从 ${currentVersion} 升级到 ${newVersion}`);
    
    const docsToUpdate = targetDocs || Object.keys(this.config.documents);
    let successCount = 0;
    
    for (const docKey of docsToUpdate) {
      const docConfig = this.config.documents[docKey];
      if (!docConfig) {
        console.warn(`⚠️  未找到文档配置: ${docKey}`);
        continue;
      }
      
      const docPath = path.join(this.docsRoot, docConfig.path);
      let filesToUpdate = [];
      
      if (fs.statSync(docPath).isDirectory()) {
        // 如果是目录，查找README.md
        const readmePath = path.join(docPath, 'README.md');
        if (fs.existsSync(readmePath)) {
          filesToUpdate.push(readmePath);
        }
      } else {
        // 如果是文件
        filesToUpdate.push(docPath);
      }
      
      for (const filePath of filesToUpdate) {
        if (this.updateDocumentVersion(filePath, newVersion, changes)) {
          successCount++;
        }
      }
      
      // 更新配置中的版本
      this.config.documents[docKey].version = newVersion;
    }
    
    // 更新全局版本
    this.config.versioning.current_version = newVersion;
    this.saveConfig();
    
    console.log(`\n🎉 版本更新完成! 成功更新 ${successCount} 个文档`);
    console.log(`📝 新版本: ${newVersion}`);
    
    return newVersion;
  }

  /**
   * 创建版本归档
   */
  archiveVersion(version) {
    const archiveDir = path.join(this.docsRoot, 'versions', `v${version}`);
    
    try {
      // 创建归档目录
      fs.mkdirSync(archiveDir, { recursive: true });
      
      // 复制当前文档到归档目录
      const sourceDirs = ['architecture', 'features'];
      
      for (const dir of sourceDirs) {
        const sourceDir = path.join(this.docsRoot, dir);
        const targetDir = path.join(archiveDir, dir);
        
        if (fs.existsSync(sourceDir)) {
          this.copyDirectory(sourceDir, targetDir);
        }
      }
      
      // 复制配置文件
      const configTarget = path.join(archiveDir, '.version-config.json');
      fs.copyFileSync(this.configPath, configTarget);
      
      console.log(`📦 版本 ${version} 已归档到 ${archiveDir}`);
      return true;
    } catch (error) {
      console.error(`❌ 归档版本 ${version} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 递归复制目录
   */
  copyDirectory(source, target) {
    fs.mkdirSync(target, { recursive: true });
    
    const items = fs.readdirSync(source);
    
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * 生成变更日志
   */
  generateChangelog() {
    const changelogPath = path.join(this.docsRoot, 'CHANGELOG.md');
    let changelog = '# 变更日志\n\n';
    
    // 从各个文档中收集变更信息
    const allChanges = new Map();
    
    for (const [docKey, docConfig] of Object.entries(this.config.documents)) {
      const docPath = path.join(this.docsRoot, docConfig.path);
      let filePath;
      
      if (fs.statSync(docPath).isDirectory()) {
        filePath = path.join(docPath, 'README.md');
      } else {
        filePath = docPath;
      }
      
      if (fs.existsSync(filePath)) {
        const changes = this.extractChangesFromDocument(filePath);
        for (const [version, changeData] of changes) {
          if (!allChanges.has(version)) {
            allChanges.set(version, { date: changeData.date, changes: [] });
          }
          allChanges.get(version).changes.push(...changeData.changes.map(c => `[${docKey}] ${c}`));
        }
      }
    }
    
    // 按版本排序（降序）
    const sortedVersions = Array.from(allChanges.keys()).sort((a, b) => {
      const versionA = this.parseVersion(a);
      const versionB = this.parseVersion(b);
      
      if (versionA.major !== versionB.major) return versionB.major - versionA.major;
      if (versionA.minor !== versionB.minor) return versionB.minor - versionA.minor;
      return versionB.patch - versionA.patch;
    });
    
    // 生成变更日志内容
    for (const version of sortedVersions) {
      const changeData = allChanges.get(version);
      changelog += `## [${version}] - ${changeData.date}\n\n`;
      
      for (const change of changeData.changes) {
        changelog += `- ${change}\n`;
      }
      
      changelog += '\n';
    }
    
    fs.writeFileSync(changelogPath, changelog);
    console.log(`📋 变更日志已生成: ${changelogPath}`);
  }

  /**
   * 从文档中提取变更信息
   */
  extractChangesFromDocument(filePath) {
    const changes = new Map();
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
      const match = content.match(frontMatterRegex);
      
      if (match) {
        const yamlContent = match[1];
        const lines = yamlContent.split('\n');
        let inChangelog = false;
        let currentVersion = null;
        let currentDate = null;
        
        for (const line of lines) {
          if (line.trim().startsWith('changelog:')) {
            inChangelog = true;
          } else if (inChangelog) {
            const versionMatch = line.match(/^\s*-\s*version:\s*"([^"]+)"/);
            const dateMatch = line.match(/^\s*date:\s*"([^"]+)"/);
            const changesMatch = line.match(/^\s*changes:\s*\[(.*)\]/);
            
            if (versionMatch) {
              currentVersion = versionMatch[1];
            } else if (dateMatch) {
              currentDate = dateMatch[1];
            } else if (changesMatch && currentVersion && currentDate) {
              const changesList = JSON.parse(`[${changesMatch[1]}]`);
              changes.set(currentVersion, {
                date: currentDate,
                changes: changesList
              });
              currentVersion = null;
              currentDate = null;
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  解析文档 ${filePath} 的变更信息失败:`, error.message);
    }
    
    return changes;
  }

  /**
   * 显示当前版本状态
   */
  showStatus() {
    console.log('📊 文档版本状态:\n');
    console.log(`项目: ${this.config.project.name}`);
    console.log(`当前版本: ${this.config.versioning.current_version}`);
    console.log(`版本控制方案: ${this.config.versioning.scheme}\n`);
    
    console.log('📚 文档模块:');
    for (const [docKey, docConfig] of Object.entries(this.config.documents)) {
      console.log(`  ${docKey.padEnd(15)} v${docConfig.version.padEnd(8)} [${docConfig.status}]`);
    }
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
📖 SiCal 文档版本管理工具

使用方法:
  node version-manager.js <command> [options]

命令:
  status                    显示当前版本状态
  bump <type> [changes]     升级版本 (type: major|minor|patch)
  archive [version]         归档指定版本
  changelog                 生成变更日志
  help                      显示帮助信息

示例:
  node version-manager.js status
  node version-manager.js bump minor "添加新功能,修复bug"
  node version-manager.js archive 1.0.0
  node version-manager.js changelog
`);
  }
}

// 命令行接口
function main() {
  const manager = new DocumentVersionManager();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    manager.showHelp();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'status':
      manager.showStatus();
      break;
      
    case 'bump':
      if (args.length < 2) {
        console.error('❌ 请指定版本类型 (major|minor|patch)');
        process.exit(1);
      }
      
      const type = args[1];
      const changesStr = args[2] || '常规更新';
      const changes = changesStr.split(',').map(c => c.trim());
      
      manager.bumpVersion(type, changes);
      break;
      
    case 'archive':
      const version = args[1] || manager.config.versioning.current_version;
      manager.archiveVersion(version);
      break;
      
    case 'changelog':
      manager.generateChangelog();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      manager.showHelp();
      break;
      
    default:
      console.error(`❌ 未知命令: ${command}`);
      manager.showHelp();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DocumentVersionManager;