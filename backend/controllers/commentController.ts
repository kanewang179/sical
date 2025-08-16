import Comment from '../models/Comment';
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

// @desc    获取评论
// @route   GET /api/v1/knowledges/:knowledgeId/comments
// @route   GET /api/v1/learningpaths/:learningPathId/comments
// @route   GET /api/v1/comments
// @access  Public
export const getComments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query;

  if ((req.params as any)['knowledgeId']) {
    // 获取知识点的评论
    query = Comment.find({ knowledge: (req.params as any)['knowledgeId'], parentComment: null });
  } else if ((req.params as any)['learningPathId']) {
    // 获取学习路径的评论
    query = Comment.find({ learningPath: (req.params as any)['learningPathId'], parentComment: null });
  } else {
    return next(new ErrorResponse('请指定知识点或学习路径ID', 400));
  }

  // 添加用户信息和回复
  query = query.populate({
    path: 'user',
    select: 'username avatar'
  }).populate({
    path: 'replies',
    populate: {
      path: 'user',
      select: 'username avatar'
    }
  });

  // 排序
  query = query.sort('-createdAt');

  const comments = await query;

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments
  });
});

// @desc    获取单个评论
// @route   GET /api/v1/comments/:id
// @access  Public
export const getComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const comment = await Comment.findById((req.params as any)['id'])
    .populate({
      path: 'user',
      select: 'username avatar'
    })
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'username avatar'
      }
    });

  if (!comment) {
    return next(
      new ErrorResponse(`未找到ID为${(req.params as any)['id']}的评论`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc    添加评论
// @route   POST /api/v1/knowledges/:knowledgeId/comments
// @route   POST /api/v1/learningpaths/:learningPathId/comments
// @route   POST /api/v1/comments/:parentId/reply
// @access  Private
export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { content } = req.body;

  if (!content) {
    return next(new ErrorResponse('请提供评论内容', 400));
  }

  const commentData = {
    content,
    user: req.user.id
  };

  // 处理回复评论
  if ((req.params as any)['parentId']) {
    const parentComment = await Comment.findById((req.params as any)['parentId']);
    
    if (!parentComment) {
      return next(new ErrorResponse(`未找到ID为${(req.params as any)['parentId']}的评论`, 404));
    }
    
    (commentData as any).parentComment = (req.params as any)['parentId'];
    
    // 继承父评论的关联
    if (parentComment.knowledge) {
      (commentData as any).knowledge = parentComment.knowledge;
    } else if (parentComment.learningPath) {
      (commentData as any).learningPath = parentComment.learningPath;
    }
  } 
  // 处理知识点或学习路径的评论
  else if ((req.params as any)['knowledgeId']) {
    (commentData as any).knowledge = (req.params as any)['knowledgeId'];
  } else if ((req.params as any)['learningPathId']) {
    (commentData as any).learningPath = (req.params as any)['learningPathId'];
  } else {
    return next(new ErrorResponse('请指定知识点、学习路径ID或父评论ID', 400));
  }

  const comment = await Comment.create(commentData);

  // 获取完整的评论信息，包括用户信息
  const populatedComment = await Comment.findById(comment._id).populate({
    path: 'user',
    select: 'username avatar'
  });

  res.status(201).json({
    success: true,
    data: populatedComment
  });
});

// @desc    更新评论
// @route   PUT /api/v1/comments/:id
// @access  Private
export const updateComment = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { content } = req.body;

  if (!content) {
    return next(new ErrorResponse('请提供评论内容', 400));
  }

  let comment = await Comment.findById((req.params as any)['id']);

  if (!comment) {
    return next(
      new ErrorResponse(`未找到ID为${(req.params as any)['id']}的评论`, 404)
    );
  }

  // 确保用户是评论的作者
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('您没有权限更新此评论', 403)
    );
  }

  comment.content = content;
  comment.isEdited = true;
  await comment.save();

  comment = await Comment.findById((req.params as any)['id']).populate({
    path: 'user',
    select: 'username avatar'
  });

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc    删除评论
// @route   DELETE /api/v1/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const comment = await Comment.findById((req.params as any)['id']);

  if (!comment) {
    return next(
      new ErrorResponse(`未找到ID为${(req.params as any)['id']}的评论`, 404)
    );
  }

  // 确保用户是评论的作者或管理员
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('您没有权限删除此评论', 403)
    );
  }

  await comment.deleteOne();

  // 如果是父评论，删除所有回复
  if (!comment.parentComment) {
    await Comment.deleteMany({ parentComment: (req.params as any)['id'] });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    点赞评论
// @route   POST /api/v1/comments/:id/like
// @access  Private
export const likeComment = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const comment = await Comment.findById((req.params as any)['id']);

  if (!comment) {
    return next(
      new ErrorResponse(`未找到ID为${(req.params as any)['id']}的评论`, 404)
    );
  }

  // 检查用户是否已经点赞
  const alreadyLiked = comment.likes.includes(req.user.id as any);

  if (alreadyLiked) {
    // 取消点赞
    comment.likes = comment.likes.filter(
      like => like.toString() !== req.user.id
    );
  } else {
    // 添加点赞
    comment.likes.push(req.user.id as any);
  }

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment
  });
});