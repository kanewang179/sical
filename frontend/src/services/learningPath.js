import api from './api';

const learningPathService = {
  // 获取所有学习路径
  getAllLearningPaths: async (page = 1, limit = 10, filters = {}) => {
    const { category, difficulty, search } = filters;
    let query = `page=${page}&limit=${limit}`;
    
    if (category) query += `&category=${category}`;
    if (difficulty) query += `&difficulty=${difficulty}`;
    if (search) query += `&search=${search}`;
    
    const response = await api.get(`/api/v1/learningpaths?${query}`);
    return response.data;
  },
  
  // 获取单个学习路径
  getLearningPath: async (id) => {
    const response = await api.get(`/api/v1/learningpaths/${id}`);
    return response.data;
  },
  
  // 获取用户已报名的学习路径
  getUserLearningPaths: async () => {
    const response = await api.get('/api/v1/learningpaths/user/enrolled');
    return response.data;
  },
  
  // 报名学习路径
  enrollLearningPath: async (id) => {
    const response = await api.post(`/api/v1/learningpaths/${id}/enroll`);
    return response.data;
  },
  
  // 完成学习路径
  completeLearningPath: async (id) => {
    const response = await api.post(`/api/v1/learningpaths/${id}/complete`);
    return response.data;
  },
  
  // 评价学习路径
  rateLearningPath: async (id, rating) => {
    const response = await api.post(`/api/v1/learningpaths/${id}/rate`, { rating });
    return response.data;
  },
  
  // 创建学习路径（管理员）
  createLearningPath: async (learningPathData) => {
    const response = await api.post('/api/v1/learningpaths', learningPathData);
    return response.data;
  },
  
  // 更新学习路径（管理员）
  updateLearningPath: async (id, learningPathData) => {
    const response = await api.put(`/api/v1/learningpaths/${id}`, learningPathData);
    return response.data;
  },
  
  // 删除学习路径（管理员）
  deleteLearningPath: async (id) => {
    const response = await api.delete(`/api/v1/learningpaths/${id}`);
    return response.data;
  }
};

export default learningPathService;