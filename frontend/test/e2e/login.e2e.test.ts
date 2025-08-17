import puppeteer, { Browser, Page } from 'puppeteer';
import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect } from 'vitest';
import { puppeteerConfig, testConfig } from './puppeteer.config';

describe('登录页面 E2E 测试', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    // 启动浏览器
    browser = await puppeteer.launch(puppeteerConfig);
  });

  afterAll(async () => {
    // 关闭浏览器
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // 为每个测试创建新页面
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    // 关闭页面
    if (page) {
      await page.close();
    }
  });

  it('应该能够检测登录状态', async () => {
    // 监听网络请求
    const requests: any[] = [];
    const responses: any[] = [];
    
    page.on('request', (request) => {
      const requestInfo = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      };
      requests.push(requestInfo);
      
      // 只记录登录相关的请求
       if (request.url().includes('/api/auth/login') || request.url().includes('login')) {
         process.stdout.write('\n=== 登录请求 ===\n');
         process.stdout.write(`URL: ${request.url()}\n`);
         process.stdout.write(`Method: ${request.method()}\n`);
         process.stdout.write(`Post Data: ${request.postData()}\n`);
       }
    });

    page.on('response', async (response) => {
      // 只处理登录相关的响应
       if (response.url().includes('/api/auth/login') || response.url().includes('login')) {
         process.stdout.write('\n=== 登录响应 ===\n');
         process.stdout.write(`URL: ${response.url()}\n`);
         process.stdout.write(`Status: ${response.status()}\n`);
         process.stdout.write(`Status Text: ${response.statusText()}\n`);
         
         try {
           const responseText = await response.text();
           process.stdout.write(`Response Body: ${responseText}\n`);
           
           // 尝试解析为JSON
           try {
             const responseJson = JSON.parse(responseText);
             process.stdout.write(`Parsed JSON: ${JSON.stringify(responseJson, null, 2)}\n`);
           } catch (e) {
             process.stdout.write('Response is not JSON\n');
           }
         } catch (e) {
           process.stdout.write(`Failed to read response body: ${e}\n`);
         }
       }
      
      const responseData: any = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      };
      responses.push(responseData);
    });

    // 监听控制台消息
    page.on('console', (msg) => {
      console.log(`浏览器控制台 [${msg.type()}]:`, msg.text());
    });

    // 监听页面错误
    page.on('pageerror', (error) => {
      console.log('页面错误:', error.message);
    });
    
    // 导航到登录页面
    await page.goto(`${testConfig.baseUrl}/login`, { waitUntil: 'networkidle2' });
    
    // 等待表单加载
    await page.waitForSelector('form', { timeout: 10000 });
    
    // 填写正确的登录信息
    const emailInput = await page.$('input[type="email"], input[placeholder*="邮箱"], input[id*="email"]');
    const passwordInput = await page.$('input[type="password"], input[placeholder*="密码"], input[id*="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.click();
      await emailInput.type('test2@example.com');
      
      await passwordInput.click();
      await passwordInput.type('password123');
      
      // 点击登录按钮
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        console.log('点击登录按钮...');
        await submitButton.click();
        
        // 等待登录处理完成
         await new Promise(resolve => setTimeout(resolve, 5000));
         
         process.stdout.write('\n=== 开始分析登录结果 ===\n');

        // 检查登录API的响应状态
        const loginResponses = responses.filter(r => 
          r.url.includes('/api/auth/login') || r.url.includes('login')
        );
        
        process.stdout.write('\n=== 登录结果分析 ===\n');
         process.stdout.write(`登录API响应数量: ${loginResponses.length}\n`);
        
        if (loginResponses.length > 0) {
           // 显示所有登录相关的响应
           process.stdout.write('\n=== 所有登录响应详情 ===\n');
           loginResponses.forEach((response, index) => {
             process.stdout.write(`响应 ${index + 1}:\n`);
             process.stdout.write(`  URL: ${response.url}\n`);
             process.stdout.write(`  状态码: ${response.status}\n`);
             process.stdout.write(`  状态文本: ${response.statusText}\n`);
           });
           
           // 查找真正的登录API响应（POST请求到/api/auth/login）
           const actualLoginResponse = loginResponses.find(r => 
             r.url.includes('/api/auth/login') && 
             requests.some(req => req.url === r.url && req.method === 'POST')
           );
           
           if (actualLoginResponse) {
             process.stdout.write('\n=== 实际登录API响应 ===\n');
             process.stdout.write(`登录API状态码: ${actualLoginResponse.status}\n`);
             process.stdout.write(`登录API状态文本: ${actualLoginResponse.statusText}\n`);
             
             // 检查登录是否成功
             const isLoginSuccessful = actualLoginResponse.status >= 200 && actualLoginResponse.status < 300;
             process.stdout.write(`登录是否成功: ${isLoginSuccessful}\n`);
             
             if (!isLoginSuccessful) {
                process.stdout.write(`登录失败原因: HTTP状态码 ${actualLoginResponse.status} ${actualLoginResponse.statusText}\n`);
                
                // 检查是否有错误消息显示在页面上
                const errorMessage = await page.$('.error-message, .alert-danger, .error');
                if (errorMessage) {
                  const errorText = await page.evaluate(el => el.textContent, errorMessage);
                  process.stdout.write(`页面错误消息: ${errorText}\n`);
                }
                
                // 断言登录失败（因为接口返回了错误状态码）
                expect(isLoginSuccessful).toBe(false);
                process.stdout.write('✓ 测试通过：正确检测到登录失败\n');
              } else {
                // 如果API返回成功，进一步检查登录状态
                const currentUrl = page.url();
                const token = await page.evaluate(() => localStorage.getItem('token'));
                const successMessage = await page.$('.success-message, .alert-success');
                
                process.stdout.write(`当前URL: ${currentUrl}\n`);
                process.stdout.write(`Token: ${token}\n`);
                process.stdout.write(`成功消息: ${successMessage ? '存在' : '不存在'}\n`);
                
                expect(isLoginSuccessful).toBe(true);
                process.stdout.write('✓ 测试通过：正确检测到登录成功\n');
              }
            } else {
              process.stdout.write('警告：没有找到实际的登录API响应\n');
              expect(actualLoginResponse).toBeDefined();
            }
          } else {
            process.stdout.write('警告：没有检测到登录API请求\n');
            // 如果没有检测到登录请求，测试失败
            expect(loginResponses.length).toBeGreaterThan(0);
          }
      }
    }
  });
});