import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import authService from '../services/auth';

// 创建认证上下文
const AuthContext = createContext();

// 认证上下文提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化时检查用户是否已登录
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // 从本地存储获取用户信息
          const userData = authService.getUser();
          if (userData) {
            setUser(userData);
          } else {
            // 如果本地没有用户信息但有token，尝试从服务器获取
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.error('初始化认证失败:', err);
        authService.logout(); // 出错时清除认证信息
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录方法
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.data);
      message.success('登录成功！');
      return response;
    } catch (err) {
      setError(err.message || '登录失败，请检查您的凭证');
      message.error(err.message || '登录失败，请检查您的凭证');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 注册方法
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      message.success('注册成功！请登录');
      return response;
    } catch (err) {
      setError(err.message || '注册失败，请稍后再试');
      message.error(err.message || '注册失败，请稍后再试');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    authService.logout();
    setUser(null);
    message.success('已成功登出');
  };

  // 上下文值
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子，用于在组件中访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

export default AuthContext;