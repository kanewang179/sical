import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 用户文档接口
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

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '请提供用户名'],
      unique: true,
      trim: true,
      minlength: [3, '用户名至少3个字符'],
      maxlength: [20, '用户名不能超过20个字符']
    },
    email: {
      type: String,
      required: [true, '请提供邮箱'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        '请提供有效的邮箱地址'
      ]
    },
    password: {
      type: String,
      required: [true, '请提供密码'],
      minlength: [6, '密码至少6个字符'],
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student'
    },
    profile: {
      firstName: {
        type: String,
        trim: true
      },
      lastName: {
        type: String,
        trim: true
      },
      avatar: {
        type: String,
        default: 'default-avatar.png'
      },
      bio: {
        type: String,
        maxlength: [500, '个人简介不能超过500个字符']
      }
    },
    preferences: {
      language: {
        type: String,
        default: 'zh-CN'
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      notifications: {
        type: Boolean,
        default: true
      }
    },
    progress: {
      completedPaths: [{
        type: Schema.Types.ObjectId,
        ref: 'LearningPath'
      }],
      currentPath: {
        type: Schema.Types.ObjectId,
        ref: 'LearningPath'
      },
      totalPoints: {
        type: Number,
        default: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpire: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// 密码加密中间件
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 生成JWT Token
UserSchema.methods['getSignedJwtToken'] = function (): string {
  const jwtSecret = process.env['JWT_SECRET'];
  const jwtExpire = process.env['JWT_EXPIRE'];
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign({ id: (this as any)._id }, jwtSecret, {
    expiresIn: jwtExpire || '30d'
  } as jwt.SignOptions);
};

// 验证密码
UserSchema.methods['matchPassword'] = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, (this as any).password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;