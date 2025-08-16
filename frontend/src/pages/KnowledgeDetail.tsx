import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Rate, Button, Divider, Spin, message, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, StarOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import knowledgeService, { Knowledge, Reference } from '../services/knowledge';

const { Title, Paragraph, Text } = Typography;

const KnowledgeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

  // 获取知识点详情
  const fetchKnowledgeDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await knowledgeService.getById(id);
      setKnowledge(response.data);
    } catch (err) {
      setError('获取知识点详情失败，请稍后再试');
      console.error('获取知识点详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (id) {
      fetchKnowledgeDetail();
    }
  }, [id]);

  // 提交评分
  const handleRateKnowledge = async (value: number) => {
    if (!id) return;
    setUserRating(value);
    setSubmittingRating(true);
    try {
      await knowledgeService.rate(id, value);
      message.success('评分成功！');
      // 重新获取知识点详情，更新平均评分
      fetchKnowledgeDetail();
    } catch (err) {
      message.error('评分失败，请稍后再试');
      console.error('评分失败:', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="knowledge-detail-loading">
        <Spin size="large" />
        <p>加载知识点详情...</p>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="knowledge-detail-error">
        <p>{error}</p>
        <Button type="primary" onClick={fetchKnowledgeDetail}>
          重试
        </Button>
      </div>
    );
  }

  // 如果没有数据
  if (!knowledge) {
    return (
      <div className="knowledge-detail-not-found">
        <p>未找到知识点</p>
        <Link to="/knowledge">
          <Button type="primary">
            <ArrowLeftOutlined /> 返回知识库
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="knowledge-detail-container">
      <Breadcrumb className="knowledge-detail-breadcrumb">
        <Breadcrumb.Item>
          <Link to="/">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/knowledge">知识库</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {knowledge.category}
        </Breadcrumb.Item>
        <Breadcrumb.Item>{knowledge.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="knowledge-detail-card">
        <div className="knowledge-detail-header">
          <Title level={2}>{knowledge.title}</Title>
          
          <div className="knowledge-detail-meta">
            <div className="knowledge-detail-tags">
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
            
            <div className="knowledge-detail-stats">
              <span className="knowledge-detail-rating">
                <StarOutlined /> {knowledge.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="knowledge-detail-views">
                <EyeOutlined /> {knowledge.views || 0} 浏览
              </span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="knowledge-detail-description">
          <Paragraph>{knowledge.description}</Paragraph>
        </div>

        <div className="knowledge-detail-content">
          <div dangerouslySetInnerHTML={{ __html: knowledge.content }} />
        </div>



        {knowledge.relatedKnowledge && knowledge.relatedKnowledge.length > 0 && (
          <div className="knowledge-detail-related">
            <Title level={3}>相关知识</Title>
            <Row gutter={[16, 16]}>
              {knowledge.relatedKnowledge.map((related: Knowledge) => (
                <Col xs={24} sm={12} md={8} key={related.id}>
                  <Card hoverable>
                    <Link to={`/knowledge/${related.id}`}>
                      <Title level={5}>{related.title}</Title>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {related.description}
                      </Paragraph>
                    </Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {knowledge.prerequisites && knowledge.prerequisites.length > 0 && (
          <div className="knowledge-detail-prerequisites">
            <Title level={3}>先修知识</Title>
            <Row gutter={[16, 16]}>
              {knowledge.prerequisites.map((prerequisite: Knowledge) => (
                <Col xs={24} sm={12} md={8} key={prerequisite.id}>
                  <Card hoverable>
                    <Link to={`/knowledge/${prerequisite.id}`}>
                      <Title level={5}>{prerequisite.title}</Title>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {prerequisite.description}
                      </Paragraph>
                    </Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {knowledge.references && knowledge.references.length > 0 && (
          <div className="knowledge-detail-references">
            <Title level={3}>参考资料</Title>
            <ul>
              {knowledge.references.map((reference: Reference, index: number) => (
                <li key={index}>
                  {reference.url ? (
                    <a href={reference.url} target="_blank" rel="noopener noreferrer">
                      {reference.title} <LinkOutlined />
                    </a>
                  ) : (
                    <Text>{reference.title}</Text>
                  )}
                  {reference.authors && (
                    <Text type="secondary"> - {reference.authors}</Text>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Divider />

        <div className="knowledge-detail-rating">
          <Title level={4}>评价此知识点</Title>
          <Rate 
            allowHalf 
            value={userRating} 
            onChange={handleRateKnowledge} 
            disabled={submittingRating} 
          />
          <Text type="secondary"> 
            {userRating ? `您的评分: ${userRating}分` : '点击星星进行评分'}
          </Text>
        </div>

        <div className="knowledge-detail-footer">
          <Link to="/knowledge">
            <Button type="primary">
              <ArrowLeftOutlined /> 返回知识库
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default KnowledgeDetail;