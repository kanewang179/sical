import api from './api';

// 参考资料类型定义
export interface Reference {
  title: string;
  url?: string;
  authors?: string[];
}

// 知识点类型定义
export interface Knowledge {
  id: string;
  _id?: string; // MongoDB格式的ID
  title: string;
  content: string;
  description?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  author: string;
  rating: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  relatedKnowledge?: Knowledge[];
  prerequisites?: Knowledge[];
  references?: Reference[];
}

// 查询参数类型
export interface KnowledgeQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  difficulty?: string;
  search?: string;
}

// 创建/更新知识点数据类型
export interface KnowledgeData {
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

/**
 * 知识库服务
 */
const knowledgeService = {
  /**
   * 获取所有知识点
   */
  getAll: async (params: KnowledgeQueryParams = {}) => {
    try {
      const response = await api.get('/knowledge', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 获取单个知识点
   */
  getById: async (id: string) => {
    try {
      const response = await api.get(`/knowledge/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 按类别获取知识点
   */
  getByCategory: async (category: string, params: KnowledgeQueryParams = {}) => {
    try {
      const response = await api.get(`/knowledge/category/${category}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 搜索知识点
   * @param {string} query - 搜索关键词
   * @param {Object} params - 查询参数
   * @returns {Promise} - 返回搜索结果
   */
  search: async (query: string, params: KnowledgeQueryParams = {}) => {
    try {
      const response = await api.get(`/knowledge/search/${query}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 创建知识点（管理员）
   * @param {Object} knowledgeData - 知识点数据
   * @returns {Promise} - 返回创建结果
   */
  create: async (knowledgeData: KnowledgeData) => {
    try {
      const response = await api.post('/knowledge', knowledgeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 更新知识点（管理员）
   * @param {string} id - 知识点ID
   * @param {Object} knowledgeData - 知识点数据
   * @returns {Promise} - 返回更新结果
   */
  update: async (id: string, knowledgeData: Partial<KnowledgeData>) => {
    try {
      const response = await api.put(`/knowledge/${id}`, knowledgeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 删除知识点（管理员）
   * @param {string} id - 知识点ID
   * @returns {Promise} - 返回删除结果
   */
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/knowledge/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 评价知识点
   * @param {string} id - 知识点ID
   * @param {number} rating - 评分（1-5）
   * @returns {Promise} - 返回评价结果
   */
  rate: async (id: string, rating: number) => {
    try {
      const response = await api.post(`/knowledge/${id}/rate`, { rating });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default knowledgeService;