import mongoose, { Schema, Document } from 'mongoose';

// 评估文档接口
export interface IAssessment extends Document {
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'exam';
  category: string;
  difficulty: '初级' | '中级' | '高级';
  questions: {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    explanation?: string;
    relatedKnowledge?: mongoose.Types.ObjectId;
  }[];
  timeLimit?: number;
  passingScore: number;
  attempts: number;
  knowledgePoints: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  tags: string[];
  relatedKnowledge: mongoose.Types.ObjectId[];
  completedCount?: number;
  averageScore?: number;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: {
      type: String,
      required: [true, '请提供测评标题'],
      trim: true,
      maxlength: [100, '标题不能超过100个字符']
    },
    description: {
      type: String,
      required: [true, '请提供测评描述']
    },
    type: {
      type: String,
      required: [true, '请选择测评类型'],
      enum: ['选择题', '填空题', '判断题', '综合题', '实验操作']
    },
    difficulty: {
      type: String,
      required: [true, '请选择难度级别'],
      enum: ['初级', '中级', '高级']
    },
    timeLimit: {
      type: Number,
      required: [true, '请设置时间限制（分钟）']
    },
    passingScore: {
      type: Number,
      required: [true, '请设置通过分数'],
      min: [0, '通过分数不能小于0'],
      max: [100, '通过分数不能超过100']
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true
        },
        questionType: {
          type: String,
          required: true,
          enum: ['单选题', '多选题', '填空题', '判断题', '简答题']
        },
        options: [String],
        correctAnswer: mongoose.Schema.Types.Mixed,
        explanation: String,
        points: {
          type: Number,
          required: true,
          default: 1
        },
        relatedKnowledge: {
          type: Schema.Types.ObjectId,
          ref: 'Knowledge'
        }
      }
    ],
    category: {
      type: String,
      required: [true, '请选择类别'],
      enum: ['医学基础', '临床医学', '药理学', '药物化学', '药剂学', '综合']
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    relatedKnowledge: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Knowledge'
      }
    ],
    completedCount: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// 添加索引以提高搜索性能
AssessmentSchema.index({ title: 'text', description: 'text', tags: 'text' });
AssessmentSchema.index({ category: 1 });
AssessmentSchema.index({ difficulty: 1 });
AssessmentSchema.index({ type: 1 });
AssessmentSchema.index({ isPublished: 1 });

const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);

export default Assessment;