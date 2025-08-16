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
const KnowledgeSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Knowledge'
        }
    ],
    prerequisites: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
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
const Knowledge = mongoose_1.default.model('Knowledge', KnowledgeSchema);
exports.default = Knowledge;
//# sourceMappingURL=Knowledge.js.map