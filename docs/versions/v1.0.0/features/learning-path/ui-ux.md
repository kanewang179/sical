# 学习路径功能 UI/UX 设计

## 1. 设计概览

### 1.1 设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                    设计原则体系                              │
├─────────────────────────────────────────────────────────────┤
│  🎯 目标导向                                                │
│  ├─ 清晰的学习目标展示                                       │
│  ├─ 明确的进度指示                                           │
│  └─ 直观的成就反馈                                           │
├─────────────────────────────────────────────────────────────┤
│  🧭 路径可视化                                              │
│  ├─ 学习路径图形化展示                                       │
│  ├─ 知识点关联可视化                                         │
│  └─ 进度状态直观呈现                                         │
├─────────────────────────────────────────────────────────────┤
│  🤝 社交学习                                                │
│  ├─ 学习小组协作界面                                         │
│  ├─ 进度分享功能                                             │
│  └─ 互助学习机制                                             │
├─────────────────────────────────────────────────────────────┤
│  🎨 个性化体验                                              │
│  ├─ 自适应学习界面                                           │
│  ├─ 个人偏好设置                                             │
│  └─ 智能推荐展示                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 用户体验目标

- **学习动机激发**：通过游戏化元素和成就系统激发学习兴趣
- **认知负荷优化**：简化复杂信息的展示，降低学习门槛
- **社交互动促进**：营造协作学习氛围，增强学习粘性
- **个性化适配**：根据用户特征提供定制化学习体验

### 1.3 目标用户

- **自主学习者**：需要结构化学习路径的个人用户
- **企业培训师**：为员工制定学习计划的培训管理者
- **教育机构**：提供在线课程的教育工作者
- **学习小组**：协作学习的团队成员

## 2. 视觉设计系统

### 2.1 色彩系统

```css
:root {
  /* 主色调 - 学习路径 */
  --primary-blue: #2563eb;
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1d4ed8;
  
  /* 辅助色 - 进度状态 */
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --error-red: #ef4444;
  --info-cyan: #06b6d4;
  
  /* 学习状态色彩 */
  --not-started: #e5e7eb;
  --in-progress: #fbbf24;
  --completed: #10b981;
  --locked: #9ca3af;
  
  /* 背景色系 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-dark: #0f172a;
  
  /* 文字色系 */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --text-inverse: #ffffff;
}
```

### 2.2 字体系统

```css
/* 字体族 */
.font-primary {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* 字体大小 */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }

/* 字重 */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### 2.3 间距系统

```css
/* 间距变量 */
:root {
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
/* 圆角 */
:root {
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}

/* 阴影 */
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## 3. 组件设计

### 3.1 学习路径卡片

```html
<div class="learning-path-card">
  <div class="card-header">
    <div class="path-thumbnail">
      <img src="/api/placeholder/300/200" alt="学习路径缩略图" />
      <div class="difficulty-badge">初级</div>
    </div>
    <div class="path-stats">
      <span class="stat-item">
        <i class="icon-users"></i>
        <span>1.2k 学习者</span>
      </span>
      <span class="stat-item">
        <i class="icon-clock"></i>
        <span>约 40 小时</span>
      </span>
    </div>
  </div>
  
  <div class="card-content">
    <h3 class="path-title">Python 数据科学入门</h3>
    <p class="path-description">
      从零开始学习 Python 数据科学，掌握 NumPy、Pandas、Matplotlib 等核心库的使用。
    </p>
    
    <div class="path-tags">
      <span class="tag">Python</span>
      <span class="tag">数据科学</span>
      <span class="tag">机器学习</span>
    </div>
    
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" style="width: 65%"></div>
      </div>
      <span class="progress-text">13/20 完成</span>
    </div>
  </div>
  
  <div class="card-actions">
    <button class="btn-secondary">查看详情</button>
    <button class="btn-primary">继续学习</button>
  </div>
</div>
```

```css
.learning-path-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.learning-path-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.card-header {
  position: relative;
}

.path-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.path-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.learning-path-card:hover .path-thumbnail img {
  transform: scale(1.05);
}

.difficulty-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary-blue);
  color: var(--text-inverse);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.path-stats {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
}

.card-content {
  padding: 20px;
}

.path-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.path-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.path-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-green), var(--primary-blue));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.card-actions {
  padding: 16px 20px;
  background: var(--bg-secondary);
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--text-inverse);
  flex: 1;
}

.btn-primary:hover {
  background: var(--primary-blue-dark);
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
```

### 3.2 学习路径图谱

```html
<div class="learning-path-map">
  <div class="map-header">
    <h2>Python 数据科学学习路径</h2>
    <div class="map-controls">
      <button class="control-btn" data-action="zoom-in">
        <i class="icon-zoom-in"></i>
      </button>
      <button class="control-btn" data-action="zoom-out">
        <i class="icon-zoom-out"></i>
      </button>
      <button class="control-btn" data-action="reset">
        <i class="icon-refresh"></i>
      </button>
    </div>
  </div>
  
  <div class="map-container">
    <svg class="path-svg" viewBox="0 0 1200 800">
      <!-- 连接线 -->
      <g class="connections">
        <path class="connection" d="M 150 100 Q 200 150 250 100" stroke="#e2e8f0" stroke-width="2" fill="none"></path>
        <path class="connection completed" d="M 350 100 Q 400 150 450 100" stroke="#10b981" stroke-width="3" fill="none"></path>
      </g>
      
      <!-- 学习节点 -->
      <g class="nodes">
        <!-- 已完成节点 -->
        <g class="node completed" transform="translate(100, 80)">
          <circle r="25" fill="#10b981" stroke="#ffffff" stroke-width="3"></circle>
          <text x="0" y="5" text-anchor="middle" fill="white" font-size="12" font-weight="bold">✓</text>
          <text x="0" y="45" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="500">Python 基础</text>
        </g>
        
        <!-- 进行中节点 -->
        <g class="node in-progress" transform="translate(300, 80)">
          <circle r="25" fill="#fbbf24" stroke="#ffffff" stroke-width="3"></circle>
          <circle r="15" fill="none" stroke="white" stroke-width="2" stroke-dasharray="5,5">
            <animateTransform attributeName="transform" type="rotate" values="0;360" dur="2s" repeatCount="indefinite"></animateTransform>
          </circle>
          <text x="0" y="45" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="500">NumPy 数组</text>
        </g>
        
        <!-- 未开始节点 -->
        <g class="node not-started" transform="translate(500, 80)">
          <circle r="25" fill="#e5e7eb" stroke="#ffffff" stroke-width="3"></circle>
          <text x="0" y="5" text-anchor="middle" fill="#64748b" font-size="20">○</text>
          <text x="0" y="45" text-anchor="middle" fill="#64748b" font-size="14" font-weight="500">Pandas 操作</text>
        </g>
        
        <!-- 锁定节点 -->
        <g class="node locked" transform="translate(700, 80)">
          <circle r="25" fill="#9ca3af" stroke="#ffffff" stroke-width="3"></circle>
          <text x="0" y="5" text-anchor="middle" fill="white" font-size="12">🔒</text>
          <text x="0" y="45" text-anchor="middle" fill="#9ca3af" font-size="14" font-weight="500">机器学习</text>
        </g>
      </g>
    </svg>
    
    <!-- 节点详情弹窗 -->
    <div class="node-tooltip" style="display: none;">
      <div class="tooltip-header">
        <h4>NumPy 数组操作</h4>
        <span class="status-badge in-progress">进行中</span>
      </div>
      <div class="tooltip-content">
        <p>学习 NumPy 数组的创建、索引、切片和基本操作。</p>
        <div class="tooltip-stats">
          <span>预计时间: 4小时</span>
          <span>完成度: 60%</span>
        </div>
      </div>
      <div class="tooltip-actions">
        <button class="btn-sm btn-primary">继续学习</button>
      </div>
    </div>
  </div>
  
  <!-- 图例 -->
  <div class="map-legend">
    <div class="legend-item">
      <div class="legend-icon completed"></div>
      <span>已完成</span>
    </div>
    <div class="legend-item">
      <div class="legend-icon in-progress"></div>
      <span>进行中</span>
    </div>
    <div class="legend-item">
      <div class="legend-icon not-started"></div>
      <span>未开始</span>
    </div>
    <div class="legend-item">
      <div class="legend-icon locked"></div>
      <span>已锁定</span>
    </div>
  </div>
</div>
```

```css
.learning-path-map {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid #e2e8f0;
}

.map-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.map-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-blue);
}

.map-container {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.path-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.path-svg:active {
  cursor: grabbing;
}

.connection {
  transition: stroke 0.3s ease;
}

.connection.completed {
  stroke: var(--success-green);
}

.node {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.node:hover {
  transform: scale(1.1);
}

.node.completed circle {
  fill: var(--success-green);
}

.node.in-progress circle {
  fill: var(--warning-orange);
}

.node.not-started circle {
  fill: var(--not-started);
}

.node.locked circle {
  fill: var(--locked);
}

.node-tooltip {
  position: absolute;
  background: var(--bg-primary);
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 16px;
  max-width: 280px;
  z-index: 10;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tooltip-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.in-progress {
  background: #fef3c7;
  color: #92400e;
}

.tooltip-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 12px;
}

.tooltip-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.tooltip-stats span {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.tooltip-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-top: 1px solid #e2e8f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.legend-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-icon.completed {
  background: var(--success-green);
}

.legend-icon.in-progress {
  background: var(--warning-orange);
}

.legend-icon.not-started {
  background: var(--not-started);
}

.legend-icon.locked {
  background: var(--locked);
}
```

### 3.3 智能推荐组件

```html
<div class="recommendation-panel">
  <div class="panel-header">
    <h3>为你推荐</h3>
    <button class="refresh-btn" title="刷新推荐">
      <i class="icon-refresh"></i>
    </button>
  </div>
  
  <div class="recommendation-tabs">
    <button class="tab-btn active" data-tab="personalized">个性化</button>
    <button class="tab-btn" data-tab="trending">热门</button>
    <button class="tab-btn" data-tab="similar">相似用户</button>
  </div>
  
  <div class="recommendation-content">
    <!-- 个性化推荐 -->
    <div class="tab-content active" data-content="personalized">
      <div class="recommendation-item">
        <div class="item-icon">
          <i class="icon-brain"></i>
        </div>
        <div class="item-content">
          <h4>深度学习基础</h4>
          <p>基于你的 Python 和数学基础，推荐学习深度学习</p>
          <div class="item-meta">
            <span class="match-score">匹配度: 95%</span>
            <span class="difficulty">中级</span>
          </div>
        </div>
        <button class="add-btn">
          <i class="icon-plus"></i>
        </button>
      </div>
      
      <div class="recommendation-item">
        <div class="item-icon">
          <i class="icon-chart"></i>
        </div>
        <div class="item-content">
          <h4>数据可视化进阶</h4>
          <p>学习 Plotly 和 Seaborn 创建交互式图表</p>
          <div class="item-meta">
            <span class="match-score">匹配度: 88%</span>
            <span class="difficulty">中级</span>
          </div>
        </div>
        <button class="add-btn">
          <i class="icon-plus"></i>
        </button>
      </div>
    </div>
    
    <!-- 热门推荐 -->
    <div class="tab-content" data-content="trending">
      <div class="trending-list">
        <div class="trending-item">
          <span class="rank">1</span>
          <div class="item-info">
            <h4>React 全栈开发</h4>
            <span class="learner-count">2.3k 人在学</span>
          </div>
          <div class="trend-indicator up">
            <i class="icon-arrow-up"></i>
            <span>+15%</span>
          </div>
        </div>
        
        <div class="trending-item">
          <span class="rank">2</span>
          <div class="item-info">
            <h4>AI 产品经理</h4>
            <span class="learner-count">1.8k 人在学</span>
          </div>
          <div class="trend-indicator up">
            <i class="icon-arrow-up"></i>
            <span>+12%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

```css
.recommendation-panel {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: var(--text-inverse);
}

.panel-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.recommendation-tabs {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn.active {
  color: var(--primary-blue);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-blue);
}

.recommendation-content {
  padding: 20px;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  border-color: var(--primary-blue);
  box-shadow: var(--shadow-md);
}

.item-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: 1.25rem;
}

.item-content {
  flex: 1;
}

.item-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.item-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 8px 0;
}

.item-meta {
  display: flex;
  gap: 12px;
}

.match-score {
  font-size: 0.75rem;
  color: var(--success-green);
  font-weight: 500;
}

.difficulty {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.add-btn {
  width: 36px;
  height: 36px;
  background: var(--primary-blue);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--primary-blue-dark);
  transform: scale(1.05);
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.trending-item:last-child {
  border-bottom: none;
}

.rank {
  width: 24px;
  height: 24px;
  background: var(--primary-blue);
  color: var(--text-inverse);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.learner-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-indicator.up {
  color: var(--success-green);
}
```

## 4. 页面设计

### 4.1 学习路径首页

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>学习路径 - Sical</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="learning-path-home">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-left">
            <h1>学习路径</h1>
            <p>发现适合你的学习路径，开启技能提升之旅</p>
          </div>
          <div class="header-actions">
            <button class="btn-outline">
              <i class="icon-filter"></i>
              筛选
            </button>
            <button class="btn-primary">
              <i class="icon-plus"></i>
              创建路径
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 搜索和筛选 -->
    <section class="search-section">
      <div class="container">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <i class="icon-search"></i>
            <input type="text" placeholder="搜索学习路径..." class="search-input">
            <button class="voice-search-btn" title="语音搜索">
              <i class="icon-mic"></i>
            </button>
          </div>
          <button class="search-btn">搜索</button>
        </div>
        
        <div class="filter-tabs">
          <button class="filter-tab active" data-category="all">全部</button>
          <button class="filter-tab" data-category="programming">编程开发</button>
          <button class="filter-tab" data-category="data-science">数据科学</button>
          <button class="filter-tab" data-category="design">设计创意</button>
          <button class="filter-tab" data-category="business">商业管理</button>
          <button class="filter-tab" data-category="ai">人工智能</button>
        </div>
      </div>
    </section>
    
    <!-- 推荐区域 -->
    <section class="recommendation-section">
      <div class="container">
        <div class="section-header">
          <h2>为你推荐</h2>
          <a href="#" class="view-all">查看全部</a>
        </div>
        
        <div class="recommendation-grid">
          <!-- 推荐卡片会通过 JavaScript 动态生成 -->
        </div>
      </div>
    </section>
    
    <!-- 热门路径 -->
    <section class="popular-section">
      <div class="container">
        <div class="section-header">
          <h2>热门路径</h2>
          <div class="sort-options">
            <select class="sort-select">
              <option value="popularity">按热度排序</option>
              <option value="rating">按评分排序</option>
              <option value="recent">按最新排序</option>
            </select>
          </div>
        </div>
        
        <div class="path-grid">
          <!-- 学习路径卡片 -->
        </div>
        
        <!-- 加载更多 -->
        <div class="load-more-section">
          <button class="load-more-btn">
            <span class="btn-text">加载更多</span>
            <div class="loading-spinner" style="display: none;"></div>
          </button>
        </div>
      </div>
    </section>
    
    <!-- 学习统计 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="icon-users"></i>
            </div>
            <div class="stat-content">
              <h3>50,000+</h3>
              <p>活跃学习者</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="icon-book"></i>
            </div>
            <div class="stat-content">
              <h3>1,200+</h3>
              <p>学习路径</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="icon-award"></i>
            </div>
            <div class="stat-content">
              <h3>95%</h3>
              <p>完成率</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="icon-clock"></i>
            </div>
            <div class="stat-content">
              <h3>2.5M</h3>
              <p>学习时长(小时)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  
  <script src="learning-path-home.js"></script>
</body>
</html>
```

```css
/* 学习路径首页样式 */
.learning-path-home {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: var(--text-inverse);
  padding: 40px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.header-left p {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-outline {
  padding: 10px 20px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: var(--text-inverse);
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 搜索区域 */
.search-section {
  padding: 30px 0;
  background: var(--bg-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper .icon-search {
  position: absolute;
  left: 16px;
  color: var(--text-tertiary);
  font-size: 1.125rem;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
}

.voice-search-btn {
  position: absolute;
  right: 12px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.voice-search-btn:hover {
  background: var(--bg-tertiary);
  color: var(--primary-blue);
}

.search-btn {
  padding: 12px 24px;
  background: var(--primary-blue);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-btn:hover {
  background: var(--primary-blue-dark);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab.active {
  background: var(--primary-blue);
  color: var(--text-inverse);
}

.filter-tab:hover:not(.active) {
  background: #d1d5db;
  color: var(--text-primary);
}

/* 推荐区域 */
.recommendation-section {
  padding: 40px 0;
  background: var(--bg-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.view-all {
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all:hover {
  color: var(--primary-blue-dark);
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* 热门路径 */
.popular-section {
  padding: 40px 0;
  background: var(--bg-secondary);
}

.sort-options {
  display: flex;
  align-items: center;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.path-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.load-more-section {
  display: flex;
  justify-content: center;
}

.load-more-btn {
  padding: 12px 32px;
  background: var(--bg-primary);
  border: 2px solid var(--primary-blue);
  color: var(--primary-blue);
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover {
  background: var(--primary-blue);
  color: var(--text-inverse);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 统计区域 */
.stats-section {
  padding: 40px 0;
  background: var(--bg-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: 1.5rem;
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.stat-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-left h1 {
    font-size: 2rem;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .path-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
}
```

### 4.2 学习路径详情页

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Python 数据科学入门 - 学习路径详情</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="path-detail-page">
    <!-- 路径头部信息 -->
    <header class="path-header">
      <div class="container">
        <div class="breadcrumb">
          <a href="/learning-paths">学习路径</a>
          <span class="separator">/</span>
          <a href="/learning-paths/data-science">数据科学</a>
          <span class="separator">/</span>
          <span class="current">Python 数据科学入门</span>
        </div>
        
        <div class="path-info">
          <div class="path-meta">
            <span class="category-badge">数据科学</span>
            <span class="difficulty-badge intermediate">中级</span>
            <span class="duration">约 40 小时</span>
          </div>
          
          <h1 class="path-title">Python 数据科学入门</h1>
          <p class="path-description">
            从零开始学习 Python 数据科学，掌握 NumPy、Pandas、Matplotlib 等核心库的使用，
            学会数据清洗、分析和可视化的基本技能。
          </p>
          
          <div class="path-stats">
            <div class="stat-item">
              <i class="icon-users"></i>
              <span>1,234 学习者</span>
            </div>
            <div class="stat-item">
              <i class="icon-star"></i>
              <span>4.8 (256 评价)</span>
            </div>
            <div class="stat-item">
              <i class="icon-calendar"></i>
              <span>最近更新: 2024-01-15</span>
            </div>
          </div>
          
          <div class="path-actions">
            <button class="btn-primary large">
              <i class="icon-play"></i>
              开始学习
            </button>
            <button class="btn-outline large">
              <i class="icon-bookmark"></i>
              收藏
            </button>
            <button class="btn-outline large">
              <i class="icon-share"></i>
              分享
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="path-content">
      <div class="container">
        <div class="content-layout">
          <!-- 左侧内容 -->
          <div class="main-content">
            <!-- 学习路径图谱 -->
            <section class="path-map-section">
              <h2>学习路径</h2>
              <!-- 这里插入之前设计的学习路径图谱组件 -->
              <div class="learning-path-map">
                <!-- 路径图谱内容 -->
              </div>
            </section>
            
            <!-- 课程大纲 -->
            <section class="curriculum-section">
              <h2>课程大纲</h2>
              <div class="curriculum-list">
                <div class="curriculum-item completed">
                  <div class="item-header">
                    <div class="item-status">
                      <i class="icon-check"></i>
                    </div>
                    <div class="item-info">
                      <h3>第一章：Python 基础</h3>
                      <p>学习 Python 语法基础和编程概念</p>
                    </div>
                    <div class="item-meta">
                      <span class="duration">6 小时</span>
                      <span class="lessons">8 节课</span>
                    </div>
                  </div>
                  <div class="item-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: 100%"></div>
                    </div>
                    <span class="progress-text">8/8 完成</span>
                  </div>
                </div>
                
                <div class="curriculum-item in-progress">
                  <div class="item-header">
                    <div class="item-status">
                      <div class="progress-ring">
                        <svg width="24" height="24">
                          <circle cx="12" cy="12" r="10" stroke="#e5e7eb" stroke-width="2" fill="none"></circle>
                          <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2" fill="none" 
                                  stroke-dasharray="62.8" stroke-dashoffset="25.12" 
                                  transform="rotate(-90 12 12)"></circle>
                        </svg>
                      </div>
                    </div>
                    <div class="item-info">
                      <h3>第二章：NumPy 数组操作</h3>
                      <p>掌握 NumPy 数组的创建、索引和基本运算</p>
                    </div>
                    <div class="item-meta">
                      <span class="duration">8 小时</span>
                      <span class="lessons">12 节课</span>
                    </div>
                  </div>
                  <div class="item-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: 60%"></div>
                    </div>
                    <span class="progress-text">7/12 完成</span>
                  </div>
                </div>
                
                <div class="curriculum-item not-started">
                  <div class="item-header">
                    <div class="item-status">
                      <i class="icon-circle"></i>
                    </div>
                    <div class="item-info">
                      <h3>第三章：Pandas 数据处理</h3>
                      <p>学习使用 Pandas 进行数据清洗和分析</p>
                    </div>
                    <div class="item-meta">
                      <span class="duration">10 小时</span>
                      <span class="lessons">15 节课</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 学习者评价 -->
            <section class="reviews-section">
              <div class="reviews-header">
                <h2>学习者评价</h2>
                <div class="rating-summary">
                  <div class="overall-rating">
                    <span class="rating-score">4.8</span>
                    <div class="rating-stars">
                      <i class="icon-star filled"></i>
                      <i class="icon-star filled"></i>
                      <i class="icon-star filled"></i>
                      <i class="icon-star filled"></i>
                      <i class="icon-star half"></i>
                    </div>
                    <span class="rating-count">(256 评价)</span>
                  </div>
                </div>
              </div>
              
              <div class="reviews-list">
                <div class="review-item">
                  <div class="reviewer-info">
                    <img src="/api/placeholder/40/40" alt="用户头像" class="reviewer-avatar">
                    <div class="reviewer-details">
                      <h4>张同学</h4>
                      <span class="review-date">2024-01-10</span>
                    </div>
                    <div class="review-rating">
                      <i class="icon-star filled"></i>
                      <i class="icon-star filled"></i>
                      <i class="icon-star filled"></i>
                      <i class="icon-star filled"></i>
                      <i class="icon-star filled"></i>
                    </div>
                  </div>
                  <p class="review-content">
                    课程内容很全面，从基础到进阶都有涉及。老师讲解清晰，实战项目很有帮助。
                    特别是 Pandas 部分，让我对数据处理有了更深的理解。
                  </p>
                </div>
              </div>
            </section>
          </div>
          
          <!-- 右侧边栏 -->
          <aside class="sidebar">
            <!-- 学习进度 -->
            <div class="progress-widget">
              <h3>学习进度</h3>
              <div class="circular-progress">
                <svg width="120" height="120">
                  <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="8" fill="none"></circle>
                  <circle cx="60" cy="60" r="50" stroke="#10b981" stroke-width="8" fill="none" 
                          stroke-dasharray="314" stroke-dashoffset="125.6" 
                          transform="rotate(-90 60 60)"></circle>
                </svg>
                <div class="progress-text">
                  <span class="percentage">60%</span>
                  <span class="label">已完成</span>
                </div>
              </div>
              <div class="progress-details">
                <div class="detail-item">
                  <span>已完成章节</span>
                  <span>15/25</span>
                </div>
                <div class="detail-item">
                  <span>学习时长</span>
                  <span>24 小时</span>
                </div>
                <div class="detail-item">
                  <span>预计剩余</span>
                  <span>16 小时</span>
                </div>
              </div>
            </div>
            
            <!-- 推荐组件 -->
            <div class="recommendation-panel">
              <!-- 之前设计的推荐组件 -->
            </div>
            
            <!-- 学习小组 -->
            <div class="study-group-widget">
              <h3>学习小组</h3>
              <div class="group-info">
                <div class="group-avatar">
                  <img src="/api/placeholder/60/60" alt="小组头像">
                </div>
                <div class="group-details">
                  <h4>Python 数据科学学习小组</h4>
                  <p>23 名成员 · 活跃度很高</p>
                </div>
              </div>
              <div class="group-members">
                <div class="member-avatars">
                  <img src="/api/placeholder/32/32" alt="成员">
                  <img src="/api/placeholder/32/32" alt="成员">
                  <img src="/api/placeholder/32/32" alt="成员">
                  <span class="more-count">+20</span>
                </div>
              </div>
              <button class="btn-outline full-width">加入小组</button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
  
  <script src="path-detail.js"></script>
</body>
</html>
```

```css
/* 学习路径详情页样式 */
.path-detail-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* 路径头部 */
.path-header {
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: var(--text-inverse);
  padding: 20px 0 40px 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 0.875rem;
}

.breadcrumb a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb a:hover {
  color: var(--text-inverse);
}

.separator {
  color: rgba(255, 255, 255, 0.6);
}

.current {
  color: var(--text-inverse);
  font-weight: 500;
}

.path-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-badge, .difficulty-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.category-badge {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-inverse);
}

.difficulty-badge.intermediate {
  background: var(--warning-orange);
  color: white;
}

.duration {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.path-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.path-description {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 24px;
  max-width: 800px;
}

.path-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.path-actions {
  display: flex;
  gap: 12px;
}

.btn-primary.large, .btn-outline.large {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
}

/* 主要内容布局 */
.path-content {
  padding: 40px 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
}

.main-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.main-content section {
  padding: 32px;
  border-bottom: 1px solid #e2e8f0;
}

.main-content section:last-child {
  border-bottom: none;
}

.main-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 24px 0;
}

/* 课程大纲 */
.curriculum-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.curriculum-item {
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all 0.2s ease;
}

.curriculum-item:hover {
  border-color: var(--primary-blue);
  box-shadow: var(--shadow-md);
}

.curriculum-item.completed {
  background: #f0fdf4;
  border-color: var(--success-green);
}

.curriculum-item.in-progress {
  background: #fffbeb;
  border-color: var(--warning-orange);
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.item-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.item-status .icon-check {
  color: var(--success-green);
  font-size: 1.25rem;
}

.item-status .icon-circle {
  color: var(--text-tertiary);
  font-size: 1.25rem;
}

.progress-ring {
  transform: rotate(-90deg);
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.item-info p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.item-meta span {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.item-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 评价区域 */
.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.overall-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.icon-star.filled {
  color: #fbbf24;
}

.icon-star.half {
  color: #fbbf24;
}

.rating-count {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.review-item {
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.reviewer-details {
  flex: 1;
}

.reviewer-details h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.review-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-content {
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-widget, .study-group-widget {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
}

.progress-widget h3, .study-group-widget h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.circular-progress {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-item span:first-child {
  color: var(--text-secondary);
}

.detail-item span:last-child {
  color: var(--text-primary);
  font-weight: 500;
}

/* 学习小组 */
.group-info {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.group-avatar img {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
}

.group-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.group-details p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.group-members {
  margin-bottom: 16px;
}

.member-avatars {
  display: flex;
  align-items: center;
  gap: -8px;
}

.member-avatars img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  margin-left: -8px;
}

.member-avatars img:first-child {
  margin-left: 0;
}

.more-count {
  width: 32px;
  height: 32px;
  background: var(--bg-tertiary);
  border: 2px solid var(--bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: -8px;
}

.full-width {
  width: 100%;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .path-title {
    font-size: 2rem;
  }
  
  .path-actions {
    flex-direction: column;
  }
  
  .path-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .main-content section {
    padding: 20px;
  }
  
  .item-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .item-meta {
    align-items: flex-start;
    flex-direction: row;
    gap: 12px;
  }
}
```

## 5. 交互设计

### 5.1 学习路径导航交互

```javascript
// 学习路径图谱交互
class PathMapInteraction {
  constructor(container) {
    this.container = container;
    this.svg = container.querySelector('.path-svg');
    this.nodes = container.querySelectorAll('.node');
    this.tooltip = container.querySelector('.node-tooltip');
    
    this.initInteractions();
  }
  
  initInteractions() {
    // 节点悬停显示详情
    this.nodes.forEach(node => {
      node.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, this.getNodeData(node));
      });
      
      node.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
      
      node.addEventListener('click', (e) => {
        this.handleNodeClick(node);
      });
    });
    
    // 地图缩放和拖拽
    this.initMapControls();
  }
  
  showTooltip(target, data) {
    const rect = target.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <h4>${data.title}</h4>
        <span class="status-badge ${data.status}">${data.statusText}</span>
      </div>
      <div class="tooltip-content">
        <p>${data.description}</p>
        <div class="tooltip-stats">
          <span>预计时间: ${data.duration}</span>
          <span>完成度: ${data.progress}%</span>
        </div>
      </div>
      <div class="tooltip-actions">
        <button class="btn-sm btn-primary">${data.actionText}</button>
      </div>
    `;
    
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${rect.left - containerRect.left + 50}px`;
    this.tooltip.style.top = `${rect.top - containerRect.top - 10}px`;
  }
  
  hideTooltip() {
    this.tooltip.style.display = 'none';
  }
  
  handleNodeClick(node) {
    const nodeData = this.getNodeData(node);
    
    if (nodeData.status === 'locked') {
      this.showLockedMessage();
      return;
    }
    
    // 导航到具体学习内容
    window.location.href = `/learning/${nodeData.id}`;
  }
  
  initMapControls() {
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    
    // 缩放控制
    this.container.querySelector('[data-action="zoom-in"]')
      .addEventListener('click', () => {
        scale = Math.min(scale * 1.2, 3);
        this.updateTransform();
      });
    
    this.container.querySelector('[data-action="zoom-out"]')
      .addEventListener('click', () => {
        scale = Math.max(scale / 1.2, 0.5);
        this.updateTransform();
      });
    
    this.container.querySelector('[data-action="reset"]')
      .addEventListener('click', () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        this.updateTransform();
      });
    
    // 拖拽控制
    this.svg.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      this.svg.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      
      translateX += deltaX;
      translateY += deltaY;
      
      lastX = e.clientX;
      lastY = e.clientY;
      
      this.updateTransform();
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      this.svg.style.cursor = 'grab';
    });
  }
  
  updateTransform() {
    this.svg.style.transform = 
      `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
  
  getNodeData(node) {
    // 从节点元素获取数据
    return {
      id: node.dataset.nodeId,
      title: node.querySelector('text:last-child').textContent,
      status: node.classList.contains('completed') ? 'completed' :
              node.classList.contains('in-progress') ? 'in-progress' :
              node.classList.contains('locked') ? 'locked' : 'not-started',
      // ... 其他数据
    };
  }
}
```

### 5.2 智能推荐交互

```javascript
// 推荐系统交互
class RecommendationInteraction {
  constructor(container) {
    this.container = container;
    this.tabs = container.querySelectorAll('.tab-btn');
    this.contents = container.querySelectorAll('.tab-content');
    this.refreshBtn = container.querySelector('.refresh-btn');
    
    this.initTabs();
    this.initRefresh();
    this.initRecommendationActions();
  }
  
  initTabs() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }
  
  switchTab(targetTab) {
    // 更新标签状态
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetTab);
    });
    
    // 更新内容显示
    this.contents.forEach(content => {
      content.classList.toggle('active', content.dataset.content === targetTab);
    });
    
    // 加载对应内容
    this.loadTabContent(targetTab);
  }
  
  async loadTabContent(tab) {
    const content = this.container.querySelector(`[data-content="${tab}"]`);
    
    // 显示加载状态
    content.innerHTML = '<div class="loading-placeholder">加载中...</div>';
    
    try {
      const data = await this.fetchRecommendations(tab);
      this.renderRecommendations(content, data, tab);
    } catch (error) {
      content.innerHTML = '<div class="error-message">加载失败，请重试</div>';
    }
  }
  
  async fetchRecommendations(type) {
    const response = await fetch(`/api/recommendations?type=${type}`);
    return response.json();
  }
  
  renderRecommendations(container, data, type) {
    if (type === 'personalized') {
      container.innerHTML = data.map(item => `
        <div class="recommendation-item" data-id="${item.id}">
          <div class="item-icon">
            <i class="${item.icon}"></i>
          </div>
          <div class="item-content">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
            <div class="item-meta">
              <span class="match-score">匹配度: ${item.matchScore}%</span>
              <span class="difficulty">${item.difficulty}</span>
            </div>
          </div>
          <button class="add-btn" data-action="add">
            <i class="icon-plus"></i>
          </button>
        </div>
      `).join('');
    } else if (type === 'trending') {
      container.innerHTML = `
        <div class="trending-list">
          ${data.map((item, index) => `
            <div class="trending-item" data-id="${item.id}">
              <span class="rank">${index + 1}</span>
              <div class="item-info">
                <h4>${item.title}</h4>
                <span class="learner-count">${item.learnerCount} 人在学</span>
              </div>
              <div class="trend-indicator ${item.trend > 0 ? 'up' : 'down'}">
                <i class="icon-arrow-${item.trend > 0 ? 'up' : 'down'}"></i>
                <span>${item.trend > 0 ? '+' : ''}${item.trend}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
  
  initRefresh() {
    this.refreshBtn.addEventListener('click', () => {
      this.refreshBtn.classList.add('rotating');
      
      const activeTab = this.container.querySelector('.tab-btn.active').dataset.tab;
      this.loadTabContent(activeTab).finally(() => {
        this.refreshBtn.classList.remove('rotating');
      });
    });
  }
  
  initRecommendationActions() {
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.add-btn')) {
        const item = e.target.closest('.recommendation-item');
        this.addToLearningPath(item.dataset.id);
      }
    });
  }
  
  async addToLearningPath(itemId) {
    try {
      await fetch('/api/learning-path/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      
      this.showSuccessMessage('已添加到学习路径');
    } catch (error) {
      this.showErrorMessage('添加失败，请重试');
    }
  }
  
  showSuccessMessage(message) {
    // 显示成功提示
    this.showToast(message, 'success');
  }
  
  showErrorMessage(message) {
    // 显示错误提示
    this.showToast(message, 'error');
  }
  
  showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
```

### 5.3 学习进度跟踪

```javascript
// 学习进度跟踪
class ProgressTracker {
  constructor() {
    this.progressData = {};
    this.initProgressTracking();
  }
  
  initProgressTracking() {
    // 监听学习活动
    this.trackLearningEvents();
    
    // 定期同步进度
    setInterval(() => {
      this.syncProgress();
    }, 30000); // 每30秒同步一次
    
    // 页面卸载时保存进度
    window.addEventListener('beforeunload', () => {
      this.syncProgress();
    });
  }
  
  trackLearningEvents() {
    // 跟踪视频观看进度
    document.addEventListener('video-progress', (e) => {
      this.updateVideoProgress(e.detail.videoId, e.detail.progress);
    });
    
    // 跟踪练习完成
    document.addEventListener('exercise-completed', (e) => {
      this.markExerciseCompleted(e.detail.exerciseId, e.detail.score);
    });
    
    // 跟踪阅读进度
    document.addEventListener('reading-progress', (e) => {
      this.updateReadingProgress(e.detail.contentId, e.detail.progress);
    });
  }
  
  updateVideoProgress(videoId, progress) {
    if (!this.progressData.videos) {
      this.progressData.videos = {};
    }
    
    this.progressData.videos[videoId] = {
      progress: Math.max(this.progressData.videos[videoId]?.progress || 0, progress),
      lastUpdated: Date.now()
    };
    
    this.updateUIProgress();
  }
  
  markExerciseCompleted(exerciseId, score) {
    if (!this.progressData.exercises) {
      this.progressData.exercises = {};
    }
    
    this.progressData.exercises[exerciseId] = {
      completed: true,
      score: score,
      completedAt: Date.now()
    };
    
    this.updateUIProgress();
    this.showAchievement('练习完成！', `得分: ${score}`);
  }
  
  updateReadingProgress(contentId, progress) {
    if (!this.progressData.reading) {
      this.progressData.reading = {};
    }
    
    this.progressData.reading[contentId] = {
      progress: Math.max(this.progressData.reading[contentId]?.progress || 0, progress),
      lastUpdated: Date.now()
    };
    
    this.updateUIProgress();
  }
  
  updateUIProgress() {
    // 更新进度条
    const overallProgress = this.calculateOverallProgress();
    this.updateProgressBar(overallProgress);
    
    // 更新统计数据
    this.updateProgressStats();
    
    // 检查里程碑
    this.checkMilestones(overallProgress);
  }
  
  calculateOverallProgress() {
    // 计算总体学习进度
    const weights = {
      videos: 0.4,
      exercises: 0.4,
      reading: 0.2
    };
    
    let totalProgress = 0;
    let totalWeight = 0;
    
    Object.keys(weights).forEach(type => {
      if (this.progressData[type]) {
        const typeProgress = this.calculateTypeProgress(type);
        totalProgress += typeProgress * weights[type];
        totalWeight += weights[type];
      }
    });
    
    return totalWeight > 0 ? totalProgress / totalWeight : 0;
  }
  
  calculateTypeProgress(type) {
    const data = this.progressData[type];
    if (!data) return 0;
    
    const items = Object.values(data);
    if (items.length === 0) return 0;
    
    const totalProgress = items.reduce((sum, item) => {
      return sum + (item.progress || (item.completed ? 100 : 0));
    }, 0);
    
    return totalProgress / items.length;
  }
  
  updateProgressBar(progress) {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
      bar.style.width = `${progress}%`;
    });
    
    const progressTexts = document.querySelectorAll('.progress-percentage');
    progressTexts.forEach(text => {
      text.textContent = `${Math.round(progress)}%`;
    });
  }
  
  updateProgressStats() {
    const stats = this.calculateDetailedStats();
    
    // 更新侧边栏统计
    const statsContainer = document.querySelector('.progress-details');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="detail-item">
          <span>已完成章节</span>
          <span>${stats.completedChapters}/${stats.totalChapters}</span>
        </div>
        <div class="detail-item">
          <span>学习时长</span>
          <span>${stats.studyTime} 小时</span>
        </div>
        <div class="detail-item">
          <span>预计剩余</span>
          <span>${stats.remainingTime} 小时</span>
        </div>
      `;
    }
  }
  
  checkMilestones(progress) {
    const milestones = [25, 50, 75, 100];
    
    milestones.forEach(milestone => {
      if (progress >= milestone && !this.hasAchievedMilestone(milestone)) {
        this.showMilestoneAchievement(milestone);
        this.markMilestoneAchieved(milestone);
      }
    });
  }
  
  showMilestoneAchievement(milestone) {
    const achievement = {
      25: { title: '初学者', description: '完成了 25% 的学习内容' },
      50: { title: '进步者', description: '完成了一半的学习内容' },
      75: { title: '坚持者', description: '完成了 75% 的学习内容' },
      100: { title: '完成者', description: '恭喜完成全部学习内容！' }
    };
    
    this.showAchievement(
      achievement[milestone].title,
      achievement[milestone].description
    );
  }
  
  showAchievement(title, description) {
    const achievement = document.createElement('div');
    achievement.className = 'achievement-popup';
    achievement.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">
          <i class="icon-award"></i>
        </div>
        <div class="achievement-text">
          <h4>${title}</h4>
          <p>${description}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(achievement);
    
    setTimeout(() => {
      achievement.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      achievement.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(achievement);
      }, 500);
    }, 4000);
  }
  
  async syncProgress() {
    try {
      await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.progressData)
      });
    } catch (error) {
      console.error('进度同步失败:', error);
    }
  }
}
```

## 6. 响应式设计

### 6.1 断点系统

```css
/* 响应式断点系统 */
:root {
  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 移动端优先的媒体查询 */
@media (min-width: 480px) {
  .container {
    max-width: 480px;
  }
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
  
  .path-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
  
  .header-content {
    flex-direction: row;
  }
  
  .search-bar {
    flex-direction: row;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
  
  .content-layout {
    grid-template-columns: 1fr 320px;
  }
  
  .path-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
  
  .path-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 6.2 移动端适配

```css
/* 移动端特殊适配 */
@media (max-width: 768px) {
  /* 触摸友好的按钮尺寸 */
  .btn-primary, .btn-secondary {
    min-height: 44px;
    padding: 12px 20px;
  }
  
  /* 移动端导航 */
  .path-header {
    padding: 16px 0 24px 0;
  }
  
  .path-title {
    font-size: 1.75rem;
    line-height: 1.3;
  }
  
  .path-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .path-actions button {
    width: 100%;
  }
  
  /* 移动端学习路径图谱 */
  .learning-path-map {
    height: 300px;
  }
  
  .map-controls {
    position: absolute;
    top: 16px;
    right: 16px;
    flex-direction: column;
    gap: 4px;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
  }
  
  /* 移动端课程大纲 */
  .curriculum-item {
    padding: 16px;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .item-meta {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
  
  /* 移动端推荐面板 */
  .recommendation-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .item-content {
    order: 2;
  }
  
  .add-btn {
    order: 3;
    align-self: stretch;
    height: 44px;
  }
  
  /* 移动端侧边栏 */
  .sidebar {
    order: -1;
  }
  
  .progress-widget, .study-group-widget {
    padding: 16px;
  }
  
  .circular-progress {
    margin-bottom: 16px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .path-header {
    padding: 12px 0 20px 0;
  }
  
  .path-title {
    font-size: 1.5rem;
  }
  
  .path-description {
    font-size: 1rem;
  }
  
  .path-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-item {
    justify-content: center;
  }
  
  .main-content section {
    padding: 16px;
  }
  
  .curriculum-item {
    padding: 12px;
  }
  
  .recommendation-item {
    padding: 12px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
    text-align: center;
  }
}
```

## 7. 无障碍设计

### 7.1 键盘导航

```css
/* 键盘焦点样式 */
.focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-blue);
  color: var(--text-inverse);
  padding: 8px;
  text-decoration: none;
  border-radius: var(--radius-md);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* 可聚焦元素样式 */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
a:focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* 自定义焦点指示器 */
.node:focus-visible {
  outline: 3px solid var(--primary-blue);
  outline-offset: 3px;
}

.learning-path-card:focus-within {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  outline: 2px solid var(--primary-blue);
}
```

### 7.2 屏幕阅读器支持

```html
<!-- ARIA 标签和角色 -->
<div class="learning-path-map" role="application" aria-label="学习路径图谱">
  <div class="map-header">
    <h2 id="map-title">Python 数据科学学习路径</h2>
    <div class="map-controls" role="toolbar" aria-label="地图控制">
      <button class="control-btn" 
              data-action="zoom-in" 
              aria-label="放大地图"
              title="放大地图">
        <i class="icon-zoom-in" aria-hidden="true"></i>
      </button>
      <button class="control-btn" 
              data-action="zoom-out" 
              aria-label="缩小地图"
              title="缩小地图">
        <i class="icon-zoom-out" aria-hidden="true"></i>
      </button>
      <button class="control-btn" 
              data-action="reset" 
              aria-label="重置地图视图"
              title="重置地图视图">
        <i class="icon-refresh" aria-hidden="true"></i>
      </button>
    </div>
  </div>
  
  <div class="map-container">
    <svg class="path-svg" 
         viewBox="0 0 1200 800" 
         role="img" 
         aria-labelledby="map-title"
         aria-describedby="map-description">
      <desc id="map-description">学习路径的可视化图谱，显示各个学习节点及其连接关系</desc>
      
      <!-- 学习节点 -->
      <g class="nodes">
        <g class="node completed" 
           transform="translate(100, 80)"
           role="button"
           tabindex="0"
           aria-label="Python 基础 - 已完成"
           aria-describedby="node-1-desc">
          <circle r="25" fill="#10b981" stroke="#ffffff" stroke-width="3"></circle>
          <text x="0" y="5" text-anchor="middle" fill="white" font-size="12" font-weight="bold" aria-hidden="true">✓</text>
          <text x="0" y="45" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="500">Python 基础</text>
          <desc id="node-1-desc">学习 Python 语法基础和编程概念，状态：已完成</desc>
        </g>
      </g>
    </svg>
  </div>
  
  <!-- 屏幕阅读器专用的节点列表 -->
  <div class="sr-only">
    <h3>学习节点列表</h3>
    <ul>
      <li>
        <strong>Python 基础</strong> - 已完成
        <p>学习 Python 语法基础和编程概念</p>
      </li>
      <li>
        <strong>NumPy 数组</strong> - 进行中 (60% 完成)
        <p>掌握 NumPy 数组的创建、索引和基本运算</p>
      </li>
      <!-- 更多节点... -->
    </ul>
  </div>
</div>

<!-- 进度信息的无障碍标记 -->
<div class="progress-section" role="progressbar" 
     aria-valuenow="65" 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label="学习进度">
  <div class="progress-bar">
    <div class="progress-fill" style="width: 65%"></div>
  </div>
  <span class="progress-text" aria-live="polite">13/20 完成</span>
</div>

<!-- 动态内容更新通知 -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="status-updates"></div>
```

### 7.3 颜色对比度

```css
/* 高对比度颜色方案 */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --text-secondary: #333333;
    --text-tertiary: #666666;
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --primary-blue: #0066cc;
    --primary-blue-dark: #004499;
  }
  
  .learning-path-card {
    border: 2px solid #333333;
  }
  
  .btn-primary {
    background: #0066cc;
    border: 2px solid #004499;
  }
  
  .btn-secondary {
    border: 2px solid #333333;
    color: #000000;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .learning-path-card:hover {
    transform: none;
  }
  
  .path-thumbnail img {
    transform: none;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --bg-tertiary: #404040;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --text-tertiary: #999999;
    --text-inverse: #000000;
  }
  
  .learning-path-card {
    background: var(--bg-primary);
    border-color: #404040;
  }
  
  .curriculum-item {
    border-color: #404040;
  }
  
  .curriculum-item.completed {
    background: #1a3a1a;
    border-color: var(--success-green);
  }
  
  .curriculum-item.in-progress {
    background: #3a3a1a;
    border-color: var(--warning-orange);
  }
}
```

## 8. 性能优化

### 8.1 CSS 优化

```css
/* CSS 性能优化 */

/* 使用 transform 和 opacity 进行动画 */
.learning-path-card {
  will-change: transform;
  transform: translateZ(0); /* 启用硬件加速 */
}

.learning-path-card:hover {
  transform: translateY(-4px) translateZ(0);
}

/* 避免昂贵的 CSS 属性 */
.progress-fill {
  transform: translateZ(0);
  will-change: width;
}

/* 使用 contain 属性优化渲染 */
.learning-path-card {
  contain: layout style paint;
}

.recommendation-item {
  contain: layout style;
}

/* 优化字体加载 */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}

/* 关键 CSS 内联，非关键 CSS 异步加载 */
.critical-styles {
  /* 首屏关键样式 */
}

/* 使用 CSS Grid 和 Flexbox 进行高效布局 */
.path-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  contain: layout;
}

/* 减少重绘和回流 */
.node {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.node:hover {
  transform: scale(1.1) translateZ(0);
}
```

### 8.2 图片优化

```html
<!-- 响应式图片 -->
<picture>
  <source media="(max-width: 480px)" 
          srcset="/images/path-thumb-small.webp 1x, /images/path-thumb-small@2x.webp 2x" 
          type="image/webp">
  <source media="(max-width: 768px)" 
          srcset="/images/path-thumb-medium.webp 1x, /images/path-thumb-medium@2x.webp 2x" 
          type="image/webp">
  <source srcset="/images/path-thumb-large.webp 1x, /images/path-thumb-large@2x.webp 2x" 
          type="image/webp">
  <img src="/images/path-thumb-large.jpg" 
       alt="学习路径缩略图" 
       loading="lazy"
       decoding="async"
       width="300" 
       height="200">
</picture>

<!-- 懒加载图片 -->
<img src="/images/placeholder.svg" 
     data-src="/images/actual-image.jpg" 
     alt="描述" 
     class="lazy-load"
     loading="lazy">
```

```javascript
// 图片懒加载实现
class LazyImageLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src]');
    this.imageObserver = null;
    
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver(
        this.onIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
      
      this.images.forEach(img => {
        this.imageObserver.observe(img);
      });
    } else {
      // 降级处理
      this.loadAllImages();
    }
  }
  
  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.imageObserver.unobserve(entry.target);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    
    const image = new Image();
    image.onload = () => {
      img.src = src;
      img.classList.add('loaded');
    };
    image.src = src;
  }
  
  loadAllImages() {
    this.images.forEach(img => {
      this.loadImage(img);
    });
  }
}

// 初始化懒加载
document.addEventListener('DOMContentLoaded', () => {
  new LazyImageLoader();
});
```

## 总结

本 UI/UX 设计文档为学习路径功能提供了完整的用户界面解决方案，具有以下特点：

### 设计亮点
1. **直观的路径可视化**：通过图谱形式展示学习路径，让用户清晰了解学习进程
2. **智能推荐系统**：个性化推荐界面，提升学习效率和用户粘性
3. **游戏化学习体验**：进度跟踪、成就系统和里程碑奖励
4. **社交学习功能**：学习小组、进度分享和协作学习界面
5. **响应式设计**：完美适配各种设备和屏幕尺寸

### 技术特色
1. **现代化组件设计**：模块化、可复用的 UI 组件
2. **丰富的交互效果**：流畅的动画和过渡效果
3. **无障碍友好**：完整的键盘导航和屏幕阅读器支持
4. **性能优化**：懒加载、硬件加速和渲染优化
5. **主题适配**：支持暗色模式和高对比度模式

### 用户价值
1. **降低学习门槛**：清晰的界面设计和直观的操作流程
2. **提升学习动机**：游戏化元素和成就系统激发学习兴趣
3. **增强学习效果**：个性化推荐和智能路径规划
4. **促进社交学习**：小组协作和进度分享功能
5. **优化学习体验**：流畅的交互和美观的视觉设计