import mongoose, { Schema, Document } from 'mongoose';

// 评论文档接口
export interface IComment extends Document {
  content: string;
  user: mongoose.Types.ObjectId;
  knowledge?: mongoose.Types.ObjectId;
  learningPath?: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  isEdited: boolean;
  editedAt?: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, '请输入评论内容'],
      trim: true,
      maxlength: [1000, '评论内容不能超过1000个字符']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    knowledge: {
      type: Schema.Types.ObjectId,
      ref: 'Knowledge'
    },
    learningPath: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPath'
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 虚拟字段：回复
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  justOne: false
});

// 确保评论必须关联到知识库或学习路径
CommentSchema.pre('save', function(next) {
  if (!(this as any).knowledge && !(this as any).learningPath) {
    return next(new Error('评论必须关联到知识库或学习路径'));
  }
  next();
});

const Comment = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;