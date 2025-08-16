import api from './api';

/**
 * 用户认证服务
 */
const authService = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名或邮箱
   * @param {string} credentials.password - 密码
   * @returns {Promise} - 返回登录结果
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.success && response.token) {
        // 保存token到localStorage
        localStorage.setItem('token', response.token);
        // 保存用户信息
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise} - 返回注册结果
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 获取当前登录用户信息
   * @returns {Promise} - 返回用户信息
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 用户登出
   * @returns {void}
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 可以添加调用登出API的逻辑
    // api.post('/auth/logout');
  },

  /**
   * 检查用户是否已登录
   * @returns {boolean} - 是否已登录
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * 获取本地存储的用户信息
   * @returns {Object|null} - 用户信息
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * 请求重置密码
   * @param {string} email - 用户邮箱
   * @returns {Promise} - 返回请求结果
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
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
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;