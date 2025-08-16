import { Request } from 'express';
import { Document } from 'mongoose';

// 扩展Express Request接口
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// 通用API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 数据库文档基础接口
export interface BaseDocument extends Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 用户相关类型
export interface IUser extends BaseDocument {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
  };
  progress: {
    completedPaths: string[];
    currentPath?: string;
    totalPoints: number;
  };
  isActive: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

// 知识点相关类型
export interface IKnowledge extends BaseDocument {
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  prerequisites: string[];
  estimatedTime: number;
  author: string;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    views: number;
    likes: number;
    rating: number;
    ratingCount: number;
  };
  resources: {
    type: 'video' | 'image' | 'document' | 'link';
    url: string;
    title: string;
    description?: string;
  }[];
}

// 学习路径相关类型
export interface ILearningPath extends BaseDocument {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  knowledgePoints: {
    knowledge: string;
    order: number;
    isRequired: boolean;
  }[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    enrollments: number;
    completions: number;
    rating: number;
    ratingCount: number;
  };
  prerequisites: string[];
  tags: string[];
}

// 评估相关类型
export interface IAssessment extends BaseDocument {
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'exam';
  questions: {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    explanation?: string;
  }[];
  timeLimit?: number;
  passingScore: number;
  attempts: number;
  knowledgePoints: string[];
  author: string;
  status: 'draft' | 'published' | 'archived';
}

// 评论相关类型
export interface IComment extends BaseDocument {
  content: string;
  author: string;
  target: {
    type: 'knowledge' | 'learningPath' | 'assessment';
    id: string;
  };
  parent?: string;
  replies: string[];
  likes: number;
  isEdited: boolean;
  editedAt?: Date;
}

// 环境变量类型
export interface ProcessEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  REDIS_URL?: string;
  CORS_ORIGIN: string;
}

// 控制器方法类型
export type ControllerMethod = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// 中间件类型
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// 查询参数类型
export interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  author?: string;
  tags?: string;
}

// 分页结果类型
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// JWT载荷类型
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// 错误响应类型
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  stack?: string;
}

// 文件上传类型
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// 邮件选项类型
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

// Redis缓存类型
export interface CacheOptions {
  key: string;
  data: any;
  ttl?: number;
}

// 统计数据类型
export interface Statistics {
  users: {
    total: number;
    active: number;
    new: number;
  };
  knowledge: {
    total: number;
    published: number;
    categories: Record<string, number>;
  };
  learningPaths: {
    total: number;
    published: number;
    enrollments: number;
  };
  assessments: {
    total: number;
    completed: number;
    averageScore: number;
  };
}

// 搜索结果类型
export interface SearchResult<T> {
  results: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
  suggestions?: string[];
}

// 通知类型
export interface INotification extends BaseDocument {
  recipient: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
}

// 活动日志类型
export interface IActivityLog extends BaseDocument {
  user: string;
  action: string;
  resource: {
    type: string;
    id: string;
    name: string;
  };
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

// 系统配置类型
export interface ISystemConfig extends BaseDocument {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  category: string;
  isPublic: boolean;
}

// 备份类型
export interface IBackup extends BaseDocument {
  type: 'full' | 'incremental';
  status: 'pending' | 'running' | 'completed' | 'failed';
  size?: number;
  path?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export {};