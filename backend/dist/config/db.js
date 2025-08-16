"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * 连接MongoDB数据库
 */
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env['MONGO_URI']);
        console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`MongoDB 连接错误: ${error.message}`);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map