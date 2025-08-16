# 用户管理 UI/UX 设计

## 版本信息
- **版本号**: 1.0.0
- **最后更新**: 2024-01-15
- **作者**: SiCal设计团队
- **评审人**: UI/UX设计师
- **状态**: 草稿

## 更新日志
- v1.0.0 (2024-01-15): 初始版本，定义用户管理UI/UX设计

---

## 1. 设计概览

### 1.1 设计原则
- **简洁性**: 界面简洁明了，减少用户认知负担
- **一致性**: 保持整个系统的视觉和交互一致性
- **可访问性**: 支持无障碍访问，符合WCAG 2.1标准
- **响应式**: 适配各种设备和屏幕尺寸
- **安全性**: 重要操作提供明确的确认和反馈

### 1.2 设计目标
- 提供直观的用户注册和登录体验
- 简化个人资料管理流程
- 确保安全操作的用户友好性
- 提供清晰的状态反馈和错误提示

### 1.3 目标用户
- **学生用户**: 医学专业学生，年龄18-30岁
- **教师用户**: 医学院教师，年龄25-60岁
- **管理员**: 系统管理人员，年龄25-50岁

## 2. 视觉设计系统

### 2.1 色彩系统
```css
/* 主色调 */
:root {
  /* 品牌色 */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-200: #bae6fd;
  --primary-300: #7dd3fc;
  --primary-400: #38bdf8;
  --primary-500: #0ea5e9;  /* 主品牌色 */
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  --primary-800: #075985;
  --primary-900: #0c4a6e;
  
  /* 辅助色 */
  --secondary-50: #f8fafc;
  --secondary-100: #f1f5f9;
  --secondary-200: #e2e8f0;
  --secondary-300: #cbd5e1;
  --secondary-400: #94a3b8;
  --secondary-500: #64748b;
  --secondary-600: #475569;
  --secondary-700: #334155;
  --secondary-800: #1e293b;
  --secondary-900: #0f172a;
  
  /* 状态色 */
  --success-500: #10b981;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
  --info-500: #3b82f6;
  
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

### 2.2 字体系统
```css
/* 字体族 */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  --font-chinese: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 字体大小 */
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}

/* 字重 */
:root {
  --font-light: 300;
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
  --space-20: 5rem;     /* 80px */
}
```

### 2.4 圆角系统
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;
}
```

### 2.5 阴影系统
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## 3. 组件设计

### 3.1 按钮组件

#### 主要按钮 (Primary Button)
```css
.btn-primary {
  background-color: var(--primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-600);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
  
  &:disabled {
    background-color: var(--gray-300);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}
```

#### 次要按钮 (Secondary Button)
```css
.btn-secondary {
  background-color: transparent;
  color: var(--primary-500);
  border: 1px solid var(--primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-50);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}
```

#### 危险按钮 (Danger Button)
```css
.btn-danger {
  background-color: var(--error-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dc2626;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}
```

### 3.2 输入框组件

#### 基础输入框
```css
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgb(14 165 233 / 0.1);
  }
  
  &.error {
    border-color: var(--error-500);
    
    &:focus {
      box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
    }
  }
  
  &:disabled {
    background-color: var(--gray-50);
    color: var(--gray-500);
    cursor: not-allowed;
  }
}
```

#### 标签和帮助文本
```css
.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.form-help {
  font-size: var(--text-xs);
  color: var(--gray-500);
  margin-top: var(--space-1);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--error-500);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

### 3.3 卡片组件
```css
.card {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}
```

### 3.4 头像组件
```css
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  overflow: hidden;
  background-color: var(--gray-200);
  
  &.size-sm {
    width: 2rem;
    height: 2rem;
    font-size: var(--text-xs);
  }
  
  &.size-md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: var(--text-sm);
  }
  
  &.size-lg {
    width: 4rem;
    height: 4rem;
    font-size: var(--text-lg);
  }
  
  &.size-xl {
    width: 6rem;
    height: 6rem;
    font-size: var(--text-2xl);
  }
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## 4. 页面设计

### 4.1 登录页面

#### 布局结构
```html
<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <img src="/logo.svg" alt="SiCal" class="logo" />
      <h1>欢迎回来</h1>
      <p>登录您的SiCal账户</p>
    </div>
    
    <form class="login-form">
      <div class="form-group">
        <label class="form-label">邮箱地址</label>
        <input type="email" class="input-field" placeholder="请输入邮箱地址" />
      </div>
      
      <div class="form-group">
        <label class="form-label">密码</label>
        <div class="password-input">
          <input type="password" class="input-field" placeholder="请输入密码" />
          <button type="button" class="password-toggle">
            <i class="icon-eye"></i>
          </button>
        </div>
      </div>
      
      <div class="form-options">
        <label class="checkbox">
          <input type="checkbox" />
          <span>记住我</span>
        </label>
        <a href="/forgot-password" class="forgot-link">忘记密码？</a>
      </div>
      
      <button type="submit" class="btn-primary btn-full">登录</button>
    </form>
    
    <div class="login-footer">
      <p>还没有账户？ <a href="/register">立即注册</a></p>
    </div>
  </div>
</div>
```

#### 样式定义
```css
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
  padding: var(--space-4);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: var(--space-8) var(--space-6) var(--space-6);
}

.logo {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-4);
}

.login-header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.login-header p {
  color: var(--gray-600);
  font-size: var(--text-sm);
}

.login-form {
  padding: 0 var(--space-6) var(--space-6);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.forgot-link {
  color: var(--primary-500);
  text-decoration: none;
  font-size: var(--text-sm);
  
  &:hover {
    text-decoration: underline;
  }
}

.btn-full {
  width: 100%;
}

.login-footer {
  text-align: center;
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

.login-footer a {
  color: var(--primary-500);
  text-decoration: none;
  font-weight: var(--font-medium);
  
  &:hover {
    text-decoration: underline;
  }
}
```

### 4.2 注册页面

#### 多步骤注册流程
```html
<div class="register-container">
  <div class="register-card">
    <div class="register-header">
      <img src="/logo.svg" alt="SiCal" class="logo" />
      <h1>创建账户</h1>
      <div class="progress-bar">
        <div class="progress-step active">1</div>
        <div class="progress-line"></div>
        <div class="progress-step">2</div>
        <div class="progress-line"></div>
        <div class="progress-step">3</div>
      </div>
    </div>
    
    <!-- 步骤1: 基本信息 -->
    <div class="register-step" data-step="1">
      <h2>基本信息</h2>
      <form class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">真实姓名</label>
            <input type="text" class="input-field" placeholder="请输入真实姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" class="input-field" placeholder="请输入用户名" />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">邮箱地址</label>
          <input type="email" class="input-field" placeholder="请输入邮箱地址" />
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input type="password" class="input-field" placeholder="请输入密码" />
          <div class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill"></div>
            </div>
            <span class="strength-text">密码强度：弱</span>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input type="password" class="input-field" placeholder="请再次输入密码" />
        </div>
        
        <button type="button" class="btn-primary btn-full">下一步</button>
      </form>
    </div>
    
    <!-- 步骤2: 个人资料 -->
    <div class="register-step hidden" data-step="2">
      <h2>个人资料</h2>
      <form class="register-form">
        <div class="form-group">
          <label class="form-label">所属机构</label>
          <select class="input-field">
            <option value="">请选择机构</option>
            <option value="university1">北京大学医学部</option>
            <option value="university2">清华大学医学院</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">专业方向</label>
          <select class="input-field">
            <option value="">请选择专业</option>
            <option value="clinical">临床医学</option>
            <option value="nursing">护理学</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">学习阶段</label>
          <div class="radio-group">
            <label class="radio">
              <input type="radio" name="stage" value="undergraduate" />
              <span>本科生</span>
            </label>
            <label class="radio">
              <input type="radio" name="stage" value="graduate" />
              <span>研究生</span>
            </label>
            <label class="radio">
              <input type="radio" name="stage" value="doctor" />
              <span>博士生</span>
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary">上一步</button>
          <button type="button" class="btn-primary">下一步</button>
        </div>
      </form>
    </div>
    
    <!-- 步骤3: 验证邮箱 -->
    <div class="register-step hidden" data-step="3">
      <div class="verification-content">
        <div class="verification-icon">
          <i class="icon-mail"></i>
        </div>
        <h2>验证邮箱</h2>
        <p>我们已向 <strong>user@example.com</strong> 发送了验证邮件</p>
        <p>请检查您的邮箱并点击验证链接完成注册</p>
        
        <div class="verification-actions">
          <button type="button" class="btn-secondary">重新发送</button>
          <button type="button" class="btn-primary">前往邮箱</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 4.3 个人资料页面

#### 页面布局
```html
<div class="profile-container">
  <div class="profile-header">
    <div class="profile-cover">
      <button class="cover-edit-btn">
        <i class="icon-camera"></i>
      </button>
    </div>
    
    <div class="profile-info">
      <div class="avatar-section">
        <div class="avatar size-xl">
          <img src="/avatars/user.jpg" alt="用户头像" />
        </div>
        <button class="avatar-edit-btn">
          <i class="icon-camera"></i>
        </button>
      </div>
      
      <div class="user-info">
        <h1>张三</h1>
        <p>@zhangsan</p>
        <div class="user-meta">
          <span class="meta-item">
            <i class="icon-institution"></i>
            北京大学医学部
          </span>
          <span class="meta-item">
            <i class="icon-major"></i>
            临床医学
          </span>
          <span class="meta-item">
            <i class="icon-calendar"></i>
            加入于 2024年1月
          </span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="profile-content">
    <div class="profile-nav">
      <nav class="tab-nav">
        <button class="tab-item active">基本信息</button>
        <button class="tab-item">安全设置</button>
        <button class="tab-item">隐私设置</button>
        <button class="tab-item">通知设置</button>
      </nav>
    </div>
    
    <!-- 基本信息标签页 -->
    <div class="tab-content active" data-tab="basic">
      <div class="settings-section">
        <h3>个人信息</h3>
        <form class="settings-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">真实姓名</label>
              <input type="text" class="input-field" value="张三" />
            </div>
            <div class="form-group">
              <label class="form-label">昵称</label>
              <input type="text" class="input-field" value="小张" />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea class="input-field" rows="3" placeholder="介绍一下自己..."></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">性别</label>
              <select class="input-field">
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">生日</label>
              <input type="date" class="input-field" value="1995-06-15" />
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">保存更改</button>
          </div>
        </form>
      </div>
      
      <div class="settings-section">
        <h3>联系信息</h3>
        <form class="settings-form">
          <div class="form-group">
            <label class="form-label">邮箱地址</label>
            <div class="input-with-status">
              <input type="email" class="input-field" value="zhang@example.com" readonly />
              <span class="status-badge verified">已验证</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">手机号码</label>
            <div class="input-with-action">
              <input type="tel" class="input-field" placeholder="请输入手机号" />
              <button type="button" class="btn-secondary btn-sm">验证</button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">保存更改</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 安全设置标签页 -->
    <div class="tab-content" data-tab="security">
      <div class="settings-section">
        <h3>密码设置</h3>
        <form class="settings-form">
          <div class="form-group">
            <label class="form-label">当前密码</label>
            <input type="password" class="input-field" placeholder="请输入当前密码" />
          </div>
          
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input type="password" class="input-field" placeholder="请输入新密码" />
          </div>
          
          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <input type="password" class="input-field" placeholder="请再次输入新密码" />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">更新密码</button>
          </div>
        </form>
      </div>
      
      <div class="settings-section">
        <h3>双因子认证</h3>
        <div class="security-option">
          <div class="option-info">
            <h4>短信验证</h4>
            <p>通过短信接收验证码</p>
          </div>
          <div class="option-action">
            <label class="switch">
              <input type="checkbox" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
        
        <div class="security-option">
          <div class="option-info">
            <h4>邮箱验证</h4>
            <p>通过邮箱接收验证码</p>
          </div>
          <div class="option-action">
            <label class="switch">
              <input type="checkbox" checked />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>活跃会话</h3>
        <div class="session-list">
          <div class="session-item current">
            <div class="session-info">
              <div class="session-device">
                <i class="icon-desktop"></i>
                <span>Chrome on Windows</span>
                <span class="current-badge">当前设备</span>
              </div>
              <div class="session-meta">
                <span>北京市 • 最后活跃：刚刚</span>
              </div>
            </div>
          </div>
          
          <div class="session-item">
            <div class="session-info">
              <div class="session-device">
                <i class="icon-mobile"></i>
                <span>Safari on iPhone</span>
              </div>
              <div class="session-meta">
                <span>上海市 • 最后活跃：2小时前</span>
              </div>
            </div>
            <div class="session-action">
              <button class="btn-danger btn-sm">终止会话</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 5. 交互设计

### 5.1 表单验证

#### 实时验证
```javascript
// 邮箱格式验证
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 密码强度验证
function validatePasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  if (score < 3) return { strength: 'weak', color: 'error' };
  if (score < 4) return { strength: 'medium', color: 'warning' };
  return { strength: 'strong', color: 'success' };
}

// 表单验证状态更新
function updateFieldValidation(field, isValid, message) {
  const formGroup = field.closest('.form-group');
  const errorElement = formGroup.querySelector('.form-error');
  
  if (isValid) {
    field.classList.remove('error');
    if (errorElement) errorElement.remove();
  } else {
    field.classList.add('error');
    if (!errorElement) {
      const error = document.createElement('div');
      error.className = 'form-error';
      error.innerHTML = `<i class="icon-alert"></i> ${message}`;
      formGroup.appendChild(error);
    } else {
      errorElement.innerHTML = `<i class="icon-alert"></i> ${message}`;
    }
  }
}
```

#### 验证动画
```css
.input-field {
  transition: all 0.2s ease;
  
  &.error {
    border-color: var(--error-500);
    animation: shake 0.5s ease-in-out;
  }
  
  &.success {
    border-color: var(--success-500);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-error {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 5.2 加载状态

#### 按钮加载状态
```css
.btn-loading {
  position: relative;
  color: transparent;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

#### 页面加载骨架
```css
.skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-text {
  height: 1em;
  border-radius: var(--radius-sm);
  
  &.w-full { width: 100%; }
  &.w-3-4 { width: 75%; }
  &.w-1-2 { width: 50%; }
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}
```

### 5.3 通知和反馈

#### Toast 通知
```css
.toast {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  min-width: 300px;
  max-width: 500px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  animation: slideInRight 0.3s ease;
  z-index: 1000;
  
  &.success {
    border-left: 4px solid var(--success-500);
  }
  
  &.error {
    border-left: 4px solid var(--error-500);
  }
  
  &.warning {
    border-left: 4px solid var(--warning-500);
  }
  
  &.info {
    border-left: 4px solid var(--info-500);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: var(--font-medium);
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.toast-message {
  color: var(--gray-600);
  font-size: var(--text-sm);
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: var(--gray-600);
  }
}
```

## 6. 响应式设计

### 6.1 断点系统
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 移动端优先的媒体查询 */
@media (min-width: 640px) {
  .sm\:hidden { display: none; }
  .sm\:block { display: block; }
}

@media (min-width: 768px) {
  .md\:flex { display: flex; }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:max-w-4xl { max-width: 56rem; }
}
```

### 6.2 移动端适配
```css
/* 登录页面移动端适配 */
@media (max-width: 640px) {
  .login-container {
    padding: var(--space-2);
  }
  
  .login-card {
    border-radius: var(--radius-lg);
  }
  
  .login-header {
    padding: var(--space-6) var(--space-4) var(--space-4);
  }
  
  .login-form {
    padding: 0 var(--space-4) var(--space-4);
  }
}

/* 个人资料页面移动端适配 */
@media (max-width: 768px) {
  .profile-content {
    padding: var(--space-4);
  }
  
  .tab-nav {
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .session-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}
```

## 7. 无障碍设计

### 7.1 键盘导航
```css
/* 焦点样式 */
*:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-500);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: var(--radius-md);
  z-index: 1000;
  
  &:focus {
    top: 6px;
  }
}

/* 键盘导航指示器 */
.keyboard-navigation .btn:focus,
.keyboard-navigation .input-field:focus {
  box-shadow: 0 0 0 3px rgb(14 165 233 / 0.3);
}
```

### 7.2 屏幕阅读器支持
```html
<!-- ARIA 标签示例 -->
<form role="form" aria-labelledby="login-title">
  <h1 id="login-title">用户登录</h1>
  
  <div class="form-group">
    <label for="email" class="form-label">邮箱地址</label>
    <input 
      type="email" 
      id="email" 
      class="input-field"
      aria-required="true"
      aria-describedby="email-error"
      aria-invalid="false"
    />
    <div id="email-error" class="form-error" aria-live="polite"></div>
  </div>
  
  <button type="submit" aria-describedby="login-help">
    登录
  </button>
  <div id="login-help" class="sr-only">
    点击此按钮提交登录表单
  </div>
</form>

<!-- 屏幕阅读器专用文本 -->
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 8. 性能优化

### 8.1 CSS 优化
```css
/* 使用 CSS 自定义属性减少重复 */
.btn {
  --btn-padding-x: var(--space-4);
  --btn-padding-y: var(--space-3);
  --btn-border-radius: var(--radius-md);
  
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-border-radius);
  transition: all 0.2s ease;
}

/* 避免昂贵的 CSS 属性 */
.optimized-shadow {
  /* 使用 transform 而不是 box-shadow 做动画 */
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

/* 使用 will-change 提示浏览器优化 */
.animated-element {
  will-change: transform;
}

.animated-element:hover {
  will-change: auto;
}
```

### 8.2 图片优化
```html
<!-- 响应式图片 -->
<picture>
  <source 
    media="(min-width: 768px)" 
    srcset="/images/avatar-large.webp 1x, /images/avatar-large@2x.webp 2x"
    type="image/webp"
  >
  <source 
    media="(min-width: 768px)" 
    srcset="/images/avatar-large.jpg 1x, /images/avatar-large@2x.jpg 2x"
    type="image/jpeg"
  >
  <source 
    srcset="/images/avatar-small.webp 1x, /images/avatar-small@2x.webp 2x"
    type="image/webp"
  >
  <img 
    src="/images/avatar-small.jpg" 
    srcset="/images/avatar-small@2x.jpg 2x"
    alt="用户头像"
    loading="lazy"
    width="40"
    height="40"
  >
</picture>
```

## 9. 设计规范

### 9.1 组件命名规范
```css
/* BEM 命名方法 */
.component-name { /* 块 */ }
.component-name__element { /* 元素 */ }
.component-name--modifier { /* 修饰符 */ }

/* 示例 */
.user-card { }
.user-card__avatar { }
.user-card__name { }
.user-card__bio { }
.user-card--featured { }
.user-card--compact { }
```

### 9.2 状态类命名
```css
/* 状态类使用 is- 前缀 */
.is-active { }
.is-disabled { }
.is-loading { }
.is-hidden { }
.is-visible { }

/* 工具类使用功能描述 */
.text-center { text-align: center; }
.flex { display: flex; }
.hidden { display: none; }
.sr-only { /* 屏幕阅读器专用 */ }
```

### 9.3 设计令牌
```javascript
// 设计令牌定义
const designTokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      900: '#0c4a6e'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px'
    }
  }
};
```

## 10. 测试和验证

### 10.1 可用性测试清单
- [ ] 表单填写流程是否顺畅
- [ ] 错误提示是否清晰易懂
- [ ] 加载状态是否有适当反馈
- [ ] 移动端操作是否便捷
- [ ] 键盘导航是否完整
- [ ] 屏幕阅读器是否可用

### 10.2 性能测试指标
- [ ] 首次内容绘制 (FCP) < 1.5s
- [ ] 最大内容绘制 (LCP) < 2.5s
- [ ] 首次输入延迟 (FID) < 100ms
- [ ] 累积布局偏移 (CLS) < 0.1

### 10.3 兼容性测试
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+
- [ ] iOS Safari 14+
- [ ] Android Chrome 90+

---

本文档定义了用户管理功能的完整UI/UX设计规范，包括视觉系统、组件设计、页面布局、交互模式等各个方面，为开发团队提供了详细的设计指导。