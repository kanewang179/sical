import { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Input, Tag, Space, message } from 'antd';
import { LikeOutlined, MessageOutlined, ShareAltOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
// import Layout from '../components/Layout'; // Layout使用Outlet，不需要手动包装

const { TextArea } = Input;

interface Author {
  name: string;
  avatar: string | null;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: Author;
  tags: string[];
  likes: number;
  comments: number;
  createTime: string;
}

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNewPost, setShowNewPost] = useState<boolean>(false);
  const [newPostContent, setNewPostContent] = useState<string>('');

  // 模拟社区帖子数据
  const mockPosts: Post[] = [
    {
      id: 1,
      title: '机器学习入门心得分享',
      content: '最近开始学习机器学习，想和大家分享一些入门心得。首先要打好数学基础，特别是线性代数和概率论...',
      author: {
        name: '学习者小王',
        avatar: null
      },
      tags: ['机器学习', '入门', '心得'],
      likes: 15,
      comments: 8,
      createTime: '2024-01-15 10:30'
    },
    {
      id: 2,
      title: '深度学习项目实战经验',
      content: '刚完成了一个图像分类项目，使用CNN网络，准确率达到了95%。在这里分享一些实战经验和踩过的坑...',
      author: {
        name: 'AI工程师',
        avatar: null
      },
      tags: ['深度学习', '项目实战', 'CNN'],
      likes: 32,
      comments: 15,
      createTime: '2024-01-14 16:45'
    },
    {
      id: 3,
      title: '推荐几本AI学习的好书',
      content: '给大家推荐几本我觉得很不错的AI学习书籍：《统计学习方法》、《深度学习》、《机器学习实战》...',
      author: {
        name: '书虫小李',
        avatar: null
      },
      tags: ['书籍推荐', '学习资源'],
      likes: 28,
      comments: 12,
      createTime: '2024-01-13 14:20'
    },
    {
      id: 4,
      title: '自然语言处理入门指南',
      content: 'NLP是AI的重要分支，这里整理了一份入门指南，包括基础概念、常用工具和实践项目...',
      author: {
        name: 'NLP研究员',
        avatar: null
      },
      tags: ['NLP', '自然语言处理', '入门指南'],
      likes: 41,
      comments: 20,
      createTime: '2024-01-12 09:15'
    }
  ];

  useEffect(() => {
    setLoading(true);
    // 模拟加载数据
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
    message.success('点赞成功！');
  };

  const handleNewPost = () => {
    if (!newPostContent.trim()) {
      message.warning('请输入帖子内容');
      return;
    }
    
    const newPost = {
      id: posts.length + 1,
      title: '新发布的帖子',
      content: newPostContent,
      author: {
        name: '当前用户',
        avatar: null
      },
      tags: ['新帖子'],
      likes: 0,
      comments: 0,
      createTime: new Date().toLocaleString('zh-CN')
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowNewPost(false);
    message.success('发布成功！');
  };

  return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>学习社区</h2>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowNewPost(!showNewPost)}
            >
              发布帖子
            </Button>
          </div>
          
          {showNewPost && (
            <Card style={{ marginBottom: '16px' }}>
              <TextArea
                placeholder="分享你的学习心得、问题或经验..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                style={{ marginBottom: '12px' }}
              />
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setShowNewPost(false)}>取消</Button>
                  <Button type="primary" onClick={handleNewPost}>发布</Button>
                </Space>
              </div>
            </Card>
          )}
        </div>

        <List
          loading={loading}
          itemLayout="vertical"
          size="large"
          dataSource={posts}
          renderItem={post => (
            <List.Item
              key={post.id}
              actions={[
                <Space key="like" onClick={() => handleLike(post.id)} style={{ cursor: 'pointer' }}>
                  <LikeOutlined />
                  {post.likes}
                </Space>,
                <Space key="comment">
                  <MessageOutlined />
                  {post.comments}
                </Space>,
                <Space key="share">
                  <ShareAltOutlined />
                  分享
                </Space>
              ]}
            >
              <Card>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />} 
                      src={post.author.avatar}
                    />
                  }
                  title={
                    <div>
                      <h3 style={{ margin: 0, marginBottom: '8px' }}>{post.title}</h3>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {post.author.name} · {post.createTime}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <p style={{ margin: '12px 0', lineHeight: '1.6' }}>
                        {post.content}
                      </p>
                      <div>
                        {post.tags.map(tag => (
                          <Tag key={tag} color="blue">{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
  );
};

export default Community;