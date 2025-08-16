import mongoose, { Document } from 'mongoose';
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
declare const LearningPath: mongoose.Model<ILearningPath, {}, {}, {}, mongoose.Document<unknown, {}, ILearningPath, {}, {}> & ILearningPath & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default LearningPath;
//# sourceMappingURL=LearningPath.d.ts.map