# 知识库管理 UI/UX 设计文档

## 1. 设计概览

### 1.1 设计原则

#### 核心设计理念
- **信息架构清晰**: 知识内容层次分明，导航路径清晰
- **搜索体验优先**: 强化搜索功能，支持多维度筛选
- **协作友好**: 支持实时协作编辑和版本管理
- **内容可视化**: 丰富的内容展示形式，支持多媒体
- **响应式设计**: 适配各种设备和屏幕尺寸

#### 用户体验目标
- **高效检索**: 用户能在3秒内找到所需知识
- **便捷创作**: 知识创建和编辑流程简化
- **协作无缝**: 多人协作编辑体验流畅
- **质量保证**: 知识质量评估和改进机制完善

### 1.2 目标用户

#### 主要用户群体
- **知识创作者**: 教师、专家、内容创作者
- **知识消费者**: 学生、研究人员、从业者
- **知识管理员**: 内容审核员、系统管理员
- **协作参与者**: 团队成员、同行评议者

---

## 2. 视觉设计系统

### 2.1 色彩系统

#### 主色调
```css
:root {
  /* 主品牌色 - 知识蓝 */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;  /* 主色 */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  
  /* 辅助色 - 智慧绿 */
  --secondary-50: #f0fdf4;
  --secondary-100: #dcfce7;
  --secondary-200: #bbf7d0;
  --secondary-300: #86efac;
  --secondary-400: #4ade80;
  --secondary-500: #22c55e;  /* 辅助色 */
  --secondary-600: #16a34a;
  --secondary-700: #15803d;
  --secondary-800: #166534;
  --secondary-900: #14532d;
  
  /* 功能色 */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* 中性色 */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

#### 语义化颜色
```css
:root {
  /* 知识状态色 */
  --knowledge-draft: #f59e0b;      /* 草稿 */
  --knowledge-review: #8b5cf6;     /* 审核中 */
  --knowledge-published: #10b981;  /* 已发布 */
  --knowledge-archived: #6b7280;   /* 已归档 */
  
  /* 质量评级色 */
  --quality-excellent: #059669;    /* 优秀 */
  --quality-good: #0891b2;         /* 良好 */
  --quality-average: #ca8a04;      /* 一般 */
  --quality-poor: #dc2626;         /* 较差 */
  
  /* 协作状态色 */
  --collab-online: #10b981;        /* 在线 */
  --collab-editing: #f59e0b;       /* 编辑中 */
  --collab-offline: #6b7280;       /* 离线 */
}
```

### 2.2 字体系统

#### 字体族
```css
:root {
  /* 主字体 - 适合中英文混排 */
  --font-primary: 'Inter', 'PingFang SC', 'Hiragino Sans GB', 
                  'Microsoft YaHei', sans-serif;
  
  /* 代码字体 */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 
               'Monaco', monospace;
  
  /* 数学公式字体 */
  --font-math: 'KaTeX_Main', 'Times New Roman', serif;
}
```

#### 字体大小
```css
:root {
  /* 字体大小 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### 2.3 间距系统

```css
:root {
  /* 间距系统 - 基于 4px 网格 */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### 2.4 圆角和阴影

```css
:root {
  /* 圆角 */
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
                 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
               0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
               0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
               0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

---

## 3. 组件设计

### 3.1 知识卡片组件

#### 基础知识卡片
```html
<div class="knowledge-card">
  <div class="knowledge-card__header">
    <div class="knowledge-card__category">
      <span class="category-tag">计算机科学</span>
      <span class="difficulty-badge difficulty--intermediate">中级</span>
    </div>
    <div class="knowledge-card__actions">
      <button class="btn-icon" aria-label="收藏">
        <svg class="icon icon--bookmark">...</svg>
      </button>
      <button class="btn-icon" aria-label="分享">
        <svg class="icon icon--share">...</svg>
      </button>
    </div>
  </div>
  
  <div class="knowledge-card__content">
    <h3 class="knowledge-card__title">
      <a href="/knowledge/123">深度学习基础：神经网络原理与实现</a>
    </h3>
    <p class="knowledge-card__summary">
      本文详细介绍了深度学习的基础概念，包括神经网络的基本原理、
      反向传播算法以及常见的网络架构...
    </p>
    
    <div class="knowledge-card__tags">
      <span class="tag">深度学习</span>
      <span class="tag">神经网络</span>
      <span class="tag">机器学习</span>
    </div>
  </div>
  
  <div class="knowledge-card__footer">
    <div class="knowledge-card__author">
      <img src="/avatars/author.jpg" alt="作者头像" class="avatar avatar--sm">
      <div class="author-info">
        <span class="author-name">张教授</span>
        <span class="author-institution">清华大学</span>
      </div>
    </div>
    
    <div class="knowledge-card__meta">
      <div class="meta-item">
        <svg class="icon icon--eye">...</svg>
        <span>1.2k</span>
      </div>
      <div class="meta-item">
        <svg class="icon icon--heart">...</svg>
        <span>89</span>
      </div>
      <div class="meta-item">
        <svg class="icon icon--star">...</svg>
        <span>4.8</span>
      </div>
    </div>
  </div>
</div>
```

#### 知识卡片样式
```css
.knowledge-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--space-6);
  transition: all 0.2s ease;
  border: 1px solid var(--gray-200);
}

.knowledge-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.knowledge-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.knowledge-card__category {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.category-tag {
  background: var(--primary-100);
  color: var(--primary-700);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
}

.difficulty-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty--beginner {
  background: var(--secondary-100);
  color: var(--secondary-700);
}

.difficulty--intermediate {
  background: var(--warning-100);
  color: var(--warning-700);
}

.difficulty--advanced {
  background: var(--error-100);
  color: var(--error-700);
}

.knowledge-card__title {
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
}

.knowledge-card__title a {
  color: var(--gray-900);
  text-decoration: none;
  transition: color 0.2s ease;
}

.knowledge-card__title a:hover {
  color: var(--primary-600);
}

.knowledge-card__summary {
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-4);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.tag {
  background: var(--gray-100);
  color: var(--gray-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.tag:hover {
  background: var(--primary-100);
  color: var(--primary-700);
  cursor: pointer;
}

.knowledge-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-200);
}

.knowledge-card__author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  color: var(--gray-900);
  font-size: var(--text-sm);
}

.author-institution {
  color: var(--gray-500);
  font-size: var(--text-xs);
}

.knowledge-card__meta {
  display: flex;
  gap: var(--space-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--gray-500);
  font-size: var(--text-sm);
}

.meta-item .icon {
  width: 16px;
  height: 16px;
}
```

### 3.2 搜索组件

#### 智能搜索框
```html
<div class="search-container">
  <div class="search-box">
    <div class="search-input-wrapper">
      <svg class="search-icon icon icon--search">...</svg>
      <input 
        type="text" 
        class="search-input" 
        placeholder="搜索知识、作者、标签..."
        autocomplete="off"
        aria-label="搜索知识库"
      >
      <button class="search-clear" aria-label="清除搜索">
        <svg class="icon icon--x">...</svg>
      </button>
    </div>
    
    <div class="search-filters">
      <button class="filter-toggle" aria-expanded="false">
        <svg class="icon icon--filter">...</svg>
        筛选
      </button>
    </div>
  </div>
  
  <!-- 搜索建议下拉 -->
  <div class="search-suggestions" hidden>
    <div class="suggestions-section">
      <h4 class="suggestions-title">热门搜索</h4>
      <ul class="suggestions-list">
        <li class="suggestion-item">
          <svg class="icon icon--trending">...</svg>
          <span>机器学习</span>
        </li>
        <li class="suggestion-item">
          <svg class="icon icon--trending">...</svg>
          <span>数据结构</span>
        </li>
      </ul>
    </div>
    
    <div class="suggestions-section">
      <h4 class="suggestions-title">搜索历史</h4>
      <ul class="suggestions-list">
        <li class="suggestion-item">
          <svg class="icon icon--clock">...</svg>
          <span>深度学习基础</span>
        </li>
      </ul>
    </div>
  </div>
  
  <!-- 高级筛选面板 -->
  <div class="search-filters-panel" hidden>
    <div class="filter-group">
      <label class="filter-label">分类</label>
      <select class="filter-select">
        <option value="">全部分类</option>
        <option value="cs">计算机科学</option>
        <option value="math">数学</option>
        <option value="physics">物理学</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label class="filter-label">难度</label>
      <div class="filter-checkboxes">
        <label class="checkbox-label">
          <input type="checkbox" value="beginner">
          <span class="checkbox-text">初级</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="intermediate">
          <span class="checkbox-text">中级</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="advanced">
          <span class="checkbox-text">高级</span>
        </label>
      </div>
    </div>
    
    <div class="filter-group">
      <label class="filter-label">发布时间</label>
      <select class="filter-select">
        <option value="">全部时间</option>
        <option value="week">最近一周</option>
        <option value="month">最近一月</option>
        <option value="year">最近一年</option>
      </select>
    </div>
    
    <div class="filter-actions">
      <button class="btn btn--secondary">重置</button>
      <button class="btn btn--primary">应用筛选</button>
    </div>
  </div>
</div>
```

#### 搜索组件样式
```css
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-box {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-12);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  width: 20px;
  height: 20px;
  color: var(--gray-400);
  pointer-events: none;
}

.search-clear {
  position: absolute;
  right: var(--space-4);
  width: 20px;
  height: 20px;
  color: var(--gray-400);
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.search-input:not(:placeholder-shown) + .search-clear {
  opacity: 1;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--gray-700);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-toggle:hover {
  border-color: var(--primary-500);
  color: var(--primary-600);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  margin-top: var(--space-2);
  max-height: 400px;
  overflow-y: auto;
}

.suggestions-section {
  padding: var(--space-4);
}

.suggestions-section:not(:last-child) {
  border-bottom: 1px solid var(--gray-200);
}

.suggestions-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-3);
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background: var(--gray-50);
}

.suggestion-item .icon {
  width: 16px;
  height: 16px;
  color: var(--gray-400);
}

.search-filters-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  margin-top: var(--space-2);
  padding: var(--space-6);
}

.filter-group {
  margin-bottom: var(--space-6);
}

.filter-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}

.filter-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  font-size: var(--text-base);
  background: white;
}

.filter-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-200);
}
```

### 3.3 知识编辑器组件

#### 富文本编辑器
```html
<div class="knowledge-editor">
  <div class="editor-header">
    <div class="editor-title">
      <input 
        type="text" 
        class="title-input" 
        placeholder="输入知识标题..."
        value="深度学习基础：神经网络原理与实现"
      >
    </div>
    
    <div class="editor-actions">
      <button class="btn btn--secondary">保存草稿</button>
      <button class="btn btn--primary">发布</button>
    </div>
  </div>
  
  <div class="editor-toolbar">
    <div class="toolbar-group">
      <button class="toolbar-btn" title="粗体" data-command="bold">
        <svg class="icon icon--bold">...</svg>
      </button>
      <button class="toolbar-btn" title="斜体" data-command="italic">
        <svg class="icon icon--italic">...</svg>
      </button>
      <button class="toolbar-btn" title="下划线" data-command="underline">
        <svg class="icon icon--underline">...</svg>
      </button>
    </div>
    
    <div class="toolbar-separator"></div>
    
    <div class="toolbar-group">
      <button class="toolbar-btn" title="标题" data-command="heading">
        <svg class="icon icon--heading">...</svg>
      </button>
      <button class="toolbar-btn" title="列表" data-command="list">
        <svg class="icon icon--list">...</svg>
      </button>
      <button class="toolbar-btn" title="引用" data-command="quote">
        <svg class="icon icon--quote">...</svg>
      </button>
    </div>
    
    <div class="toolbar-separator"></div>
    
    <div class="toolbar-group">
      <button class="toolbar-btn" title="插入图片" data-command="image">
        <svg class="icon icon--image">...</svg>
      </button>
      <button class="toolbar-btn" title="插入链接" data-command="link">
        <svg class="icon icon--link">...</svg>
      </button>
      <button class="toolbar-btn" title="插入代码" data-command="code">
        <svg class="icon icon--code">...</svg>
      </button>
      <button class="toolbar-btn" title="插入公式" data-command="math">
        <svg class="icon icon--math">...</svg>
      </button>
    </div>
    
    <div class="toolbar-separator"></div>
    
    <div class="toolbar-group">
      <button class="toolbar-btn" title="预览" data-command="preview">
        <svg class="icon icon--eye">...</svg>
      </button>
      <button class="toolbar-btn" title="全屏" data-command="fullscreen">
        <svg class="icon icon--expand">...</svg>
      </button>
    </div>
  </div>
  
  <div class="editor-content">
    <div class="editor-main">
      <textarea 
        class="editor-textarea"
        placeholder="开始编写你的知识内容..."
      ># 深度学习基础：神经网络原理与实现

## 1. 引言

深度学习是机器学习的一个分支，它模仿人脑的神经网络结构来处理数据。本文将详细介绍深度学习的基础概念和实现方法。

## 2. 神经网络基础

### 2.1 感知机

感知机是最简单的神经网络模型，它由以下部分组成：

- **输入层**：接收外部输入的数据
- **权重**：决定输入信号的重要性
- **激活函数**：决定神经元是否被激活

```python
import numpy as np

class Perceptron:
    def __init__(self, input_size, learning_rate=0.01):
        self.weights = np.random.random(input_size)
        self.bias = np.random.random()
        self.learning_rate = learning_rate
    
    def predict(self, inputs):
        summation = np.dot(inputs, self.weights) + self.bias
        return 1 if summation > 0 else 0
```

### 2.2 多层感知机

多层感知机（MLP）是由多个感知机层组成的网络...
      </textarea>
    </div>
    
    <div class="editor-sidebar">
      <div class="sidebar-section">
        <h4 class="sidebar-title">文档大纲</h4>
        <div class="outline-tree">
          <div class="outline-item outline-item--h1">
            <span class="outline-text">深度学习基础：神经网络原理与实现</span>
          </div>
          <div class="outline-item outline-item--h2">
            <span class="outline-text">1. 引言</span>
          </div>
          <div class="outline-item outline-item--h2">
            <span class="outline-text">2. 神经网络基础</span>
          </div>
          <div class="outline-item outline-item--h3">
            <span class="outline-text">2.1 感知机</span>
          </div>
          <div class="outline-item outline-item--h3">
            <span class="outline-text">2.2 多层感知机</span>
          </div>
        </div>
      </div>
      
      <div class="sidebar-section">
        <h4 class="sidebar-title">协作者</h4>
        <div class="collaborators-list">
          <div class="collaborator-item">
            <img src="/avatars/user1.jpg" alt="协作者" class="avatar avatar--sm">
            <div class="collaborator-info">
              <span class="collaborator-name">李博士</span>
              <span class="collaborator-status collaborator-status--online">在线编辑</span>
            </div>
          </div>
          <div class="collaborator-item">
            <img src="/avatars/user2.jpg" alt="协作者" class="avatar avatar--sm">
            <div class="collaborator-info">
              <span class="collaborator-name">王教授</span>
              <span class="collaborator-status collaborator-status--offline">5分钟前</span>
            </div>
          </div>
        </div>
        
        <button class="btn btn--secondary btn--sm add-collaborator">
          <svg class="icon icon--plus">...</svg>
          添加协作者
        </button>
      </div>
    </div>
  </div>
  
  <div class="editor-footer">
    <div class="editor-stats">
      <span class="stat-item">字数: 1,234</span>
      <span class="stat-item">预计阅读: 5分钟</span>
      <span class="stat-item">最后保存: 2分钟前</span>
    </div>
    
    <div class="editor-status">
      <div class="status-indicator status-indicator--saved">
        <svg class="icon icon--check">...</svg>
        已保存
      </div>
    </div>
  </div>
</div>
```

#### 编辑器样式
```css
.knowledge-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.title-input {
  font-size: var(--text-2xl);
  font-weight: 600;
  border: none;
  outline: none;
  background: transparent;
  color: var(--gray-900);
  width: 100%;
  max-width: 600px;
}

.title-input::placeholder {
  color: var(--gray-400);
}

.editor-actions {
  display: flex;
  gap: var(--space-3);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.toolbar-group {
  display: flex;
  gap: var(--space-1);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-base);
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}

.toolbar-btn.active {
  background: var(--primary-100);
  color: var(--primary-600);
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--gray-300);
  margin: 0 var(--space-2);
}

.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-textarea {
  flex: 1;
  padding: var(--space-6);
  border: none;
  outline: none;
  resize: none;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  background: white;
}

.editor-sidebar {
  width: 300px;
  border-left: 1px solid var(--gray-200);
  background: var(--gray-50);
  overflow-y: auto;
}

.sidebar-section {
  padding: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
}

.sidebar-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-3);
}

.outline-tree {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.outline-item {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.outline-item:hover {
  background: var(--gray-200);
}

.outline-item--h1 {
  font-weight: 600;
  color: var(--gray-900);
}

.outline-item--h2 {
  padding-left: var(--space-6);
  color: var(--gray-700);
}

.outline-item--h3 {
  padding-left: var(--space-10);
  color: var(--gray-600);
  font-size: var(--text-sm);
}

.collaborators-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.collaborator-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.collaborator-info {
  display: flex;
  flex-direction: column;
}

.collaborator-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-900);
}

.collaborator-status {
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.collaborator-status--online {
  color: var(--success);
}

.add-collaborator {
  width: 100%;
  justify-content: center;
  gap: var(--space-2);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.editor-stats {
  display: flex;
  gap: var(--space-6);
}

.stat-item {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
}

.status-indicator--saved {
  color: var(--success);
}

.status-indicator--saving {
  color: var(--warning);
}

.status-indicator--error {
  color: var(--error);
}
```

---

## 4. 页面设计

### 4.1 知识库首页

#### 页面布局
```html
<div class="knowledge-home">
  <!-- 页面头部 -->
  <header class="page-header">
    <div class="container">
      <div class="header-content">
        <div class="header-title">
          <h1>知识库</h1>
          <p>探索、学习、分享知识的平台</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn--primary">
            <svg class="icon icon--plus">...</svg>
            创建知识
          </button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-container">
          <!-- 搜索组件 -->
        </div>
      </div>
    </div>
  </header>
  
  <!-- 主要内容 -->
  <main class="main-content">
    <div class="container">
      <div class="content-layout">
        <!-- 侧边栏 -->
        <aside class="sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">分类</h3>
            <nav class="category-nav">
              <a href="#" class="category-link active">
                <svg class="icon icon--folder">...</svg>
                全部分类
                <span class="count">1,234</span>
              </a>
              <a href="#" class="category-link">
                <svg class="icon icon--code">...</svg>
                计算机科学
                <span class="count">456</span>
              </a>
              <a href="#" class="category-link">
                <svg class="icon icon--calculator">...</svg>
                数学
                <span class="count">234</span>
              </a>
              <a href="#" class="category-link">
                <svg class="icon icon--atom">...</svg>
                物理学
                <span class="count">123</span>
              </a>
            </nav>
          </div>
          
          <div class="sidebar-section">
            <h3 class="sidebar-title">热门标签</h3>
            <div class="tag-cloud">
              <a href="#" class="tag-link">机器学习</a>
              <a href="#" class="tag-link">深度学习</a>
              <a href="#" class="tag-link">数据结构</a>
              <a href="#" class="tag-link">算法</a>
              <a href="#" class="tag-link">Python</a>
              <a href="#" class="tag-link">JavaScript</a>
            </div>
          </div>
        </aside>
        
        <!-- 内容区域 -->
        <div class="content-area">
          <!-- 筛选和排序 -->
          <div class="content-controls">
            <div class="view-controls">
              <button class="view-btn view-btn--active" data-view="grid">
                <svg class="icon icon--grid">...</svg>
              </button>
              <button class="view-btn" data-view="list">
                <svg class="icon icon--list">...</svg>
              </button>
            </div>
            
            <div class="sort-controls">
              <select class="sort-select">
                <option value="relevance">相关性</option>
                <option value="newest">最新发布</option>
                <option value="popular">最受欢迎</option>
                <option value="rating">评分最高</option>
              </select>
            </div>
          </div>
          
          <!-- 知识列表 -->
          <div class="knowledge-grid">
            <!-- 知识卡片组件 -->
            <div class="knowledge-card">...</div>
            <div class="knowledge-card">...</div>
            <div class="knowledge-card">...</div>
            <!-- 更多卡片... -->
          </div>
          
          <!-- 分页 -->
          <div class="pagination">
            <button class="pagination-btn pagination-btn--prev" disabled>
              <svg class="icon icon--chevron-left">...</svg>
              上一页
            </button>
            
            <div class="pagination-numbers">
              <button class="pagination-number pagination-number--active">1</button>
              <button class="pagination-number">2</button>
              <button class="pagination-number">3</button>
              <span class="pagination-ellipsis">...</span>
              <button class="pagination-number">10</button>
            </div>
            
            <button class="pagination-btn pagination-btn--next">
              下一页
              <svg class="icon icon--chevron-right">...</svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
```

#### 首页样式
```css
.knowledge-home {
  min-height: 100vh;
  background: var(--gray-50);
}

.page-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-8) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
}

.header-title h1 {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.header-title p {
  font-size: var(--text-lg);
  color: var(--gray-600);
}

.search-section {
  display: flex;
  justify-content: center;
}

.main-content {
  padding: var(--space-8) 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-8);
}

.sidebar {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  height: fit-content;
  box-shadow: var(--shadow-sm);
}

.sidebar-section {
  margin-bottom: var(--space-8);
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-4);
}

.category-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.category-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-base);
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s ease;
}

.category-link:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.category-link.active {
  background: var(--primary-100);
  color: var(--primary-700);
}

.category-link .icon {
  width: 20px;
  height: 20px;
}

.category-link .count {
  margin-left: auto;
  font-size: var(--text-sm);
  color: var(--gray-500);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-link {
  padding: var(--space-1) var(--space-3);
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: all 0.2s ease;
}

.tag-link:hover {
  background: var(--primary-100);
  color: var(--primary-700);
}

.content-area {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.content-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
}

.view-controls {
  display: flex;
  gap: var(--space-1);
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  background: white;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover {
  border-color: var(--primary-500);
  color: var(--primary-600);
}

.view-btn--active {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.sort-select {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  background: white;
  font-size: var(--text-base);
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  background: white;
  color: var(--gray-700);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-500);
  color: var(--primary-600);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: var(--space-1);
}

.pagination-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  background: white;
  color: var(--gray-700);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  border-color: var(--primary-500);
  color: var(--primary-600);
}

.pagination-number--active {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--gray-500);
}
```

### 4.2 知识详情页

#### 页面结构
```html
<div class="knowledge-detail">
  <!-- 知识头部 -->
  <header class="knowledge-header">
    <div class="container">
      <div class="breadcrumb">
        <a href="/">首页</a>
        <svg class="icon icon--chevron-right">...</svg>
        <a href="/category/cs">计算机科学</a>
        <svg class="icon icon--chevron-right">...</svg>
        <span>深度学习基础</span>
      </div>
      
      <div class="knowledge-meta">
        <div class="meta-main">
          <h1 class="knowledge-title">深度学习基础：神经网络原理与实现</h1>
          
          <div class="knowledge-info">
            <div class="author-info">
              <img src="/avatars/author.jpg" alt="作者" class="avatar">
              <div class="author-details">
                <h3 class="author-name">张教授</h3>
                <p class="author-title">清华大学 计算机系</p>
              </div>
            </div>
            
            <div class="knowledge-stats">
              <div class="stat-item">
                <svg class="icon icon--calendar">...</svg>
                <span>2024年1月15日</span>
              </div>
              <div class="stat-item">
                <svg class="icon icon--clock">...</svg>
                <span>预计15分钟</span>
              </div>
              <div class="stat-item">
                <svg class="icon icon--eye">...</svg>
                <span>1,234次浏览</span>
              </div>
              <div class="stat-item">
                <svg class="icon icon--star">...</svg>
                <span>4.8分</span>
              </div>
            </div>
          </div>
          
          <div class="knowledge-tags">
            <span class="tag">深度学习</span>
            <span class="tag">神经网络</span>
            <span class="tag">机器学习</span>
            <span class="tag">Python</span>
          </div>
        </div>
        
        <div class="meta-actions">
          <button class="btn btn--secondary">
            <svg class="icon icon--bookmark">...</svg>
            收藏
          </button>
          <button class="btn btn--secondary">
            <svg class="icon icon--share">...</svg>
            分享
          </button>
          <button class="btn btn--primary">
            <svg class="icon icon--edit">...</svg>
            编辑
          </button>
        </div>
      </div>
    </div>
  </header>
  
  <!-- 主要内容 -->
  <main class="knowledge-main">
    <div class="container">
      <div class="content-layout">
        <!-- 文章内容 -->
        <article class="knowledge-content">
          <div class="content-summary">
            <h2>内容摘要</h2>
            <p>本文详细介绍了深度学习的基础概念，包括神经网络的基本原理、反向传播算法以及常见的网络架构。通过理论讲解和代码实现，帮助读者建立对深度学习的全面理解。</p>
          </div>
          
          <div class="content-body">
            <!-- 渲染的Markdown内容 -->
            <h2 id="introduction">1. 引言</h2>
            <p>深度学习是机器学习的一个分支，它模仿人脑的神经网络结构来处理数据。本文将详细介绍深度学习的基础概念和实现方法。</p>
            
            <h2 id="neural-networks">2. 神经网络基础</h2>
            
            <h3 id="perceptron">2.1 感知机</h3>
            <p>感知机是最简单的神经网络模型，它由以下部分组成：</p>
            
            <ul>
              <li><strong>输入层</strong>：接收外部输入的数据</li>
              <li><strong>权重</strong>：决定输入信号的重要性</li>
              <li><strong>激活函数</strong>：决定神经元是否被激活</li>
            </ul>
            
            <div class="code-block">
              <div class="code-header">
                <span class="code-language">Python</span>
                <button class="code-copy" title="复制代码">
                  <svg class="icon icon--copy">...</svg>
                </button>
              </div>
              <pre><code class="language-python">import numpy as np

class Perceptron:
    def __init__(self, input_size, learning_rate=0.01):
        self.weights = np.random.random(input_size)
        self.bias = np.random.random()
        self.learning_rate = learning_rate
    
    def predict(self, inputs):
        summation = np.dot(inputs, self.weights) + self.bias
        return 1 if summation > 0 else 0</code></pre>
            </div>
            
            <h3 id="mlp">2.2 多层感知机</h3>
            <p>多层感知机（MLP）是由多个感知机层组成的网络，能够解决更复杂的问题。</p>
            
            <div class="math-block">
              <div class="math-header">
                <span class="math-title">激活函数</span>
              </div>
              <div class="math-content">
                $$f(x) = \frac{1}{1 + e^{-x}}$$
              </div>
            </div>
            
            <!-- 更多内容... -->
          </div>
          
          <!-- 相关推荐 -->
          <div class="related-content">
            <h2>相关推荐</h2>
            <div class="related-grid">
              <div class="related-item">
                <img src="/thumbnails/ml-basics.jpg" alt="机器学习基础" class="related-thumbnail">
                <div class="related-info">
                  <h4 class="related-title">机器学习基础概念</h4>
                  <p class="related-author">李博士</p>
                </div>
              </div>
              <div class="related-item">
                <img src="/thumbnails/python-ml.jpg" alt="Python机器学习" class="related-thumbnail">
                <div class="related-info">
                  <h4 class="related-title">Python机器学习实战</h4>
                  <p class="related-author">王教授</p>
                </div>
              </div>
            </div>
          </div>
        </article>
        
        <!-- 侧边栏 -->
        <aside class="content-sidebar">
          <!-- 目录导航 -->
          <div class="toc-container">
            <h3 class="toc-title">目录</h3>
            <nav class="toc-nav">
              <a href="#introduction" class="toc-link toc-link--h2">1. 引言</a>
              <a href="#neural-networks" class="toc-link toc-link--h2 toc-link--active">2. 神经网络基础</a>
              <a href="#perceptron" class="toc-link toc-link--h3">2.1 感知机</a>
              <a href="#mlp" class="toc-link toc-link--h3">2.2 多层感知机</a>
            </nav>
          </div>
          
          <!-- 知识评价 -->
          <div class="rating-container">
            <h3 class="rating-title">为这篇知识评分</h3>
            <div class="rating-stars">
              <button class="star-btn star-btn--active" data-rating="1">
                <svg class="icon icon--star">...</svg>
              </button>
              <button class="star-btn star-btn--active" data-rating="2">
                <svg class="icon icon--star">...</svg>
              </button>
              <button class="star-btn star-btn--active" data-rating="3">
                <svg class="icon icon--star">...</svg>
              </button>
              <button class="star-btn star-btn--active" data-rating="4">
                <svg class="icon icon--star">...</svg>
              </button>
              <button class="star-btn" data-rating="5">
                <svg class="icon icon--star">...</svg>
              </button>
            </div>
            <p class="rating-text">当前评分：4.8分 (123人评价)</p>
          </div>
          
          <!-- 学习进度 -->
          <div class="progress-container">
            <h3 class="progress-title">学习进度</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 65%"></div>
            </div>
            <p class="progress-text">已完成 65%</p>
            <button class="btn btn--primary btn--sm">标记为已完成</button>
          </div>
        </aside>
      </div>
    </div>
  </main>
  
  <!-- 评论区 -->
  <section class="comments-section">
    <div class="container">
      <div class="comments-header">
        <h2>讨论区 (23)</h2>
        <button class="btn btn--primary">发表评论</button>
      </div>
      
      <div class="comment-form">
        <div class="form-group">
          <textarea 
            class="comment-textarea" 
            placeholder="分享你的想法和见解..."
            rows="4"
          ></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn--secondary">取消</button>
          <button class="btn btn--primary">发布评论</button>
        </div>
      </div>
      
      <div class="comments-list">
        <div class="comment-item">
          <div class="comment-avatar">
            <img src="/avatars/user1.jpg" alt="用户头像" class="avatar">
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <h4 class="comment-author">学习者小明</h4>
              <span class="comment-time">2小时前</span>
            </div>
            <div class="comment-body">
              <p>这篇文章写得非常详细，特别是代码示例部分，帮助我更好地理解了神经网络的工作原理。有一个小问题：在反向传播算法的实现中，梯度计算是否可以进一步优化？</p>
            </div>
            <div class="comment-actions">
              <button class="comment-action">
                <svg class="icon icon--heart">...</svg>
                <span>12</span>
              </button>
              <button class="comment-action">
                <svg class="icon icon--message">...</svg>
                <span>回复</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 更多评论... -->
      </div>
    </div>
  </section>
</div>
```

#### 详情页样式
```css
.knowledge-detail {
  min-height: 100vh;
  background: var(--gray-50);
}

.knowledge-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-6) 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
}

.breadcrumb a {
  color: var(--primary-600);
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb .icon {
  width: 16px;
  height: 16px;
  color: var(--gray-400);
}

.knowledge-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-8);
}

.knowledge-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--gray-900);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-6);
}

.knowledge-info {
  display: flex;
  gap: var(--space-8);
  margin-bottom: var(--space-4);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.author-details h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.author-details p {
  color: var(--gray-600);
  font-size: var(--text-sm);
}

.knowledge-stats {
  display: flex;
  gap: var(--space-6);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--gray-600);
  font-size: var(--text-sm);
}

.stat-item .icon {
  width: 16px;
  height: 16px;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.meta-actions {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

.knowledge-main {
  padding: var(--space-8) 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-8);
}

.knowledge-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.content-summary {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.content-summary h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--primary-800);
  margin-bottom: var(--space-3);
}

.content-summary p {
  color: var(--primary-700);
  line-height: var(--leading-relaxed);
}

.content-body {
  line-height: var(--leading-relaxed);
  color: var(--gray-800);
}

.content-body h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: var(--space-8) 0 var(--space-4) 0;
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--gray-200);
}

.content-body h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: var(--space-6) 0 var(--space-3) 0;
}

.content-body p {
  margin-bottom: var(--space-4);
}

.content-body ul, .content-body ol {
  margin-bottom: var(--space-4);
  padding-left: var(--space-6);
}

.content-body li {
  margin-bottom: var(--space-2);
}

.code-block {
  margin: var(--space-6) 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--gray-100);
  border-bottom: 1px solid var(--gray-200);
}

.code-language {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.code-copy {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-copy:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}

.code-block pre {
  padding: var(--space-4);
  background: var(--gray-900);
  color: var(--gray-100);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.math-block {
  margin: var(--space-6) 0;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.math-header {
  padding: var(--space-3) var(--space-4);
  background: var(--secondary-50);
  border-bottom: 1px solid var(--secondary-200);
}

.math-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--secondary-700);
}

.math-content {
  padding: var(--space-6);
  background: white;
  text-align: center;
  font-size: var(--text-lg);
}

.related-content {
  margin-top: var(--space-12);
  padding-top: var(--space-8);
  border-top: 1px solid var(--gray-200);
}

.related-content h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-6);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.related-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.related-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.related-thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-base);
}

.related-info {
  flex: 1;
}

.related-title {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
}

.related-author {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.content-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.toc-container,
.rating-container,
.progress-container {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.toc-title,
.rating-title,
.progress-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-4);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.toc-link {
  display: block;
  padding: var(--space-2) var(--space-3);
  color: var(--gray-600);
  text-decoration: none;
  border-radius: var(--radius-base);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.toc-link:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.toc-link--active {
  background: var(--primary-100);
  color: var(--primary-700);
  font-weight: 500;
}

.toc-link--h3 {
  padding-left: var(--space-6);
  font-size: var(--text-xs);
}

.rating-stars {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.star-btn {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--gray-300);
  cursor: pointer;
  transition: color 0.2s ease;
}

.star-btn:hover,
.star-btn--active {
  color: var(--warning);
}

.rating-text {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.progress-fill {
  height: 100%;
  background: var(--primary-500);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-4);
}

.comments-section {
  background: white;
  padding: var(--space-8) 0;
  border-top: 1px solid var(--gray-200);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.comments-header h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
}

.comment-form {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.comment-textarea {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  resize: vertical;
  min-height: 100px;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.comment-item {
  display: flex;
  gap: var(--space-4);
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.comment-author {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--gray-900);
}

.comment-time {
  font-size: var(--text-sm);
  color: var(--gray-500);
}

.comment-body {
  margin-bottom: var(--space-4);
}

.comment-body p {
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
}

.comment-actions {
  display: flex;
  gap: var(--space-4);
}

.comment-action {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: none;
  border: none;
  color: var(--gray-500);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: color 0.2s ease;
}

.comment-action:hover {
  color: var(--primary-600);
}

.comment-action .icon {
  width: 16px;
  height: 16px;
}
```

---

## 5. 交互设计

### 5.1 搜索交互

#### 智能搜索体验
```javascript
// 搜索交互逻辑
class SearchInteraction {
  constructor() {
    this.searchInput = document.querySelector('.search-input');
    this.suggestionsPanel = document.querySelector('.search-suggestions');
    this.filtersPanel = document.querySelector('.search-filters-panel');
    this.debounceTimer = null;
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    // 搜索输入事件
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });
    
    // 搜索框焦点事件
    this.searchInput.addEventListener('focus', () => {
      this.showSuggestions();
    });
    
    // 点击外部关闭建议
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSuggestions();
      }
    });
    
    // 键盘导航
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }
  
  handleSearchInput(query) {
    // 防抖处理
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        this.fetchSuggestions(query);
      } else {
        this.showDefaultSuggestions();
      }
    }, 300);
  }
  
  async fetchSuggestions(query) {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const suggestions = await response.json();
      this.renderSuggestions(suggestions);
    } catch (error) {
      console.error('获取搜索建议失败:', error);
    }
  }
  
  showSuggestions() {
    this.suggestionsPanel.hidden = false;
    this.suggestionsPanel.style.animation = 'fadeInUp 0.2s ease';
  }
  
  hideSuggestions() {
    this.suggestionsPanel.style.animation = 'fadeOutDown 0.2s ease';
    setTimeout(() => {
      this.suggestionsPanel.hidden = true;
    }, 200);
  }
}
```

### 5.2 编辑器交互

#### 实时协作
```javascript
// 协作编辑交互
class CollaborativeEditor {
  constructor() {
    this.editor = document.querySelector('.editor-textarea');
    this.collaborators = new Map();
    this.socket = null;
    this.lastSaveTime = Date.now();
    
    this.initWebSocket();
    this.initAutoSave();
    this.initCollaborationUI();
  }
  
  initWebSocket() {
    this.socket = new WebSocket(`ws://localhost:3000/collaborate/${documentId}`);
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleCollaborationEvent(data);
    };
  }
  
  handleCollaborationEvent(data) {
    switch (data.type) {
      case 'user_joined':
        this.addCollaborator(data.user);
        break;
      case 'user_left':
        this.removeCollaborator(data.userId);
        break;
      case 'cursor_position':
        this.updateCursorPosition(data.userId, data.position);
        break;
      case 'text_change':
        this.applyTextChange(data.change);
        break;
    }
  }
  
  addCollaborator(user) {
    this.collaborators.set(user.id, user);
    this.renderCollaboratorsList();
    this.showNotification(`${user.name} 加入了协作`);
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'collaboration-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}
```

### 5.3 加载状态

#### 骨架屏组件
```html
<!-- 知识卡片骨架屏 -->
<div class="knowledge-card-skeleton">
  <div class="skeleton-header">
    <div class="skeleton-category"></div>
    <div class="skeleton-actions"></div>
  </div>
  
  <div class="skeleton-content">
    <div class="skeleton-title"></div>
    <div class="skeleton-summary">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line skeleton-line--short"></div>
    </div>
    
    <div class="skeleton-tags">
      <div class="skeleton-tag"></div>
      <div class="skeleton-tag"></div>
      <div class="skeleton-tag"></div>
    </div>
  </div>
  
  <div class="skeleton-footer">
    <div class="skeleton-author">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-author-info">
        <div class="skeleton-name"></div>
        <div class="skeleton-institution"></div>
      </div>
    </div>
    
    <div class="skeleton-meta">
      <div class="skeleton-meta-item"></div>
      <div class="skeleton-meta-item"></div>
      <div class="skeleton-meta-item"></div>
    </div>
  </div>
</div>
```

#### 骨架屏样式
```css
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-base {
  background: linear-gradient(90deg, 
    var(--gray-200) 25%, 
    var(--gray-100) 50%, 
    var(--gray-200) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-base);
}

.knowledge-card-skeleton {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-base);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.skeleton-category {
  @extend .skeleton-base;
  width: 120px;
  height: 24px;
}

.skeleton-actions {
  @extend .skeleton-base;
  width: 60px;
  height: 24px;
}

.skeleton-title {
  @extend .skeleton-base;
  width: 80%;
  height: 28px;
  margin-bottom: var(--space-3);
}

.skeleton-summary {
  margin-bottom: var(--space-4);
}

.skeleton-line {
  @extend .skeleton-base;
  width: 100%;
  height: 16px;
  margin-bottom: var(--space-2);
}

.skeleton-line--short {
  width: 60%;
}

.skeleton-tags {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.skeleton-tag {
  @extend .skeleton-base;
  width: 60px;
  height: 20px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-200);
}

.skeleton-author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.skeleton-avatar {
  @extend .skeleton-base;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}

.skeleton-author-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.skeleton-name {
  @extend .skeleton-base;
  width: 80px;
  height: 14px;
}

.skeleton-institution {
  @extend .skeleton-base;
  width: 100px;
  height: 12px;
}

.skeleton-meta {
  display: flex;
  gap: var(--space-4);
}

.skeleton-meta-item {
  @extend .skeleton-base;
  width: 40px;
  height: 16px;
}
```

---

## 6. 响应式设计

### 6.1 断点系统

```css
:root {
  /* 响应式断点 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 移动端优先的媒体查询 */
@media (min-width: 640px) {
  /* 小屏幕平板 */
}

@media (min-width: 768px) {
  /* 平板 */
}

@media (min-width: 1024px) {
  /* 桌面端 */
}

@media (min-width: 1280px) {
  /* 大屏桌面端 */
}
```

### 6.2 移动端适配

#### 移动端知识卡片
```css
@media (max-width: 767px) {
  .knowledge-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .knowledge-card {
    padding: var(--space-4);
  }
  
  .knowledge-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .knowledge-card__title {
    font-size: var(--text-lg);
  }
  
  .knowledge-card__footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .knowledge-card__meta {
    align-self: stretch;
    justify-content: space-between;
  }
}
```

#### 移动端搜索
```css
@media (max-width: 767px) {
  .search-box {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .search-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .search-filters-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 100;
    padding: var(--space-6);
    overflow-y: auto;
  }
  
  .filter-actions {
    position: sticky;
    bottom: 0;
    background: white;
    padding-top: var(--space-4);
    border-top: 1px solid var(--gray-200);
  }
}
```

#### 移动端编辑器
```css
@media (max-width: 767px) {
  .knowledge-editor {
    height: 100vh;
  }
  
  .editor-header {
    padding: var(--space-4);
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .editor-actions {
    justify-content: stretch;
  }
  
  .editor-actions .btn {
    flex: 1;
  }
  
  .editor-toolbar {
    padding: var(--space-3) var(--space-4);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .editor-toolbar::-webkit-scrollbar {
    display: none;
  }
  
  .editor-content {
    flex-direction: column;
  }
  
  .editor-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--gray-200);
    max-height: 300px;
  }
  
  .editor-textarea {
    padding: var(--space-4);
    font-size: 16px; /* 防止iOS缩放 */
  }
}
```

---

## 7. 无障碍设计

### 7.1 键盘导航

```css
/* 焦点样式 */
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-600);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* 键盘导航增强 */
.knowledge-card:focus-within {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 7.2 屏幕阅读器支持

```html
<!-- ARIA 标签示例 -->
<div class="knowledge-card" role="article" aria-labelledby="knowledge-title-123">
  <h3 id="knowledge-title-123" class="knowledge-card__title">
    <a href="/knowledge/123" aria-describedby="knowledge-summary-123">
      深度学习基础：神经网络原理与实现
    </a>
  </h3>
  
  <p id="knowledge-summary-123" class="knowledge-card__summary">
    本文详细介绍了深度学习的基础概念...
  </p>
  
  <div class="knowledge-card__meta" aria-label="知识元信息">
    <div class="meta-item" aria-label="浏览次数">
      <svg class="icon icon--eye" aria-hidden="true">...</svg>
      <span>1.2k</span>
    </div>
    <div class="meta-item" aria-label="评分">
      <svg class="icon icon--star" aria-hidden="true">...</svg>
      <span>4.8分</span>
    </div>
  </div>
</div>

<!-- 搜索表单 -->
<form role="search" aria-label="搜索知识库">
  <label for="search-input" class="sr-only">搜索知识、作者、标签</label>
  <input 
    id="search-input"
    type="search" 
    class="search-input"
    placeholder="搜索知识、作者、标签..."
    aria-describedby="search-help"
    autocomplete="off"
  >
  <div id="search-help" class="sr-only">
    输入关键词搜索知识库内容，支持按分类和标签筛选
  </div>
</form>
```

### 7.3 颜色对比度

```css
/* 确保足够的颜色对比度 */
:root {
  /* 文本颜色对比度 >= 4.5:1 */
  --text-primary: #111827;    /* 对比度: 16.8:1 */
  --text-secondary: #374151;  /* 对比度: 9.6:1 */
  --text-tertiary: #6b7280;   /* 对比度: 4.7:1 */
  
  /* 链接颜色对比度 >= 3:1 */
  --link-color: #1d4ed8;      /* 对比度: 8.2:1 */
  --link-hover: #1e40af;      /* 对比度: 9.1:1 */
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :root {
    --primary-500: #1e40af;
    --gray-600: #374151;
    --gray-500: #4b5563;
  }
  
  .knowledge-card {
    border: 2px solid var(--gray-300);
  }
  
  .btn {
    border: 2px solid currentColor;
  }
}
```

---

## 8. 性能优化

### 8.1 CSS 优化

```css
/* 使用 CSS 自定义属性减少重复 */
.btn {
  --btn-padding-x: var(--space-4);
  --btn-padding-y: var(--space-2);
  --btn-border-radius: var(--radius-base);
  --btn-font-weight: 500;
  --btn-transition: all 0.2s ease;
  
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-border-radius);
  font-weight: var(--btn-font-weight);
  transition: var(--btn-transition);
}

/* 优化动画性能 */
.knowledge-card {
  will-change: transform;
  transform: translateZ(0); /* 启用硬件加速 */
}

.knowledge-card:hover {
  transform: translateY(-2px) translateZ(0);
}

/* 使用 contain 属性优化布局 */
.knowledge-grid {
  contain: layout style;
}

.knowledge-card {
  contain: layout style paint;
}
```

### 8.2 图片优化

```html
<!-- 响应式图片 -->
<picture class="knowledge-thumbnail">
  <source 
    media="(min-width: 768px)" 
    srcset="/images/knowledge-large.webp 1x, /images/knowledge-large@2x.webp 2x"
    type="image/webp"
  >
  <source 
    media="(min-width: 768px)" 
    srcset="/images/knowledge-large.jpg 1x, /images/knowledge-large@2x.jpg 2x"
    type="image/jpeg"
  >
  <source 
    srcset="/images/knowledge-small.webp 1x, /images/knowledge-small@2x.webp 2x"
    type="image/webp"
  >
  <img 
    src="/images/knowledge-small.jpg" 
    srcset="/images/knowledge-small.jpg 1x, /images/knowledge-small@2x.jpg 2x"
    alt="知识缩略图"
    loading="lazy"
    decoding="async"
  >
</picture>

<!-- 头像懒加载 -->
<img 
  class="avatar" 
  data-src="/avatars/user.jpg" 
  alt="用户头像"
  loading="lazy"
  onerror="this.src='/images/default-avatar.svg'"
>
```

---

## 9. 设计规范

### 9.1 组件命名规范

```css
/* BEM 命名规范 */
.knowledge-card { /* 块 */ }
.knowledge-card__header { /* 元素 */ }
.knowledge-card__title { /* 元素 */ }
.knowledge-card--featured { /* 修饰符 */ }
.knowledge-card--large { /* 修饰符 */ }

/* 状态类命名 */
.is-active { /* 激活状态 */ }
.is-loading { /* 加载状态 */ }
.is-disabled { /* 禁用状态 */ }
.is-hidden { /* 隐藏状态 */ }

/* 工具类命名 */
.u-text-center { /* 文本居中 */ }
.u-margin-bottom-4 { /* 底部边距 */ }
.u-visually-hidden { /* 视觉隐藏 */ }
```

### 9.2 设计令牌

```css
/* 设计令牌系统 */
:root {
  /* 间距令牌 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* 字体令牌 */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* 颜色令牌 */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  /* 阴影令牌 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* 动画令牌 */
  --duration-fast: 0.15s;
  --duration-normal: 0.2s;
  --duration-slow: 0.3s;
  
  --easing-ease: ease;
  --easing-ease-in: ease-in;
  --easing-ease-out: ease-out;
}
```

---

## 10. 总结

本 UI/UX 设计文档为知识库管理功能提供了全面的设计指导，包括：

### 设计亮点
- **一致的视觉语言**：建立了完整的设计系统和组件库
- **优秀的搜索体验**：智能搜索、实时建议、多维筛选
- **协作友好**：实时协作编辑、版本管理、评论讨论
- **响应式设计**：适配各种设备和屏幕尺寸
- **无障碍支持**：键盘导航、屏幕阅读器、高对比度

### 技术特性
- **性能优化**：懒加载、骨架屏、硬件加速
- **渐进增强**：基础功能优先，逐步增强体验
- **模块化架构**：组件化设计，易于维护和扩展
- **标准化规范**：BEM 命名、设计令牌、代码规范

### 用户体验
- **直观的信息架构**：清晰的导航和内容层次
- **高效的交互流程**：简化的操作步骤和反馈机制
- **个性化体验**：智能推荐、学习进度、偏好设置
- **社交化学习**：协作编辑、评论讨论、知识分享

这套设计系统为知识库管理功能提供了坚实的基础，确保用户能够高效地创建、管理、搜索和分享知识内容。