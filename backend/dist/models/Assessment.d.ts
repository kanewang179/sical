import mongoose, { Document } from 'mongoose';
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
}
declare const Assessment: mongoose.Model<IAssessment, {}, {}, {}, mongoose.Document<unknown, {}, IAssessment, {}, {}> & IAssessment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Assessment;
//# sourceMappingURL=Assessment.d.ts.map