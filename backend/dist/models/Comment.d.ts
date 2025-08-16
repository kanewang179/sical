import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    content: string;
    author: mongoose.Types.ObjectId;
    target: {
        type: 'knowledge' | 'learningPath' | 'assessment';
        id: mongoose.Types.ObjectId;
    };
    parent?: mongoose.Types.ObjectId;
    replies: mongoose.Types.ObjectId[];
    likes: number;
    isEdited: boolean;
    editedAt?: Date;
}
declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Comment;
//# sourceMappingURL=Comment.d.ts.map