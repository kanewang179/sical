import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { message } from 'antd';
import authService from '../services/auth';

// 用户类型定义
interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  avatar?: string;
}

// 认证上下文类型定义
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
}

// AuthProvider组件props类型
interface AuthProviderProps {
  children: ReactNode;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证上下文提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
            setUser(currentUser.data);
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
  const login = async (credentials: { email: string; password: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ username: credentials.email, password: credentials.password });
      setUser(response.data);
      message.success('登录成功！');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请检查您的凭证';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 注册方法
  const register = async (userData: { username: string; email: string; password: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      message.success('注册成功！请登录');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败，请稍后再试';
      setError(errorMessage);
      message.error(errorMessage);
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
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

export default AuthContext;