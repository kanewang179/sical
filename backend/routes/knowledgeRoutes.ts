import express from 'express';
const router = express.Router();
import {
  getKnowledges,
  getKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  getKnowledgesByCategory,
  searchKnowledge,
  rateKnowledge
} from '../controllers/knowledgeController';

import { protect, authorize } from '../middleware/auth';

// 公开路由
router.get('/', getKnowledges);
router.get('/search', searchKnowledge);
router.get('/category/:category', getKnowledgesByCategory);
router.get('/:id', getKnowledge);

// 需要认证的路由
router.post('/', protect, authorize('admin'), createKnowledge);
router.put('/:id', protect, authorize('admin'), updateKnowledge);
router.delete('/:id', protect, authorize('admin'), deleteKnowledge);
router.post('/:id/rate', protect, rateKnowledge);

export default router;