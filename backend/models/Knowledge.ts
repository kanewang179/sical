import mongoose, { Schema, Document } from 'mongoose';

// 知识点文档接口
export interface IKnowledge extends Document {
  title: string;
  description: string;
  content: string;
  category: '医学基础' | '临床医学' | '药理学' | '药物化学' | '药剂学' | '其他';
  subcategory: string;
  difficulty: '初级' | '中级' | '高级';
  tags: string[];
  visualizations: {
    type: '3d_model' | 'chart' | 'image' | 'video' | 'interactive';
    title: string;
    description?: string;
    url?: string;
    modelData?: any;
    chartData?: any;
  }[];
  relatedKnowledge: mongoose.Types.ObjectId[];
  prerequisites: mongoose.Types.ObjectId[];
  references: {
    title?: string;
    author?: string;
    source?: string;
    url?: string;
    year?: number;
  }[];
  createdBy: mongoose.Types.ObjectId;
  averageRating?: number;
  ratingsCount: number;
  viewCount: number;
}

const KnowledgeSchema = new Schema<IKnowledge>(
  {
    title: {
      type: String,
      required: [true, '请提供知识点标题'],
      trim: true,
      maxlength: [100, '标题不能超过100个字符']
    },
    description: {
      type: String,
      required: [true, '请提供知识点描述']
    },
    content: {
      type: String,
      required: [true, '请提供知识点内容']
    },
    category: {
      type: String,
      required: [true, '请选择类别'],
      enum: ['医学基础', '临床医学', '药理学', '药物化学', '药剂学', '其他']
    },
    subcategory: {
      type: String,
      required: [true, '请选择子类别']
    },
    difficulty: {
      type: String,
      required: [true, '请选择难度级别'],
      enum: ['初级', '中级', '高级']
    },
    tags: {
      type: [String],
      required: [true, '请提供至少一个标签']
    },
    visualizations: [
      {
        type: {
          type: String,
          required: true,
          enum: ['3d_model', 'chart', 'image', 'video', 'interactive']
        },
        title: {
          type: String,
          required: true
        },
        description: String,
        url: String,
        modelData: Object,
        chartData: Object
      }
    ],
    relatedKnowledge: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Knowledge'
      }
    ],
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Knowledge'
      }
    ],
    references: [
      {
        title: String,
        author: String,
        source: String,
        url: String,
        year: Number
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    averageRating: {
      type: Number,
      min: [1, '评分必须至少为1'],
      max: [5, '评分不能超过5']
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    viewCount: {
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
KnowledgeSchema.index({ title: 'text', description: 'text', tags: 'text' });
KnowledgeSchema.index({ category: 1, subcategory: 1 });
KnowledgeSchema.index({ difficulty: 1 });

// 虚拟字段：评论
KnowledgeSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'knowledge',
  justOne: false
});

const Knowledge = mongoose.model<IKnowledge>('Knowledge', KnowledgeSchema);

export default Knowledge;