import { Typography, Card, Row, Col, Button, Space } from 'antd';
import { BookOutlined, EyeOutlined, RocketOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const { Title, Paragraph } = Typography;



const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: '知识库管理',
      icon: <BookOutlined className="feature-icon" />,
      description: '系统化整理医学和药学知识，提供结构化的学习内容',
      link: '/knowledge'
    },
    {
      title: '可视化学习',
      icon: <EyeOutlined className="feature-icon" />,
      description: '通过3D模型和交互式图表直观展示医学和药学知识',
      link: '/visualization'
    },
    {
      title: '学习路径规划',
      icon: <RocketOutlined className="feature-icon" />,
      description: '根据学习目标和进度，智能推荐个性化学习路径',
      link: '/learning-path'
    },
    {
      title: '互动测评',
      icon: <FileTextOutlined className="feature-icon" />,
      description: '提供多样化的测试和评估，帮助巩固学习成果',
      link: '/assessment'
    },
    {
      title: '社区互动',
      icon: <TeamOutlined className="feature-icon" />,
      description: '与其他学习者交流讨论，分享学习经验和资源',
      link: '/community'
    }
  ];

  return (
    <div className="home-container">
      <div className="hero-section">
        <Title level={1}>SiCal 医学与药学可视化学习系统</Title>
        <Paragraph className="hero-description">
          通过先进的可视化技术和交互式学习体验，让医学和药学知识学习更加直观、高效、有趣
        </Paragraph>
        <Space>
          <Button type="primary" size="large" onClick={() => navigate('/knowledge')}>
            开始学习
          </Button>
          <Button size="large" onClick={() => navigate('/visualization')}>
            探索可视化
          </Button>
        </Space>
      </div>

      <div className="features-section">
        <Title level={2} className="section-title">核心功能</Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card 
                className="feature-card" 
                hoverable 
                onClick={() => navigate(feature.link)}
              >
                <div className="feature-icon-container">{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="about-section">
        <Title level={2} className="section-title">关于 SiCal</Title>
        <Paragraph>
          SiCal 是一个专为医学和药学学习者设计的可视化学习系统，旨在通过现代化的技术手段，
          将抽象复杂的医学和药学知识转化为直观易懂的可视化内容，帮助学习者更高效地掌握专业知识。
          系统集成了知识库管理、3D可视化、学习路径规划、互动测评和社区互动等功能，
          为医学和药学学习提供全方位的支持。
        </Paragraph>
      </div>
    </div>
  );
};

export default Home;