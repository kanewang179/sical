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
const AssessmentSchema = new mongoose_1.Schema({
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
            correctAnswer: mongoose_1.default.Schema.Types.Mixed,
            explanation: String,
            points: {
                type: Number,
                required: true,
                default: 1
            },
            relatedKnowledge: {
                type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedKnowledge: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
// 添加索引以提高搜索性能
AssessmentSchema.index({ title: 'text', description: 'text', tags: 'text' });
AssessmentSchema.index({ category: 1 });
AssessmentSchema.index({ difficulty: 1 });
AssessmentSchema.index({ type: 1 });
AssessmentSchema.index({ isPublished: 1 });
const Assessment = mongoose_1.default.model('Assessment', AssessmentSchema);
exports.default = Assessment;
//# sourceMappingURL=Assessment.js.map