import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    profile: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        bio?: string;
    };
    preferences: {
        language: string;
        theme: string;
        notifications: boolean;
    };
    progress: {
        completedPaths: mongoose.Types.ObjectId[];
        currentPath?: mongoose.Types.ObjectId;
        totalPoints: number;
    };
    isActive: boolean;
    lastLogin?: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    getSignedJwtToken(): string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map