# 评估系统功能 UI/UX 设计

## 1. 设计概览

### 1.1 设计原则

1. **简洁直观**：界面简洁明了，操作流程直观易懂
2. **专注体验**：减少干扰，让用户专注于评估过程
3. **即时反馈**：提供清晰的状态反馈和进度指示
4. **适应性强**：支持不同设备和屏幕尺寸
5. **无障碍友好**：遵循无障碍设计标准

### 1.2 用户体验目标

- **降低认知负荷**：简化界面元素，突出核心功能
- **提升答题效率**：优化交互流程，减少操作步骤
- **增强信心感**：通过清晰的进度指示和友好的反馈
- **保证公平性**：统一的界面标准，避免因界面差异影响评估结果

### 1.3 目标用户

- **学生用户**：参与各类评估测试的学习者
- **教师用户**：创建和管理评估内容的教育工作者
- **管理员**：系统管理和数据分析人员

## 2. 视觉设计系统

### 2.1 色彩系统

```css
:root {
  /* 主色调 - 专业可信 */
  --primary-color: #2563eb;
  --primary-light: #3b82f6;
  --primary-dark: #1d4ed8;
  
  /* 辅助色 - 功能状态 */
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #06b6d4;
  
  /* 中性色 - 文本和背景 */
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
  
  /* 评估专用色 */
  --assessment-bg: #fafbfc;
  --question-bg: #ffffff;
  --answer-selected: #eff6ff;
  --answer-correct: #ecfdf5;
  --answer-incorrect: #fef2f2;
  --progress-bg: #e5e7eb;
  --progress-fill: #2563eb;
}
```

### 2.2 字体系统

```css
:root {
  /* 字体族 */
  --font-primary: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;
  
  /* 字体大小 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* 字重 */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 2.3 间距系统

```css
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
}
```

### 2.4 圆角和阴影

```css
:root {
  /* 圆角 */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## 3. 组件设计

### 3.1 评估卡片组件

```html
<!-- 评估卡片 -->
<div class="assessment-card">
  <div class="assessment-card__header">
    <div class="assessment-card__icon">
      <svg class="icon-assessment" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <div class="assessment-card__meta">
      <span class="assessment-card__type">适应性测试</span>
      <span class="assessment-card__duration">45分钟</span>
    </div>
  </div>
  
  <div class="assessment-card__content">
    <h3 class="assessment-card__title">数学基础能力评估</h3>
    <p class="assessment-card__description">
      全面评估您的数学基础知识掌握情况，包括代数、几何、概率统计等核心领域。
    </p>
    
    <div class="assessment-card__stats">
      <div class="stat-item">
        <span class="stat-item__label">题目数量</span>
        <span class="stat-item__value">30题</span>
      </div>
      <div class="stat-item">
        <span class="stat-item__label">难度等级</span>
        <span class="stat-item__value">中等</span>
      </div>
      <div class="stat-item">
        <span class="stat-item__label">参与人数</span>
        <span class="stat-item__value">1,234</span>
      </div>
    </div>
  </div>
  
  <div class="assessment-card__footer">
    <button class="btn btn--primary btn--full">
      开始评估
    </button>
  </div>
</div>
```

```css
.assessment-card {
  background: var(--question-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  transition: all 0.2s ease;
  border: 1px solid var(--gray-200);
}

.assessment-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.assessment-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.assessment-card__icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-assessment {
  width: 24px;
  height: 24px;
  fill: white;
}

.assessment-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.assessment-card__type {
  background: var(--primary-color);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.assessment-card__duration {
  color: var(--gray-500);
  font-size: var(--text-sm);
}

.assessment-card__title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.assessment-card__description {
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.assessment-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-item {
  text-align: center;
}

.stat-item__label {
  display: block;
  font-size: var(--text-xs);
  color: var(--gray-500);
  margin-bottom: var(--space-1);
}

.stat-item__value {
  display: block;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--text-base);
}

.btn--primary {
  background: var(--primary-color);
  color: white;
}

.btn--primary:hover {
  background: var(--primary-dark);
}

.btn--full {
  width: 100%;
}
```

### 3.2 题目显示组件

```html
<!-- 题目容器 -->
<div class="question-container">
  <div class="question-header">
    <div class="question-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: 60%"></div>
      </div>
      <span class="progress-text">第 18 题，共 30 题</span>
    </div>
    
    <div class="question-timer">
      <svg class="timer-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
      <span class="timer-text">25:30</span>
    </div>
  </div>
  
  <div class="question-content">
    <div class="question-type-badge">单选题</div>
    
    <div class="question-text">
      <h2>下列哪个函数是奇函数？</h2>
      <div class="question-description">
        请从以下选项中选择正确答案。奇函数满足 f(-x) = -f(x) 的性质。
      </div>
    </div>
    
    <div class="question-options">
      <label class="option-item">
        <input type="radio" name="answer" value="A" class="option-input">
        <div class="option-content">
          <span class="option-label">A</span>
          <span class="option-text">f(x) = x² + 1</span>
        </div>
      </label>
      
      <label class="option-item">
        <input type="radio" name="answer" value="B" class="option-input">
        <div class="option-content">
          <span class="option-label">B</span>
          <span class="option-text">f(x) = x³ - x</span>
        </div>
      </label>
      
      <label class="option-item">
        <input type="radio" name="answer" value="C" class="option-input">
        <div class="option-content">
          <span class="option-label">C</span>
          <span class="option-text">f(x) = |x|</span>
        </div>
      </label>
      
      <label class="option-item">
        <input type="radio" name="answer" value="D" class="option-input">
        <div class="option-content">
          <span class="option-label">D</span>
          <span class="option-text">f(x) = x² - 2x</span>
        </div>
      </label>
    </div>
  </div>
  
  <div class="question-actions">
    <button class="btn btn--secondary" id="prev-btn">
      <svg class="btn-icon" viewBox="0 0 24 24">
        <polyline points="15,18 9,12 15,6"/>
      </svg>
      上一题
    </button>
    
    <div class="question-tools">
      <button class="tool-btn" title="标记题目">
        <svg viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
        </svg>
      </button>
      
      <button class="tool-btn" title="计算器">
        <svg viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="8" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="16" y2="14"/>
          <line x1="8" y1="18" x2="16" y2="18"/>
        </svg>
      </button>
    </div>
    
    <button class="btn btn--primary" id="next-btn">
      下一题
      <svg class="btn-icon" viewBox="0 0 24 24">
        <polyline points="9,18 15,12 9,6"/>
      </svg>
    </button>
  </div>
</div>
```

```css
.question-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--question-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.question-progress {
  flex: 1;
  max-width: 300px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--progress-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--text-sm);
  color: var(--gray-600);
  font-weight: var(--font-medium);
}

.question-timer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
}

.timer-icon {
  width: 20px;
  height: 20px;
  stroke: var(--gray-500);
  fill: none;
  stroke-width: 2;
}

.timer-text {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-700);
  font-variant-numeric: tabular-nums;
}

.question-content {
  padding: var(--space-8);
}

.question-type-badge {
  display: inline-block;
  background: var(--info-color);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-6);
}

.question-text h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-4);
}

.question-description {
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.option-item {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.option-item:hover {
  border-color: var(--primary-light);
  background: var(--gray-50);
}

.option-item:has(.option-input:checked) {
  border-color: var(--primary-color);
  background: var(--answer-selected);
}

.option-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--gray-100);
  border-radius: 50%;
  font-weight: var(--font-semibold);
  color: var(--gray-700);
  flex-shrink: 0;
}

.option-item:has(.option-input:checked) .option-label {
  background: var(--primary-color);
  color: white;
}

.option-text {
  font-size: var(--text-lg);
  color: var(--gray-800);
  line-height: var(--leading-normal);
}

.question-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
}

.question-tools {
  display: flex;
  gap: var(--space-2);
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.tool-btn svg {
  width: 20px;
  height: 20px;
  stroke: var(--gray-600);
  fill: none;
  stroke-width: 2;
}

.btn--secondary {
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn--secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.btn-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}
```

### 3.3 结果展示组件

```html
<!-- 评估结果 -->
<div class="result-container">
  <div class="result-header">
    <div class="result-icon">
      <svg class="icon-success" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <h1 class="result-title">评估完成！</h1>
    <p class="result-subtitle">您已成功完成数学基础能力评估</p>
  </div>
  
  <div class="result-summary">
    <div class="score-display">
      <div class="score-circle">
        <svg class="score-progress" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" class="score-bg"/>
          <circle cx="60" cy="60" r="50" class="score-fill" 
                  style="stroke-dasharray: 251.2; stroke-dashoffset: 75.36;"/>
        </svg>
        <div class="score-text">
          <span class="score-value">85</span>
          <span class="score-unit">分</span>
        </div>
      </div>
      <div class="score-level">
        <span class="level-badge level-good">良好</span>
        <p class="level-description">您的数学基础知识掌握情况良好，建议继续加强练习。</p>
      </div>
    </div>
  </div>
  
  <div class="result-details">
    <div class="detail-section">
      <h3 class="section-title">能力分析</h3>
      <div class="ability-chart">
        <div class="ability-item">
          <div class="ability-info">
            <span class="ability-name">代数运算</span>
            <span class="ability-score">92分</span>
          </div>
          <div class="ability-bar">
            <div class="ability-fill" style="width: 92%"></div>
          </div>
        </div>
        
        <div class="ability-item">
          <div class="ability-info">
            <span class="ability-name">几何图形</span>
            <span class="ability-score">78分</span>
          </div>
          <div class="ability-bar">
            <div class="ability-fill" style="width: 78%"></div>
          </div>
        </div>
        
        <div class="ability-item">
          <div class="ability-info">
            <span class="ability-name">概率统计</span>
            <span class="ability-score">85分</span>
          </div>
          <div class="ability-bar">
            <div class="ability-fill" style="width: 85%"></div>
          </div>
        </div>
        
        <div class="ability-item">
          <div class="ability-info">
            <span class="ability-name">函数分析</span>
            <span class="ability-score">89分</span>
          </div>
          <div class="ability-bar">
            <div class="ability-fill" style="width: 89%"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3 class="section-title">答题统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--correct">
            <svg viewBox="0 0 24 24">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">25</span>
            <span class="stat-label">答对题数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon--incorrect">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">5</span>
            <span class="stat-label">答错题数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon--time">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">38</span>
            <span class="stat-label">用时(分钟)</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon--accuracy">
            <svg viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">83%</span>
            <span class="stat-label">正确率</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="result-actions">
    <button class="btn btn--secondary">
      查看详细报告
    </button>
    <button class="btn btn--primary">
      开始新的评估
    </button>
  </div>
</div>
```

```css
.result-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8);
}

.result-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.result-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-6);
  background: linear-gradient(135deg, var(--success-color), #34d399);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-success {
  width: 40px;
  height: 40px;
  stroke: white;
  fill: none;
  stroke-width: 3;
}

.result-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.result-subtitle {
  font-size: var(--text-lg);
  color: var(--gray-600);
}

.result-summary {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-8);
  margin-bottom: var(--space-8);
}

.score-display {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.score-circle {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.score-progress {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-bg {
  fill: none;
  stroke: var(--gray-200);
  stroke-width: 8;
}

.score-fill {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  display: block;
  font-size: 2.5rem;
  font-weight: var(--font-bold);
  color: var(--gray-900);
  line-height: 1;
}

.score-unit {
  font-size: var(--text-lg);
  color: var(--gray-600);
}

.score-level {
  flex: 1;
}

.level-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
  margin-bottom: var(--space-4);
}

.level-good {
  background: var(--success-color);
  color: white;
}

.level-description {
  font-size: var(--text-base);
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
}

.result-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.detail-section {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-6);
}

.ability-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ability-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ability-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ability-name {
  font-weight: var(--font-medium);
  color: var(--gray-700);
}

.ability-score {
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

.ability-bar {
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: var(--radius-sm);
  transition: width 1s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon--correct {
  background: var(--success-color);
}

.stat-icon--incorrect {
  background: var(--error-color);
}

.stat-icon--time {
  background: var(--info-color);
}

.stat-icon--accuracy {
  background: var(--warning-color);
}

.stat-icon svg {
  width: 20px;
  height: 20px;
  stroke: white;
  fill: white;
  stroke-width: 2;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
}
```

## 4. 页面设计

### 4.1 评估首页

评估首页展示可用的评估项目，支持筛选和搜索功能。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>智能评估系统</title>
  <link rel="stylesheet" href="assessment.css">
</head>
<body>
  <div class="assessment-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">智能评估系统</h1>
          <p class="page-subtitle">科学评估，精准提升</p>
        </div>
        
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">1,234</span>
            <span class="stat-label">累计评估</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">98%</span>
            <span class="stat-label">满意度</span>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 筛选和搜索 -->
    <section class="filter-section">
      <div class="container">
        <div class="filter-bar">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="搜索评估项目..." class="search-input">
          </div>
          
          <div class="filter-controls">
            <select class="filter-select">
              <option value="">所有学科</option>
              <option value="math">数学</option>
              <option value="chinese">语文</option>
              <option value="english">英语</option>
              <option value="physics">物理</option>
            </select>
            
            <select class="filter-select">
              <option value="">所有难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
            
            <select class="filter-select">
              <option value="">所有类型</option>
              <option value="adaptive">适应性测试</option>
              <option value="diagnostic">诊断性评估</option>
              <option value="practice">练习测试</option>
            </select>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 评估列表 -->
    <main class="assessment-list">
      <div class="container">
        <div class="assessment-grid">
          <!-- 评估卡片组件会在这里重复 -->
          <!-- 这里使用之前定义的 assessment-card 组件 -->
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <button class="pagination-btn pagination-btn--prev" disabled>
            <svg viewBox="0 0 24 24">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
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
            <svg viewBox="0 0 24 24">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

### 4.2 评估进行页

评估进行页面专注于题目展示和答题体验。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>正在评估 - 数学基础能力测试</title>
  <link rel="stylesheet" href="assessment.css">
</head>
<body class="assessment-taking">
  <div class="assessment-layout">
    <!-- 侧边栏 -->
    <aside class="assessment-sidebar">
      <div class="sidebar-header">
        <h3 class="assessment-name">数学基础能力测试</h3>
        <div class="assessment-meta">
          <span class="meta-item">适应性测试</span>
          <span class="meta-item">45分钟</span>
        </div>
      </div>
      
      <div class="question-navigator">
        <h4 class="navigator-title">题目导航</h4>
        <div class="question-grid">
          <button class="question-nav-btn question-nav-btn--completed">1</button>
          <button class="question-nav-btn question-nav-btn--completed">2</button>
          <button class="question-nav-btn question-nav-btn--current">3</button>
          <button class="question-nav-btn">4</button>
          <button class="question-nav-btn">5</button>
          <!-- 更多题目按钮 -->
        </div>
      </div>
      
      <div class="sidebar-actions">
        <button class="btn btn--secondary btn--full">
          暂停评估
        </button>
        <button class="btn btn--warning btn--full">
          提交评估
        </button>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <main class="assessment-main">
      <!-- 这里使用之前定义的 question-container 组件 -->
    </main>
  </div>
  
  <!-- 提交确认弹窗 -->
  <div class="modal-overlay" id="submit-modal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">确认提交评估</h3>
      </div>
      <div class="modal-content">
        <p>您确定要提交当前评估吗？提交后将无法修改答案。</p>
        <div class="submit-stats">
          <div class="submit-stat">
            <span class="submit-stat-label">已完成</span>
            <span class="submit-stat-value">25/30 题</span>
          </div>
          <div class="submit-stat">
            <span class="submit-stat-label">剩余时间</span>
            <span class="submit-stat-value">15:30</span>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn--secondary" onclick="closeModal()">取消</button>
        <button class="btn btn--primary" onclick="submitAssessment()">确认提交</button>
      </div>
    </div>
  </div>
</body>
</html>
```

```css
.assessment-taking {
  background: var(--assessment-bg);
  min-height: 100vh;
}

.assessment-layout {
  display: flex;
  min-height: 100vh;
}

.assessment-sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid var(--gray-200);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: var(--space-8);
}

.assessment-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.assessment-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-item {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.question-navigator {
  flex: 1;
  margin-bottom: var(--space-8);
}

.navigator-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-4);
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}

.question-nav-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--gray-300);
  background: white;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-nav-btn:hover {
  border-color: var(--primary-color);
  background: var(--gray-50);
}

.question-nav-btn--completed {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.question-nav-btn--current {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.btn--warning {
  background: var(--warning-color);
  color: white;
}

.btn--warning:hover {
  background: #d97706;
}

.assessment-main {
  flex: 1;
  margin-left: 300px;
  padding: var(--space-8);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.modal {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal-overlay.active .modal {
  transform: scale(1);
}

.modal-header {
  padding: var(--space-6) var(--space-6) 0;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

.modal-content {
  padding: var(--space-6);
}

.modal-content p {
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.submit-stats {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.submit-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.submit-stat-label {
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-bottom: var(--space-1);
}

.submit-stat-value {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

.modal-actions {
  padding: 0 var(--space-6) var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
```

## 5. 交互设计

### 5.1 评估流程交互

1. **开始评估**
   - 显示评估说明和注意事项
   - 确认开始后进入答题界面
   - 自动保存答题进度

2. **答题交互**
   - 支持键盘快捷键（数字键选择选项）
   - 实时保存答案
   - 提供题目标记功能
   - 显示答题进度和剩余时间

3. **提交评估**
   - 检查未完成题目
   - 确认提交弹窗
   - 提交后立即显示结果

### 5.2 适应性测试交互

1. **动态难度调整**
   - 根据答题情况实时调整题目难度
   - 平滑的难度过渡，避免突然变化
   - 提供难度变化的视觉反馈

2. **智能推荐**
   - 基于答题表现推荐相关学习资源
   - 个性化的学习建议
   - 错题分析和改进建议

### 5.3 无障碍交互

1. **键盘导航**
   - 支持Tab键在界面元素间切换
   - 支持Enter键确认选择
   - 支持方向键在选项间移动

2. **屏幕阅读器支持**
   - 为所有交互元素添加适当的ARIA标签
   - 提供题目和选项的语音描述
   - 支持答题状态的语音反馈

## 6. 响应式设计

### 6.1 断点系统

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* 移动端优先的媒体查询 */
@media (min-width: 640px) {
  /* 小屏幕平板 */
}

@media (min-width: 768px) {
  /* 平板 */
}

@media (min-width: 1024px) {
  /* 桌面 */
}

@media (min-width: 1280px) {
  /* 大屏桌面 */
}
```

### 6.2 移动端适配

```css
/* 移动端评估界面 */
@media (max-width: 768px) {
  .assessment-layout {
    flex-direction: column;
  }
  
  .assessment-sidebar {
    position: static;
    width: 100%;
    height: auto;
    order: 2;
    border-right: none;
    border-top: 1px solid var(--gray-200);
  }
  
  .assessment-main {
    margin-left: 0;
    order: 1;
    padding: var(--space-4);
  }
  
  .question-container {
    margin: 0;
  }
  
  .question-actions {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .question-tools {
    order: -1;
    justify-content: center;
  }
  
  /* 移动端题目选项 */
  .option-item {
    padding: var(--space-3);
  }
  
  .option-text {
    font-size: var(--text-base);
  }
  
  /* 移动端结果页面 */
  .result-details {
    grid-template-columns: 1fr;
  }
  
  .score-display {
    flex-direction: column;
    text-align: center;
    gap: var(--space-6);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
```

## 7. 性能优化

### 7.1 CSS 优化

```css
/* 使用 CSS 自定义属性减少重复 */
.btn {
  /* 使用 transform 而不是改变 position 来实现动画 */
  transform: translateY(0);
  transition: transform 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* 使用 will-change 提示浏览器优化 */
.progress-fill {
  will-change: width;
}

.score-fill {
  will-change: stroke-dashoffset;
}

/* 避免重排的动画属性 */
.modal {
  will-change: transform, opacity;
}
```

### 7.2 图片优化

```css
/* 使用 CSS 渐变替代图片 */
.gradient-bg {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
}

/* SVG 图标优化 */
.icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  display: inline-block;
  vertical-align: middle;
}
```

## 8. 总结

评估系统的 UI/UX 设计注重用户体验和功能实用性：

### 8.1 设计亮点

1. **专注体验**：简洁的界面设计，减少答题时的干扰因素
2. **即时反馈**：清晰的进度指示和状态反馈，增强用户信心
3. **适应性强**：响应式设计支持各种设备和屏幕尺寸
4. **无障碍友好**：完善的键盘导航和屏幕阅读器支持

### 8.2 技术特色

1. **组件化设计**：可复用的组件提高开发效率
2. **CSS 变量系统**：统一的设计令牌确保视觉一致性
3. **性能优化**：使用现代 CSS 技术提升渲染性能
4. **渐进增强**：基础功能在所有浏览器中可用

### 8.3 用户价值

1. **降低认知负荷**：直观的界面设计让用户专注于答题
2. **提升答题效率**：优化的交互流程减少操作时间
3. **增强使用信心**：清晰的反馈和友好的提示
4. **保证评估公平**：统一的界面标准确保评估结果的可比性

这个 UI/UX 设计为评估系统提供了现代化、用户友好的界面体验，能够有效支撑各类评估场景的需求。