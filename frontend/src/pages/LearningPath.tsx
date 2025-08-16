import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Tag, Rate, Spin, Empty, Select, Pagination, Button, Tabs } from 'antd';
import { RocketOutlined, BookOutlined, UserOutlined, ClockCircleOutlined, StarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../styles/learningPath.css';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface LearningPathStep {
  order: number;
  title: string;
  knowledgeId: string;
}

interface LearningPathData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  steps: LearningPathStep[];
  tags: string[];
  enrolledCount: number;
  completedCount: number;
  averageRating: number;
  ratingsCount: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

interface FiltersState {
  category: string;
  difficulty: string;
}

// 模拟学习路径数据
const mockLearningPaths = [
  {
    id: '1',
    title: '医学基础知识入门',
    description: '适合医学新生的基础知识学习路径，涵盖解剖学、生理学和生物化学基础知识。',
    category: '医学基础',
    difficulty: '初级',
    estimatedTime: 20,
    steps: [
      { order: 1, title: '人体解剖学基础', knowledgeId: '101' },
      { order: 2, title: '细胞生理学', knowledgeId: '102' },
      { order: 3, title: '生物化学入门', knowledgeId: '103' },
    ],
    tags: ['解剖学', '生理学', '生物化学'],
    enrolledCount: 128,
    completedCount: 89,
    averageRating: 4.5,
    ratingsCount: 45
  },
  {
    id: '2',
    title: '药理学基础',
    description: '药学专业学生的药理学基础学习路径，包括药物作用原理、药效学和药代动力学。',
    category: '药理学',
    difficulty: '中级',
    estimatedTime: 30,
    steps: [
      { order: 1, title: '药物作用原理', knowledgeId: '201' },
      { order: 2, title: '药效学基础', knowledgeId: '202' },
      { order: 3, title: '药代动力学', knowledgeId: '203' },
      { order: 4, title: '常见药物分类', knowledgeId: '204' },
    ],
    tags: ['药理学', '药效学', '药代动力学'],
    enrolledCount: 95,
    completedCount: 62,
    averageRating: 4.7,
    ratingsCount: 38
  },
  {
    id: '3',
    title: '临床诊断思维培养',
    description: '针对医学生的临床诊断思维训练，通过案例学习培养临床推理能力。',
    category: '临床医学',
    difficulty: '高级',
    estimatedTime: 45,
    steps: [
      { order: 1, title: '临床思维导论', knowledgeId: '301' },
      { order: 2, title: '症状分析方法', knowledgeId: '302' },
      { order: 3, title: '实验室检查解读', knowledgeId: '303' },
      { order: 4, title: '鉴别诊断技巧', knowledgeId: '304' },
      { order: 5, title: '临床案例分析', knowledgeId: '305' },
    ],
    tags: ['临床医学', '诊断学', '案例分析'],
    enrolledCount: 76,
    completedCount: 41,
    averageRating: 4.8,
    ratingsCount: 32
  },
  {
    id: '4',
    title: '药物化学研究方法',
    description: '面向药学研究生的药物化学研究方法学习路径，包括药物设计、合成和分析方法。',
    category: '药物化学',
    difficulty: '高级',
    estimatedTime: 50,
    steps: [
      { order: 1, title: '药物分子设计基础', knowledgeId: '401' },
      { order: 2, title: '药物合成策略', knowledgeId: '402' },
      { order: 3, title: '药物分析方法', knowledgeId: '403' },
      { order: 4, title: '构效关系研究', knowledgeId: '404' },
      { order: 5, title: '计算机辅助药物设计', knowledgeId: '405' },
    ],
    tags: ['药物化学', '药物设计', '药物合成'],
    enrolledCount: 58,
    completedCount: 29,
    averageRating: 4.6,
    ratingsCount: 24
  },
];

const LearningPath: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [learningPaths, setLearningPaths] = useState<LearningPathData[]>(mockLearningPaths);
  const [filters, setFilters] = useState<FiltersState>({
    category: '',
    difficulty: '',
  });
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 8,
    total: mockLearningPaths.length,
  });
  const [activeTab, setActiveTab] = useState<string>('all');

  // 模拟获取学习路径数据
  const fetchLearningPaths = () => {
    setLoading(true);
    // 模拟API请求延迟
    setTimeout(() => {
      setLearningPaths(mockLearningPaths);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  // 处理类别筛选
  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // 处理难度筛选
  const handleDifficultyChange = (value: string) => {
    setFilters({
      ...filters,
      difficulty: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 渲染学习路径卡片
  const renderLearningPathCard = (learningPath: LearningPathData) => (
    <Card
      hoverable
      className="learning-path-card"
      cover={
        <div className="learning-path-card-cover">
          <RocketOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        </div>
      }
    >
      <Title level={4}>
        <Link to={`/learning-path/${learningPath.id}`}>{learningPath.title}</Link>
      </Title>
      <Paragraph ellipsis={{ rows: 2 }}>{learningPath.description}</Paragraph>
      
      <div className="learning-path-tags">
        <Tag color="blue">{learningPath.category}</Tag>
        <Tag color="green">{learningPath.difficulty}</Tag>
        {learningPath.tags.map((tag: string, index: number) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </div>
      
      <div className="learning-path-meta">
        <div>
          <ClockCircleOutlined /> {learningPath.estimatedTime} 小时
        </div>
        <div>
          <UserOutlined /> {learningPath.enrolledCount} 人已报名
        </div>
        <div>
          <StarOutlined /> 
          <Rate disabled defaultValue={learningPath.averageRating} style={{ fontSize: 12 }} /> 
          ({learningPath.ratingsCount})
        </div>
      </div>
      
      <div className="learning-path-steps">
        <div className="steps-title">学习步骤：</div>
        {learningPath.steps.slice(0, 3).map((step: LearningPathStep) => (
          <div key={step.order} className="step-item">
            <BookOutlined /> {step.order}. {step.title}
          </div>
        ))}
        {learningPath.steps.length > 3 && (
          <div className="more-steps">...更多 {learningPath.steps.length - 3} 个步骤</div>
        )}
      </div>
      
      <Button type="primary" block>
        开始学习
      </Button>
    </Card>
  );

  return (
    <div className="learning-path-container">
      <div className="learning-path-header">
        <Title level={2}>学习路径</Title>
        <Paragraph>
          根据医学和药学领域的知识体系，我们设计了系统化的学习路径，帮助您循序渐进地掌握专业知识。
        </Paragraph>
      </div>

      <Card className="learning-path-filter-card">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部路径" key="all">
            <Row gutter={[16, 16]} className="filter-row">
              <Col xs={24} sm={12} md={8} lg={6}>
                <div className="filter-item">
                  <span className="filter-label">类别：</span>
                  <Select
                    placeholder="选择类别"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={handleCategoryChange}
                    value={filters.category}
                  >
                    <Option value="医学基础">医学基础</Option>
                    <Option value="临床医学">临床医学</Option>
                    <Option value="药理学">药理学</Option>
                    <Option value="药物化学">药物化学</Option>
                    <Option value="药剂学">药剂学</Option>
                    <Option value="综合">综合</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div className="filter-item">
                  <span className="filter-label">难度：</span>
                  <Select
                    placeholder="选择难度"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={handleDifficultyChange}
                    value={filters.difficulty}
                  >
                    <Option value="初级">初级</Option>
                    <Option value="中级">中级</Option>
                    <Option value="高级">高级</Option>
                  </Select>
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="我的学习" key="enrolled">
            <Empty description="您尚未报名任何学习路径" />
          </TabPane>
          <TabPane tab="已完成" key="completed">
            <Empty description="您尚未完成任何学习路径" />
          </TabPane>
        </Tabs>
      </Card>

      <div className="learning-path-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : learningPaths.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {learningPaths.map((learningPath) => (
                <Col xs={24} sm={12} md={8} lg={6} key={learningPath.id}>
                  {renderLearningPathCard(learningPath)}
                </Col>
              ))}
            </Row>
            <div className="pagination-container">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无学习路径" />
        )}
      </div>
    </div>
  );
};

export default LearningPath;