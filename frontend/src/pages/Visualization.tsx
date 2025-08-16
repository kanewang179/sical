import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Tabs, Select, Spin, Empty, Button, Divider } from 'antd';
import { LineChartOutlined, PieChartOutlined, RadarChartOutlined, NodeIndexOutlined, ExperimentOutlined, HeartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
// 使用Echarts进行可视化
import ReactECharts from 'echarts-for-react';
import knowledgeService from '../services/knowledge';
import { Knowledge } from '../services/knowledge';
// 导入样式
import '../styles/visualization.css';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Visualization: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);
  const [visualizationType, setVisualizationType] = useState<string>('anatomy');
  const [activeTab, setActiveTab] = useState<string>('anatomy');
  
  // 获取知识点列表
  const fetchKnowledgeList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: visualizationType,
        limit: 50,
        sort: '-views'
      };
      
      const response = await knowledgeService.getAll(params);
      setKnowledgeList(response.data);
      
      // 默认选择第一个知识点
      if (response.data.length > 0 && !selectedKnowledge) {
        setSelectedKnowledge(response.data[0]);
      }
    } catch (err) {
      setError('获取知识点数据失败，请稍后再试');
      console.error('获取知识点数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和可视化类型变化时获取数据
  useEffect(() => {
    fetchKnowledgeList();
  }, [visualizationType]);

  // 处理知识点选择
  const handleKnowledgeChange = (value: string) => {
    const selected = knowledgeList.find(k => k.id === value);
    setSelectedKnowledge(selected || null);
  };

  // 处理可视化类型变化
  const handleVisualizationTypeChange = (key: string) => {
    setVisualizationType(key);
    setActiveTab(key);
    setSelectedKnowledge(null);
  };

  // 生成解剖学可视化选项
  const getAnatomyVisualizationOption = () => {
    // 这里是示例数据，实际应用中应该使用selectedKnowledge中的数据
    return {
      title: {
        text: selectedKnowledge?.title || '人体解剖结构'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'tree',
          data: [getAnatomyTreeData()],
          top: '10%',
          left: '8%',
          bottom: '22%',
          right: '20%',
          symbolSize: 7,
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right'
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left'
            }
          },
          emphasis: {
            focus: 'descendant'
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
    };
  };

  // 生成解剖学树形数据
  const getAnatomyTreeData = () => {
    // 示例数据
    return {
      name: '人体',
      children: [
        {
          name: '循环系统',
          children: [
            { name: '心脏' },
            { name: '动脉' },
            { name: '静脉' },
            { name: '毛细血管' }
          ]
        },
        {
          name: '呼吸系统',
          children: [
            { name: '鼻腔' },
            { name: '咽喉' },
            { name: '气管' },
            { name: '肺' }
          ]
        },
        {
          name: '消化系统',
          children: [
            { name: '口腔' },
            { name: '食道' },
            { name: '胃' },
            { name: '小肠' },
            { name: '大肠' },
            { name: '肝脏' },
            { name: '胰腺' }
          ]
        },
        {
          name: '神经系统',
          children: [
            { name: '大脑' },
            { name: '脊髓' },
            { name: '周围神经' }
          ]
        }
      ]
    };
  };

  // 生成药理学可视化选项
  const getPharmacologyVisualizationOption = () => {
    return {
      title: {
        text: selectedKnowledge?.title || '药物作用机制'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['血药浓度', '药效']
      },
      xAxis: {
        type: 'category',
        data: ['0h', '1h', '2h', '4h', '6h', '8h', '12h', '24h']
      },
      yAxis: [
        {
          type: 'value',
          name: '血药浓度',
          position: 'left',
          axisLabel: {
            formatter: '{value} mg/L'
          }
        },
        {
          type: 'value',
          name: '药效',
          position: 'right',
          axisLabel: {
            formatter: '{value} %'
          }
        }
      ],
      series: [
        {
          name: '血药浓度',
          type: 'line',
          data: [0, 12, 18, 15, 10, 7, 3, 0.5],
          smooth: true
        },
        {
          name: '药效',
          type: 'line',
          yAxisIndex: 1,
          data: [0, 30, 70, 90, 85, 60, 30, 10],
          smooth: true
        }
      ]
    };
  };

  // 生成生理学可视化选项
  const getPhysiologyVisualizationOption = () => {
    return {
      title: {
        text: selectedKnowledge?.title || '生理指标变化'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['心率', '血压', '呼吸频率']
      },
      xAxis: {
        type: 'category',
        data: ['休息', '轻度活动', '中度活动', '剧烈运动', '恢复期']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          name: '心率',
          type: 'line',
          data: [70, 90, 120, 160, 100],
          markPoint: {
            data: [
              { type: 'max', name: '最大值' }
            ]
          }
        },
        {
          name: '血压',
          type: 'line',
          data: [120, 130, 145, 160, 135],
          markPoint: {
            data: [
              { type: 'max', name: '最大值' }
            ]
          }
        },
        {
          name: '呼吸频率',
          type: 'line',
          data: [16, 20, 28, 35, 22],
          markPoint: {
            data: [
              { type: 'max', name: '最大值' }
            ]
          }
        }
      ]
    };
  };

  // 生成病理学可视化选项
  const getPathologyVisualizationOption = () => {
    return {
      title: {
        text: selectedKnowledge?.title || '疾病发展过程'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['症状严重程度', '免疫反应', '治疗效果']
      },
      xAxis: {
        type: 'category',
        data: ['潜伏期', '前驱期', '发作期', '高峰期', '恢复期']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '症状严重程度',
          type: 'bar',
          data: [10, 35, 70, 90, 30]
        },
        {
          name: '免疫反应',
          type: 'bar',
          data: [5, 25, 60, 85, 40]
        },
        {
          name: '治疗效果',
          type: 'bar',
          data: [0, 10, 30, 60, 85]
        }
      ]
    };
  };

  // 生成药物化学可视化选项
  const getPharmChemistryVisualizationOption = () => {
    return {
      title: {
        text: selectedKnowledge?.title || '药物分子结构'
      },
      tooltip: {},
      series: [
        {
          type: 'graph',
          layout: 'force',
          animation: false,
          label: {
            position: 'right',
            formatter: '{b}'
          },
          draggable: true,
          data: getPharmChemistryNodes(),
          links: getPharmChemistryLinks(),
          force: {
            repulsion: 100,
            edgeLength: 50
          }
        }
      ]
    };
  };

  // 生成药物化学节点数据
  const getPharmChemistryNodes = () => {
    // 示例数据 - 简化的阿司匹林分子结构
    return [
      { name: 'C1', symbolSize: 30, category: 0 },
      { name: 'C2', symbolSize: 30, category: 0 },
      { name: 'C3', symbolSize: 30, category: 0 },
      { name: 'C4', symbolSize: 30, category: 0 },
      { name: 'C5', symbolSize: 30, category: 0 },
      { name: 'C6', symbolSize: 30, category: 0 },
      { name: 'C7', symbolSize: 30, category: 0 },
      { name: 'C8', symbolSize: 30, category: 0 },
      { name: 'C9', symbolSize: 30, category: 0 },
      { name: 'O1', symbolSize: 30, category: 1 },
      { name: 'O2', symbolSize: 30, category: 1 },
      { name: 'O3', symbolSize: 30, category: 1 },
      { name: 'O4', symbolSize: 30, category: 1 }
    ];
  };

  // 生成药物化学连接数据
  const getPharmChemistryLinks = () => {
    // 示例数据 - 简化的阿司匹林分子结构连接
    return [
      { source: 'C1', target: 'C2' },
      { source: 'C2', target: 'C3' },
      { source: 'C3', target: 'C4' },
      { source: 'C4', target: 'C5' },
      { source: 'C5', target: 'C6' },
      { source: 'C6', target: 'C1' },
      { source: 'C2', target: 'O1' },
      { source: 'C1', target: 'C7' },
      { source: 'C7', target: 'O2' },
      { source: 'C7', target: 'O3' },
      { source: 'O3', target: 'C8' },
      { source: 'C8', target: 'C9' },
      { source: 'C9', target: 'O4' }
    ];
  };
  
  // 获取当前可视化选项
  const getCurrentVisualizationOption = () => {
    switch (activeTab) {
      case 'anatomy':
        return getAnatomyVisualizationOption();
      case 'pharmacology':
        return getPharmacologyVisualizationOption();
      case 'physiology':
        return getPhysiologyVisualizationOption();
      case 'pathology':
        return getPathologyVisualizationOption();
      case 'pharmchemistry':
        return getPharmChemistryVisualizationOption();
      default:
        return getAnatomyVisualizationOption();
    }
  };

  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <Title level={2}>
          <LineChartOutlined /> 医学与药学可视化学习
        </Title>
        <Paragraph>
          通过交互式可视化深入理解医学与药学知识，提升学习效果
        </Paragraph>
      </div>

      <Card className="visualization-card">
        <Tabs 
          activeKey={activeTab} 
          onChange={handleVisualizationTypeChange}
          tabPosition="left"
          size="large"
        >
          <TabPane 
            tab={<span><NodeIndexOutlined /> 解剖学</span>} 
            key="anatomy"
          >
            <div className="visualization-content">
              <Row gutter={16}>
                <Col span={24} md={6}>
                  <Card title="选择知识点" className="knowledge-selector-card">
                    {loading ? (
                      <Spin />
                    ) : error ? (
                      <div>
                        <p>{error}</p>
                        <Button type="primary" onClick={fetchKnowledgeList}>
                          重试
                        </Button>
                      </div>
                    ) : knowledgeList.length === 0 ? (
                      <Empty description="暂无解剖学知识点" />
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="选择解剖学知识点"
                        onChange={handleKnowledgeChange}
                        value={selectedKnowledge?.id || null}
                      >
                        {knowledgeList.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.title}
                          </Option>
                        ))}
                      </Select>
                    )}
                    
                    {selectedKnowledge && (
                      <div className="knowledge-info">
                        <Divider />
                        <Title level={5}>{selectedKnowledge.title}</Title>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {selectedKnowledge.description}
                        </Paragraph>
                        <Link to={`/knowledge/${selectedKnowledge.id}`}>
                          查看详情
                        </Link>
                      </div>
                    )}
                  </Card>
                </Col>
                
                <Col span={24} md={18}>
                  <Card title="解剖学可视化" className="visualization-chart-card">
                    {selectedKnowledge ? (
                      <ReactECharts 
                        option={getCurrentVisualizationOption()} 
                        style={{ height: '500px', width: '100%' }} 
                      />
                    ) : (
                      <Empty description="请选择知识点以查看可视化内容" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><ExperimentOutlined /> 药理学</span>} 
            key="pharmacology"
          >
            <div className="visualization-content">
              <Row gutter={16}>
                <Col span={24} md={6}>
                  <Card title="选择知识点" className="knowledge-selector-card">
                    {loading ? (
                      <Spin />
                    ) : error ? (
                      <div>
                        <p>{error}</p>
                        <Button type="primary" onClick={fetchKnowledgeList}>
                          重试
                        </Button>
                      </div>
                    ) : knowledgeList.length === 0 ? (
                      <Empty description="暂无药理学知识点" />
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="选择药理学知识点"
                        onChange={handleKnowledgeChange}
                        value={selectedKnowledge?._id || null}
                      >
                        {knowledgeList.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.title}
                          </Option>
                        ))}
                      </Select>
                    )}
                    
                    {selectedKnowledge && (
                      <div className="knowledge-info">
                        <Divider />
                        <Title level={5}>{selectedKnowledge.title}</Title>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {selectedKnowledge.description}
                        </Paragraph>
                        <Link to={`/knowledge/${selectedKnowledge.id}`}>
                          查看详情
                        </Link>
                      </div>
                    )}
                  </Card>
                </Col>
                
                <Col span={24} md={18}>
                  <Card title="药理学可视化" className="visualization-chart-card">
                    {selectedKnowledge ? (
                      <ReactECharts 
                        option={getCurrentVisualizationOption()} 
                        style={{ height: '500px', width: '100%' }} 
                      />
                    ) : (
                      <Empty description="请选择知识点以查看可视化内容" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><HeartOutlined /> 生理学</span>} 
            key="physiology"
          >
            <div className="visualization-content">
              <Row gutter={16}>
                <Col span={24} md={6}>
                  <Card title="选择知识点" className="knowledge-selector-card">
                    {loading ? (
                      <Spin />
                    ) : error ? (
                      <div>
                        <p>{error}</p>
                        <Button type="primary" onClick={fetchKnowledgeList}>
                          重试
                        </Button>
                      </div>
                    ) : knowledgeList.length === 0 ? (
                      <Empty description="暂无生理学知识点" />
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="选择生理学知识点"
                        onChange={handleKnowledgeChange}
                        value={selectedKnowledge?.id || null}
                      >
                        {knowledgeList.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.title}
                          </Option>
                        ))}
                      </Select>
                    )}
                    
                    {selectedKnowledge && (
                      <div className="knowledge-info">
                        <Divider />
                        <Title level={5}>{selectedKnowledge.title}</Title>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {selectedKnowledge.description}
                        </Paragraph>
                        <Link to={`/knowledge/${selectedKnowledge.id}`}>
                          查看详情
                        </Link>
                      </div>
                    )}
                  </Card>
                </Col>
                
                <Col span={24} md={18}>
                  <Card title="生理学可视化" className="visualization-chart-card">
                    {selectedKnowledge ? (
                      <ReactECharts 
                        option={getCurrentVisualizationOption()} 
                        style={{ height: '500px', width: '100%' }} 
                      />
                    ) : (
                      <Empty description="请选择知识点以查看可视化内容" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><PieChartOutlined /> 病理学</span>} 
            key="pathology"
          >
            <div className="visualization-content">
              <Row gutter={16}>
                <Col span={24} md={6}>
                  <Card title="选择知识点" className="knowledge-selector-card">
                    {loading ? (
                      <Spin />
                    ) : error ? (
                      <div>
                        <p>{error}</p>
                        <Button type="primary" onClick={fetchKnowledgeList}>
                          重试
                        </Button>
                      </div>
                    ) : knowledgeList.length === 0 ? (
                      <Empty description="暂无病理学知识点" />
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="选择病理学知识点"
                        onChange={handleKnowledgeChange}
                        value={selectedKnowledge?._id || null}
                      >
                        {knowledgeList.map(item => (
                          <Option key={item._id} value={item._id}>
                            {item.title}
                          </Option>
                        ))}
                      </Select>
                    )}
                    
                    {selectedKnowledge && (
                      <div className="knowledge-info">
                        <Divider />
                        <Title level={5}>{selectedKnowledge.title}</Title>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {selectedKnowledge.description}
                        </Paragraph>
                        <Link to={`/knowledge/${selectedKnowledge._id}`}>
                          查看详情
                        </Link>
                      </div>
                    )}
                  </Card>
                </Col>
                
                <Col span={24} md={18}>
                  <Card title="病理学可视化" className="visualization-chart-card">
                    {selectedKnowledge ? (
                      <ReactECharts 
                        option={getCurrentVisualizationOption()} 
                        style={{ height: '500px', width: '100%' }} 
                      />
                    ) : (
                      <Empty description="请选择知识点以查看可视化内容" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><RadarChartOutlined /> 药物化学</span>} 
            key="pharmchemistry"
          >
            <div className="visualization-content">
              <Row gutter={16}>
                <Col span={24} md={6}>
                  <Card title="选择知识点" className="knowledge-selector-card">
                    {loading ? (
                      <Spin />
                    ) : error ? (
                      <div>
                        <p>{error}</p>
                        <Button type="primary" onClick={fetchKnowledgeList}>
                          重试
                        </Button>
                      </div>
                    ) : knowledgeList.length === 0 ? (
                      <Empty description="暂无药物化学知识点" />
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="选择药物化学知识点"
                        onChange={handleKnowledgeChange}
                        value={selectedKnowledge?._id || null}
                      >
                        {knowledgeList.map(item => (
                          <Option key={item._id} value={item._id}>
                            {item.title}
                          </Option>
                        ))}
                      </Select>
                    )}
                    
                    {selectedKnowledge && (
                      <div className="knowledge-info">
                        <Divider />
                        <Title level={5}>{selectedKnowledge.title}</Title>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {selectedKnowledge.description}
                        </Paragraph>
                        <Link to={`/knowledge/${selectedKnowledge._id}`}>
                          查看详情
                        </Link>
                      </div>
                    )}
                  </Card>
                </Col>
                
                <Col span={24} md={18}>
                  <Card title="药物化学可视化" className="visualization-chart-card">
                    {selectedKnowledge ? (
                      <ReactECharts 
                        option={getCurrentVisualizationOption()} 
                        style={{ height: '500px', width: '100%' }} 
                      />
                    ) : (
                      <Empty description="请选择知识点以查看可视化内容" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );

};

export default Visualization;