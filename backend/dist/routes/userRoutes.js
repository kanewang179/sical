"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
// 公开路由
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
router.post('/forgot-password', userController_1.forgotPassword);
router.put('/reset-password/:resetToken', userController_1.resetPassword);
// 需要认证的路由
router.get('/me', auth_1.protect, userController_1.getMe);
router.put('/update-profile', auth_1.protect, userController_1.updateProfile);
router.put('/update-password', auth_1.protect, userController_1.updatePassword);
// 学习进度相关路由
router.get('/learning-progress', auth_1.protect, userController_1.getUserLearningProgress);
router.put('/learning-progress/:knowledgeId', auth_1.protect, userController_1.updateLearningProgress);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map