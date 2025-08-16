import mongoose, { Document } from 'mongoose';
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
declare const Knowledge: mongoose.Model<IKnowledge, {}, {}, {}, mongoose.Document<unknown, {}, IKnowledge, {}, {}> & IKnowledge & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Knowledge;
//# sourceMappingURL=Knowledge.d.ts.map