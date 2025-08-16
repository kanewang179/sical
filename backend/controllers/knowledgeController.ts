import Knowledge from '../models/Knowledge';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';
import { Request, Response, NextFunction } from 'express';

// 扩展Request接口以包含用户信息
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// @desc    获取所有知识点
// @route   GET /api/v1/knowledges
// @access  Public
export const getKnowledges = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // 分页
  const page = parseInt((req.query as any)['page'], 10) || 1;
  const limit = parseInt((req.query as any)['limit'], 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Knowledge.countDocuments();

  let query = Knowledge.find().skip(startIndex).limit(limit);

  // 排序
  if ((req.query as any)['sort']) {
    const sortBy = ((req.query as any)['sort'] as string).split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // 执行查询
  const knowledges = await query;

  // 分页信息
  const pagination: any = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: knowledges.length,
    pagination,
    data: knowledges
  });
});

// @desc    获取单个知识点
// @route   GET /api/v1/knowledges/:id
// @access  Public
export const getKnowledge = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const knowledge = await Knowledge.findById((req.params as any)['id']).populate('comments');

  if (!knowledge) {
    return next(
      new ErrorResponse(`未找到ID为${(req.params as any)['id']}的知识点`, 404)
    );
  }

  // 增加浏览次数
  (knowledge as any).views += 1;
  await knowledge.save();

  res.status(200).json({
    success: true,
    data: knowledge
  });
});

// @desc    创建知识点
// @route   POST /api/v1/knowledges
// @access  Private/Admin
export const createKnowledge = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 添加创建者
  req.body.createdBy = (req as any).user.id;

  const knowledge = await Knowledge.create(req.body);

  res.status(201).json({
    success: true,
    data: knowledge
  });
});

// @desc    更新知识点
// @route   PUT /api/v1/knowledges/:id
// @access  Private/Admin
export const updateKnowledge = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let knowledge = await Knowledge.findById((req.params as any)['id']);

  if (!knowledge) {
    return next(
      new ErrorResponse(`未找到ID为${(req.params as any)['id']}的知识点`, 404)
    );
  }

  knowledge = await Knowledge.findByIdAndUpdate((req.params as any)['id'], req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: knowledge
  });
});

// @desc    删除知识点
// @route   DELETE /api/v1/knowledges/:id
// @access  Private/Admin
export const deleteKnowledge = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const knowledge = await Knowledge.findById((req.params as any)['id']);

  if (!knowledge) {
    return next(
      new ErrorResponse(`未找到ID为${(req.params as any)['id']}的知识点`, 404)
    );
  }

  await knowledge.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    按类别获取知识点
// @route   GET /api/v1/knowledges/category/:category
// @access  Public
export const getKnowledgesByCategory = asyncHandler(async (req: any, res: any, next: any) => {
  const knowledges = await Knowledge.find({ category: req.params.category });

  res.status(200).json({
    success: true,
    count: knowledges.length,
    data: knowledges
  });
});

// @desc    搜索知识点
// @route   GET /api/v1/knowledges/search
// @access  Public
export const searchKnowledge = asyncHandler(async (req: any, res: any, next: any) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorResponse('请提供搜索关键词', 400));
  }

  const knowledges = await Knowledge.find({
    $text: { $search: q }
  }).sort({
    score: { $meta: 'textScore' }
  });

  res.status(200).json({
    success: true,
    count: knowledges.length,
    data: knowledges
  });
});

// @desc    评价知识点
// @route   POST /api/v1/knowledges/:id/rate
// @access  Private
export const rateKnowledge = asyncHandler(async (req: any, res: any, next: any) => {
  const { rating } = req.body;

  // 验证评分
  if (!rating || rating < 1 || rating > 5) {
    return next(new ErrorResponse('请提供1-5之间的评分', 400));
  }

  const knowledge = await Knowledge.findById(req.params.id);

  if (!knowledge) {
    return next(
      new ErrorResponse(`未找到ID为${req.params.id}的知识点`, 404)
    );
  }

  // 计算新的平均评分
  const newRatingsCount = knowledge.ratingsCount + 1;
  const newAverageRating =
    (knowledge.averageRating * knowledge.ratingsCount + rating) / newRatingsCount;

  knowledge.averageRating = newAverageRating;
  knowledge.ratingsCount = newRatingsCount;

  await knowledge.save();

  res.status(200).json({
    success: true,
    data: knowledge
  });
});