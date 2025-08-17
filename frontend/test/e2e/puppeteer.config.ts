import puppeteer from 'puppeteer';

// Puppeteer配置
export const puppeteerConfig = {
  // 使用系统已安装的Chrome浏览器
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  
  // 开发环境显示浏览器，生产环境无头模式
  headless: false, // 设置为false以便调试
  
  // 减慢操作速度，便于调试
  slowMo: 100,
  
  // 浏览器启动参数
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ],
  
  // 默认视口大小
  defaultViewport: {
    width: 1280,
    height: 720
  },
  
  // 超时设置
  timeout: 30000
};

// 测试环境配置
export const testConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  
  // 测试用户数据
  testUsers: {
    valid: {
      email: 'test@example.com',
      password: 'Test123456'
    },
    invalid: {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    },
    emptyEmail: {
      email: '',
      password: 'Test123456'
    },
    invalidEmail: {
      email: 'invalid-email',
      password: 'Test123456'
    },
    emptyPassword: {
      email: 'test@example.com',
      password: ''
    }
  },
  
  // 页面选择器
  selectors: {
    // 登录页面
    login: {
      container: '.auth-container',
      card: '.auth-card',
      form: 'form[name="login"]',
      emailInput: 'input[id="email"]',
      passwordInput: 'input[id="password"]',
      submitButton: 'button[type="submit"]',
      title: '.auth-header h2',
      errorMessage: '.ant-message-error',
      successMessage: '.ant-message-success',
      loadingButton: '.ant-btn-loading',
      formError: '.ant-form-item-explain-error'
    }
  }
};

// API模拟响应
export const mockApiResponses = {
  loginSuccess: {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      token: 'mock-jwt-token',
      data: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      },
      message: '登录成功'
    })
  },
  
  loginFailure: {
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({
      success: false,
      error: {
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      }
    })
  }
};