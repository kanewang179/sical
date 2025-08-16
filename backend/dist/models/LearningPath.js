"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const LearningPathSchema = new mongoose_1.Schema({
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Knowledge',
                required: true
            },
            estimatedTime: Number,
            quizzes: [
                {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'Assessment'
                }
            ]
        }
    ],
    prerequisites: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'LearningPath'
        }
    ],
    tags: [String],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    enrolledUsers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    completedUsers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
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
const LearningPath = mongoose_1.default.model('LearningPath', LearningPathSchema);
exports.default = LearningPath;
//# sourceMappingURL=LearningPath.js.map