import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.post('/classify-waste', authenticate, authorize('RESIDENT'), AIController.classifyWaste);

export default router;
