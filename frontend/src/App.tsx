import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 页面组件
import Layout from './components/Layout';
import Home from './pages/Home';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeDetail from './pages/KnowledgeDetail';
import Visualization from './pages/Visualization';
import LearningPath from './pages/LearningPath';
import LearningPathDetail from './pages/LearningPathDetail';
import Assessment from './pages/Assessment';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 公开路由 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="knowledge" element={<KnowledgeBase />} />
          <Route path="knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="visualization" element={<Visualization />} />
          <Route path="learning-path" element={<LearningPath />} />
          <Route path="learning-path/:id" element={<LearningPathDetail />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="community" element={<Community />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;