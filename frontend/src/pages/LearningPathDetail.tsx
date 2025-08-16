import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Tag, Steps, Button, Row, Col, Spin, Empty, Divider, Rate, Statistic, Tabs } from 'antd';
import { RocketOutlined, BookOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import '../styles/learningPath.css';

const { Title, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

// 类型定义
interface LearningPathStep {
  order: number;
  title: string;
  description: string;
  estimatedTime: number;
  knowledgeId: string;
}

interface Prerequisite {
  id: string;
  title: string;
}

interface RelatedPath {
  id: string;
  title: string;
}

interface Author {
  id: string;
  name: string;
  title: string;
}

interface LearningPathDetail {
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
  prerequisites: Prerequisite[];
  relatedPaths: RelatedPath[];
  author: Author;
  createdAt: string;
}

// 模拟学习路径详情数据
const mockLearningPathDetail = {
  id: '1',
  title: '医学基础知识入门',
  description: '适合医学新生的基础知识学习路径，涵盖解剖学、生理学和生物化学基础知识。通过系统学习，帮助您建立医学知识框架，为后续专业课程打下坚实基础。',
  category: '医学基础',
  difficulty: '初级',
  estimatedTime: 20,
  steps: [
    { 
      order: 1, 
      title: '人体解剖学基础', 
      description: '了解人体主要器官系统的基本结构和功能，掌握解剖学基本术语。',
      estimatedTime: 4,
      knowledgeId: '101' 
    },
    { 
      order: 2, 
      title: '细胞生理学', 
      description: '学习细胞的基本结构和功能，理解细胞膜转运、细胞信号传导等基本生理过程。',
      estimatedTime: 5,
      knowledgeId: '102' 
    },
    { 
      order: 3, 
      title: '生物化学入门', 
      description: '掌握生物大分子的结构和功能，了解基本的代谢途径和能量转换过程。',
      estimatedTime: 6,
      knowledgeId: '103' 
    },
    { 
      order: 4, 
      title: '组织学基础', 
      description: '学习人体基本组织类型的结构特点和功能，为理解器官系统打下基础。',
      estimatedTime: 5,
      knowledgeId: '104' 
    },
  ],
  tags: ['解剖学', '生理学', '生物化学', '组织学'],
  enrolledCount: 128,
  completedCount: 89,
  averageRating: 4.5,
  ratingsCount: 45,
  prerequisites: [
    { id: '201', title: '高中生物学基础' }
  ],
  relatedPaths: [
    { id: '2', title: '人体解剖学进阶' },
    { id: '3', title: '生理学系统学习' }
  ],
  author: {
    id: '001',
    name: '张教授',
    title: '医学院解剖学教授'
  },
  createdAt: '2023-05-15'
};

const LearningPathDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [learningPath, setLearningPath] = useState<LearningPathDetail | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [enrolled, setEnrolled] = useState<boolean>(false);
  
  // 模拟获取学习路径详情
  useEffect(() => {
    setLoading(true);
    // 模拟API请求延迟
    setTimeout(() => {
      setLearningPath(mockLearningPathDetail);
      setLoading(false);
    }, 800);
  }, [id]);
  
  // 处理报名
  const handleEnroll = () => {
    setEnrolled(true);
  };
  

  
  // 处理下一步
  const handleNextStep = () => {
    if (learningPath && currentStep < learningPath.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // 处理上一步
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
  
  if (!learningPath) {
    return <Empty description="未找到学习路径" />;
  }
  
  return (
    <div className="learning-path-detail-container">
      <Link to="/learning-path" className="back-link">
        <ArrowLeftOutlined /> 返回学习路径列表
      </Link>
      
      <Card className="learning-path-detail-card">
        <div className="learning-path-detail-header">
          <Title level={2}>
            <RocketOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            {learningPath.title}
          </Title>
          
          <div className="learning-path-tags">
            <Tag color="blue">{learningPath.category}</Tag>
            <Tag color="green">{learningPath.difficulty}</Tag>
            {learningPath.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </div>
          
          <Paragraph>{learningPath.description}</Paragraph>
        </div>
        
        <Row gutter={[24, 24]} className="learning-path-stats">
          <Col xs={12} sm={6}>
            <Statistic 
              title="预计学时" 
              value={learningPath.estimatedTime} 
              suffix="小时" 
              prefix={<ClockCircleOutlined />} 
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="已报名" 
              value={learningPath.enrolledCount} 
              prefix={<UserOutlined />} 
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="已完成" 
              value={learningPath.completedCount} 
              prefix={<CheckCircleOutlined />} 
            />
          </Col>
          <Col xs={12} sm={6}>
            <div className="rating-statistic">
              <div className="statistic-title">评分</div>
              <div className="statistic-content">
                <Rate disabled defaultValue={learningPath.averageRating} style={{ fontSize: 16 }} />
                <span className="rating-count">({learningPath.ratingsCount})</span>
              </div>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <Tabs defaultActiveKey="steps">
          <TabPane tab="学习步骤" key="steps">
            <div className="learning-path-steps-container">
              <Steps 
                current={currentStep} 
                direction="vertical"
                className="learning-path-steps"
              >
                {learningPath.steps.map((step) => (
                  <Step 
                    key={step.order} 
                    title={`${step.order}. ${step.title}`}
                    description={
                      <div>
                        <div>{step.description}</div>
                        <div className="step-meta">
                          <span><ClockCircleOutlined /> {step.estimatedTime} 小时</span>
                          <Link to={`/knowledge/${step.knowledgeId}`} className="view-knowledge-link">
                            <BookOutlined /> 查看知识点
                          </Link>
                        </div>
                      </div>
                    }
                  />
                ))}
              </Steps>
              
              <div className="step-navigation">
                {enrolled ? (
                  <>
                    <Button 
                      type="default" 
                      onClick={handlePrevStep} 
                      disabled={currentStep === 0}
                    >
                      上一步
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={handleNextStep} 
                      disabled={currentStep === learningPath.steps.length - 1}
                    >
                      下一步
                    </Button>
                  </>
                ) : (
                  <Button type="primary" onClick={handleEnroll} block>
                    报名学习
                  </Button>
                )}
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="课程信息" key="info">
            <div className="course-info">
              <div className="info-section">
                <Title level={4}>课程作者</Title>
                <div className="author-info">
                  <UserOutlined className="author-avatar" />
                  <div className="author-details">
                    <div className="author-name">{learningPath.author.name}</div>
                    <div className="author-title">{learningPath.author.title}</div>
                  </div>
                </div>
              </div>
              
              <div className="info-section">
                <Title level={4}>先修要求</Title>
                {learningPath.prerequisites.length > 0 ? (
                  <ul className="prerequisites-list">
                    {learningPath.prerequisites.map((prereq) => (
                      <li key={prereq.id}>{prereq.title}</li>
                    ))}
                  </ul>
                ) : (
                  <Paragraph>无先修要求</Paragraph>
                )}
              </div>
              
              <div className="info-section">
                <Title level={4}>相关学习路径</Title>
                {learningPath.relatedPaths.length > 0 ? (
                  <ul className="related-paths-list">
                    {learningPath.relatedPaths.map((path) => (
                      <li key={path.id}>
                        <Link to={`/learning-path/${path.id}`}>{path.title}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Paragraph>暂无相关学习路径</Paragraph>
                )}
              </div>
              
              <div className="info-section">
                <Title level={4}>创建时间</Title>
                <Paragraph>{learningPath.createdAt}</Paragraph>
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="学习讨论" key="discussion">
            <Empty description="暂无讨论内容" />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default LearningPathDetail;