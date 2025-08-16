import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 受保护的路由组件
 * 如果用户未登录，将重定向到登录页面
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // 如果认证状态正在加载，可以显示加载指示器
  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  // 如果用户未登录，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 如果用户已登录，渲染子路由
  return <Outlet />;
};

export default ProtectedRoute;