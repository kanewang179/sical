import React from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Drawer } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  BookOutlined,
  EyeOutlined,
  RocketOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import '../styles/layout.css';

const { Header, Content, Footer, Sider } = AntLayout;

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // 模拟登录状态

  // 检测屏幕尺寸
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 菜单项
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/knowledge',
      icon: <BookOutlined />,
      label: <Link to="/knowledge">知识库</Link>,
    },
    {
      key: '/visualization',
      icon: <EyeOutlined />,
      label: <Link to="/visualization">可视化学习</Link>,
    },
    {
      key: '/learning-path',
      icon: <RocketOutlined />,
      label: <Link to="/learning-path">学习路径</Link>,
    },
    {
      key: '/assessment',
      icon: <FileTextOutlined />,
      label: <Link to="/assessment">测评</Link>,
    },
    {
      key: '/community',
      icon: <TeamOutlined />,
      label: <Link to="/community">社区</Link>,
    },
  ];

  // 用户下拉菜单
  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      setIsLoggedIn(false);
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  const handleMenuClick = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          className="sidebar"
        >
          <div className="logo">
            <h1>{collapsed ? 'S' : 'SiCal'}</h1>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="sidebar-menu"
          />
        </Sider>
      )}
      
      {/* 移动端抽屉菜单 */}
      <Drawer
        title={
          <div className="logo">
            <h1>SiCal</h1>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ 
          background: 'var(--primary-color)', 
          borderBottom: 'none',
          padding: '16px 24px'
        }}
        closeIcon={<CloseOutlined style={{ color: 'white' }} />}
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Drawer>
      
      <AntLayout>
        <Header className="header">
          <div className="header-content">
            {/* 移动端菜单按钮 */}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleMobileMenu}
                style={{ 
                  color: 'var(--primary-color)',
                  fontSize: '18px',
                  padding: '4px 8px'
                }}
              />
            )}
            <div className="header-title">医学与药学可视化学习系统</div>
            <div className="header-right">
              {isLoggedIn ? (
                <Dropdown
                  menu={{ items: userMenu, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                >
                  <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                </Dropdown>
              ) : (
                <Button 
                  type="primary" 
                  onClick={() => navigate('/login')}
                  size={isMobile ? 'small' : 'middle'}
                >
                  {isMobile ? '登录' : '登录/注册'}
                </Button>
              )}
            </div>
          </div>
        </Header>
        <Content className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          SiCal 医学与药学可视化学习系统 ©{new Date().getFullYear()} 版权所有
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;