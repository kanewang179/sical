import api, { ApiResponse } from './api';

// 用户类型定义
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 登录凭证类型
export interface LoginCredentials {
  username: string;
  password: string;
}

// 注册数据类型
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  success: boolean;
  token: string;
  data: User;
  message?: string;
}

// 认证服务类型
interface AuthService {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterData) => Promise<ApiResponse<User>>;
  getCurrentUser: () => Promise<ApiResponse<User>>;
  logout: () => void;
  isAuthenticated: () => boolean;
  getUser: () => User | null;
  forgotPassword: (email: string) => Promise<ApiResponse<any>>;
  resetPassword: (token: string, password: string) => Promise<ApiResponse<any>>;
}

/**
 * 用户认证服务
 */
const authService: AuthService = {
  /**
   * 用户登录
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data as LoginResponse;
      if (data.success && data.token) {
        // 保存token到localStorage
        localStorage.setItem('token', data.token);
        // 保存用户信息
        localStorage.setItem('user', JSON.stringify(data.data));
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 用户注册
   */
  register: async (userData: RegisterData): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data as ApiResponse<User>;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 获取当前登录用户信息
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 用户登出
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 可以添加调用登出API的逻辑
    // api.post('/auth/logout');
  },

  /**
   * 检查用户是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * 获取本地存储的用户信息
   */
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * 请求重置密码
   * @param {string} email - 用户邮箱
   * @returns {Promise} - 返回请求结果
   */
  forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data as ApiResponse<any>;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 重置密码
   * @param {string} token - 重置密码令牌
   * @param {string} password - 新密码
   * @returns {Promise} - 返回重置结果
   */
  resetPassword: async (token: string, password: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data as ApiResponse<any>;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;