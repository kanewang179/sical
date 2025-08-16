import React from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  BookOutlined,
  EyeOutlined,
  RocketOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import '../styles/layout.css';

const { Header, Content, Footer, Sider } = AntLayout;

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // 模拟登录状态

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

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      setIsLoggedIn(false);
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">
          <h1>{collapsed ? 'S' : 'SiCal'}</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <AntLayout>
        <Header className="header">
          <div className="header-content">
            <div className="header-title">医学与药学可视化学习系统</div>
            <div className="header-right">
              {isLoggedIn ? (
                <Dropdown
                  menu={{ items: userMenu, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                >
                  <Avatar icon={<UserOutlined />} />
                </Dropdown>
              ) : (
                <Button type="primary" onClick={() => navigate('/login')}>
                  登录/注册
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