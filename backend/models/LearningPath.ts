import mongoose, { Schema, Document } from 'mongoose';

// 学习路径文档接口
export interface ILearningPath extends Document {
  title: string;
  description: string;
  category: '医学基础' | '临床医学' | '药理学' | '药物化学' | '药剂学' | '综合';
  difficulty: '初级' | '中级' | '高级';
  estimatedTime: number;
  steps: {
    order: number;
    title: string;
    description?: string;
    knowledge: mongoose.Types.ObjectId;
    estimatedTime?: number;
    quizzes: mongoose.Types.ObjectId[];
  }[];
  prerequisites: mongoose.Types.ObjectId[];
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  enrolledUsers: mongoose.Types.ObjectId[];
  completedUsers: mongoose.Types.ObjectId[];
  averageRating?: number;
  ratingsCount: number;
}

const LearningPathSchema = new Schema<ILearningPath>(
  {
    title: {
      type: String,
      required: [true, '请提供学习路径标题'],
      trim: true,
      maxlength: [100, '标题不能超过100个字符']
    },
    description: {
      type: String,
      required: [true, '请提供学习路径描述']
    },
    category: {
      type: String,
      required: [true, '请选择类别'],
      enum: ['医学基础', '临床医学', '药理学', '药物化学', '药剂学', '综合']
    },
    difficulty: {
      type: String,
      required: [true, '请选择难度级别'],
      enum: ['初级', '中级', '高级']
    },
    estimatedTime: {
      type: Number,
      required: [true, '请提供预计完成时间（小时）']
    },
    steps: [
      {
        order: {
          type: Number,
          required: true
        },
        title: {
          type: String,
          required: true
        },
        description: String,
        knowledge: {
          type: Schema.Types.ObjectId,
          ref: 'Knowledge',
          required: true
        },
        estimatedTime: Number,
        quizzes: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Assessment'
          }
        ]
      }
    ],
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'LearningPath'
      }
    ],
    tags: [String],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    enrolledUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    completedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    averageRating: {
      type: Number,
      min: [1, '评分必须至少为1'],
      max: [5, '评分不能超过5']
    },
    ratingsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 添加索引以提高搜索性能
LearningPathSchema.index({ title: 'text', description: 'text', tags: 'text' });
LearningPathSchema.index({ category: 1 });
LearningPathSchema.index({ difficulty: 1 });
LearningPathSchema.index({ isPublished: 1 });

// 虚拟字段：评论
LearningPathSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'learningPath',
  justOne: false
});

const LearningPath = mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);

export default LearningPath;