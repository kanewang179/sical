import { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Pagination, Spin, Empty, Tag, Typography, Rate, Button } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import knowledgeService from '../services/knowledge';
import { Knowledge } from '../services/knowledge';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

interface FiltersState {
  search: string;
  category: string;
  difficulty: string;
}

const KnowledgeBase: React.FC = () => {
  // 状态管理
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 筛选条件
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    category: '',
    difficulty: ''
  });

  // 获取知识点列表
  const fetchKnowledgeList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sort: '-createdAt',
        ...filters
      };
      
      // 移除空值
      Object.keys(params).forEach((key: string) => {
        if (!params[key as keyof typeof params]) delete params[key as keyof typeof params];
      });
      
      const response = await knowledgeService.getAll(params);
      setKnowledgeList(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0
      });
    } catch (err) {
      setError('获取知识库数据失败，请稍后再试');
      console.error('获取知识库数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选条件变化时获取数据
  useEffect(() => {
    fetchKnowledgeList();
  }, [pagination.current, pagination.pageSize, filters]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setFilters({
      ...filters,
      search: value
    });
    setPagination({
      ...pagination,
      current: 1 // 重置到第一页
    });
  };

  // 处理类别筛选
  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value
    });
    setPagination({
      ...pagination,
      current: 1
    });
  };

  // 处理难度筛选
  const handleDifficultyChange = (value: string) => {
    setFilters({
      ...filters,
      difficulty: value
    });
    setPagination({
      ...pagination,
      current: 1
    });
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize
    });
  };

  // 渲染知识点卡片
  const renderKnowledgeCard = (knowledge: Knowledge) => (
    <Card
      key={knowledge._id}
      hoverable
      className="knowledge-card"
      title={
        <Link to={`/knowledge/${knowledge._id}`}>
          <Title level={4}>{knowledge.title}</Title>
        </Link>
      }
    >
      <Paragraph ellipsis={{ rows: 3 }}>{knowledge.description}</Paragraph>
      
      <div className="knowledge-card-footer">
        <div className="knowledge-card-tags">
          {knowledge.category && (
            <Tag color="blue">{knowledge.category}</Tag>
          )}
          {knowledge.difficulty && (
            <Tag color="orange">{knowledge.difficulty}</Tag>
          )}
          {knowledge.tags && knowledge.tags.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        
        <div className="knowledge-card-stats">
          <Rate disabled defaultValue={knowledge.averageRating || 0} allowHalf />
          <span className="knowledge-card-views">
            {knowledge.views || 0} 浏览
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="knowledge-base-container">
      <div className="knowledge-base-header">
        <Title level={2}>
          <BookOutlined /> 医学与药学知识库
        </Title>
        <Paragraph>
          探索丰富的医学与药学知识，通过可视化方式深入理解复杂概念
        </Paragraph>
      </div>

      <div className="knowledge-base-filters">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={10}>
            <Input.Search
              placeholder="搜索知识点"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="选择类别"
              style={{ width: '100%' }}
              allowClear
              onChange={handleCategoryChange}
              size="large"
            >
              <Option value="解剖学">解剖学</Option>
              <Option value="生理学">生理学</Option>
              <Option value="病理学">病理学</Option>
              <Option value="药理学">药理学</Option>
              <Option value="临床医学">临床医学</Option>
              <Option value="药物化学">药物化学</Option>
              <Option value="药剂学">药剂学</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="选择难度"
              style={{ width: '100%' }}
              allowClear
              onChange={handleDifficultyChange}
              size="large"
            >
              <Option value="初级">初级</Option>
              <Option value="中级">中级</Option>
              <Option value="高级">高级</Option>
            </Select>
          </Col>
        </Row>
      </div>

      <div className="knowledge-base-content">
        {loading ? (
          <div className="knowledge-base-loading">
            <Spin size="large" />
            <p>加载知识库数据...</p>
          </div>
        ) : error ? (
          <div className="knowledge-base-error">
            <p>{error}</p>
            <Button type="primary" onClick={fetchKnowledgeList}>
              重试
            </Button>
          </div>
        ) : knowledgeList.length === 0 ? (
          <Empty description="暂无知识点数据" />
        ) : (
          <Row gutter={[16, 16]}>
            {knowledgeList.map(knowledge => (
              <Col xs={24} sm={12} md={8} lg={6} key={knowledge._id}>
                {renderKnowledgeCard(knowledge)}
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div className="knowledge-base-pagination">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePageChange}
          showSizeChanger
          showQuickJumper
          showTotal={total => `共 ${total} 条知识点`}
        />
      </div>
    </div>
  );
};

export default KnowledgeBase;