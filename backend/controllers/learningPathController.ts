import LearningPath from '../models/LearningPath';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';

// @desc    获取所有学习路径
// @route   GET /api/v1/learningpaths
// @access  Public
export const getLearningPaths = asyncHandler(async (req: any, res: any, next: any) => {
  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await LearningPath.countDocuments({ isPublished: true });

  const query = LearningPath.find({ isPublished: true })
    .skip(startIndex)
    .limit(limit);

  // 排序
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query.sort(sortBy);
  } else {
    query.sort('-createdAt');
  }

  // 筛选
  if (req.query.category) {
    query.where('category').equals(req.query.category);
  }

  if (req.query.difficulty) {
    query.where('difficulty').equals(req.query.difficulty);
  }

  // 执行查询
  const learningPaths = await query;

  // 分页结果
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
    count: learningPaths.length,
    pagination,
    data: learningPaths
  });
});

// @desc    获取单个学习路径
// @route   GET /api/v1/learningpaths/:id
// @access  Public
export const getLearningPath = asyncHandler(async (req: any, res: any, next: any) => {
  const learningPath = await LearningPath.findById(req.params.id)
    .populate({
      path: 'steps.knowledge',
      select: 'title description category difficulty'
    })
    .populate('comments');

  if (!learningPath) {
    return next(
      new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: learningPath
  });
});

// @desc    创建学习路径
// @route   POST /api/v1/learningpaths
// @access  Private/Admin
export const createLearningPath = asyncHandler(async (req: any, res: any, next: any) => {
  // 添加创建者
  req.body.createdBy = req.user.id;

  const learningPath = await LearningPath.create(req.body);

  res.status(201).json({
    success: true,
    data: learningPath
  });
});

// @desc    更新学习路径
// @route   PUT /api/v1/learningpaths/:id
// @access  Private/Admin
export const updateLearningPath = asyncHandler(async (req: any, res: any, next: any) => {
  let learningPath = await LearningPath.findById(req.params.id);

  if (!learningPath) {
    return next(
      new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404)
    );
  }

  learningPath = await LearningPath.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: learningPath
  });
});

// @desc    删除学习路径
// @route   DELETE /api/v1/learningpaths/:id
// @access  Private/Admin
export const deleteLearningPath = asyncHandler(async (req: any, res: any, next: any) => {
  const learningPath = await LearningPath.findById(req.params.id);

  if (!learningPath) {
    return next(
      new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404)
    );
  }

  await learningPath.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    用户报名学习路径
// @route   POST /api/v1/learningpaths/:id/enroll
// @access  Private
export const enrollLearningPath = asyncHandler(async (req: any, res: any, next: any) => {
  const learningPath = await LearningPath.findById(req.params.id);

  if (!learningPath) {
    return next(
      new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404)
    );
  }

  // 检查用户是否已经报名
  if (learningPath.enrolledUsers.includes(req.user.id)) {
    return next(new ErrorResponse('您已经报名了该学习路径', 400));
  }

  // 添加用户到报名列表
  learningPath.enrolledUsers.push(req.user.id);
  await learningPath.save();

  res.status(200).json({
    success: true,
    data: learningPath
  });
});

// @desc    用户完成学习路径
// @route   POST /api/v1/learningpaths/:id/complete
// @access  Private
export const completeLearningPath = asyncHandler(async (req: any, res: any, next: any) => {
  const learningPath = await LearningPath.findById(req.params.id);

  if (!learningPath) {
    return next(
      new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404)
    );
  }

  // 检查用户是否已经报名
  if (!learningPath.enrolledUsers.includes(req.user.id)) {
    return next(new ErrorResponse('您尚未报名该学习路径', 400));
  }

  // 检查用户是否已经完成
  if (learningPath.completedUsers.includes(req.user.id)) {
    return next(new ErrorResponse('您已经完成了该学习路径', 400));
  }

  // 添加用户到完成列表
  learningPath.completedUsers.push(req.user.id);
  await learningPath.save();

  res.status(200).json({
    success: true,
    data: learningPath
  });
});

// @desc    获取用户报名的学习路径
// @route   GET /api/v1/learningpaths/user/enrolled
// @access  Private
export const getUserLearningPaths = asyncHandler(async (req: any, res: any, next: any) => {
  const learningPaths = await LearningPath.find({
    enrolledUsers: req.user.id
  });

  res.status(200).json({
    success: true,
    count: learningPaths.length,
    data: learningPaths
  });
});

// @desc    评价学习路径
// @route   POST /api/v1/learningpaths/:id/rate
// @access  Private
export const rateLearningPath = asyncHandler(async (req: any, res: any, next: any) => {
  const { rating } = req.body;

  // 验证评分
  if (!rating || rating < 1 || rating > 5) {
    return next(new ErrorResponse('请提供1-5之间的评分', 400));
  }

  const learningPath = await LearningPath.findById(req.params.id);

  if (!learningPath) {
    return next(
      new ErrorResponse(`未找到ID为${req.params.id}的学习路径`, 404)
    );
  }

  // 检查用户是否已经完成学习路径
  if (!learningPath.completedUsers.includes(req.user.id)) {
    return next(new ErrorResponse('您必须完成学习路径才能评分', 400));
  }

  // 计算新的平均评分
  const newRatingsCount = learningPath.ratingsCount + 1;
  const newAverageRating =
    (learningPath.averageRating * learningPath.ratingsCount + rating) / newRatingsCount;

  learningPath.averageRating = newAverageRating;
  learningPath.ratingsCount = newRatingsCount;

  await learningPath.save();

  res.status(200).json({
    success: true,
    data: learningPath
  });
});