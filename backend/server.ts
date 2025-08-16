import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import errorHandler from './middleware/error';
import userRoutes from './routes/userRoutes';
import knowledgeRoutes from './routes/knowledgeRoutes';
import learningPathRoutes from './routes/learningPathRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import commentRoutes from './routes/commentRoutes';

// 加载环境变量
dotenv.config();

// 导入数据库连接
import connectDB from './config/db';

// 初始化Express应用
const app = express();
const PORT = process.env['PORT'] || 5000;

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

// 路由
app.use('/api/v1/users', userRoutes);
app.use('/api/auth', userRoutes); // 添加认证路由别名
app.use('/api/v1/knowledges', knowledgeRoutes);
app.use('/api/v1/learningpaths', learningPathRoutes);
app.use('/api/v1/assessments', assessmentRoutes);

// 评论路由 - 嵌套路由
app.use('/api/v1/knowledges/:knowledgeId/comments', commentRoutes);
app.use('/api/v1/learningpaths/:learningPathId/comments', commentRoutes);
app.use('/api/v1/comments', commentRoutes);

// 根路由
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({ message: 'SICAL API 正在运行' });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器在 ${process.env['NODE_ENV']} 模式下运行，端口: ${PORT}`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err: Error) => {
  console.log(`错误: ${err.message}`);
  // 关闭服务器并退出进程
  server.close(() => process.exit(1));
});