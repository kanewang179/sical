import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 设置文件
    setupFiles: ['./test/setup.ts'],
    
    // 包含的测试文件模式
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/**/*.e2e.test.ts'
    ],
    
    // 排除的文件
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
    ],
    
    // 超时设置
    testTimeout: 60000,
    hookTimeout: 60000,
    
    // 并发设置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true // E2E测试使用单线程
      }
    },
    
    // 报告器
    reporters: ['verbose'],
    
    // 控制台输出设置
    silent: false,
    outputFile: undefined,
    logHeapUsage: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        'test/**',
        '**/*.config.*'
      ]
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});