"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const error_1 = __importDefault(require("./middleware/error"));
// 加载环境变量
dotenv_1.default.config();
// 导入数据库连接
const db_1 = __importDefault(require("./config/db"));
// 初始化Express应用
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 5000;
// 连接数据库
(0, db_1.default)();
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)('dev'));
// 静态文件服务
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use(express_1.default.static('public'));
// 路由
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/knowledges', require('./routes/knowledgeRoutes'));
app.use('/api/v1/learningpaths', require('./routes/learningPathRoutes'));
app.use('/api/v1/assessments', require('./routes/assessmentRoutes'));
// 评论路由 - 嵌套路由
app.use('/api/v1/knowledges/:knowledgeId/comments', require('./routes/commentRoutes'));
app.use('/api/v1/learningpaths/:learningPathId/comments', require('./routes/commentRoutes'));
app.use('/api/v1/comments', require('./routes/commentRoutes'));
// 根路由
app.get('/', (req, res) => {
    res.json({ message: 'SICAL API 正在运行' });
});
// 错误处理中间件
app.use(error_1.default);
// 启动服务器
const server = app.listen(PORT, () => {
    console.log(`服务器在 ${process.env['NODE_ENV']} 模式下运行，端口: ${PORT}`);
});
// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
    console.log(`错误: ${err.message}`);
    // 关闭服务器并退出进程
    server.close(() => process.exit(1));
});
//# sourceMappingURL=server.js.map