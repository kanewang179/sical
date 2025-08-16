import mongoose from 'mongoose';

/**
 * 连接MongoDB数据库
 */
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env['MONGO_URI'] as string);

    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB 连接错误: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;