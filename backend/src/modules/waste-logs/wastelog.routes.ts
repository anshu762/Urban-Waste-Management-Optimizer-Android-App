import { Router } from 'express';
import { WasteLogController } from './wastelog.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Resident routes
router.post('/', authenticate, authorize('RESIDENT'), WasteLogController.submitWasteLog);
router.get('/my', authenticate, authorize('RESIDENT'), WasteLogController.getMyLogs);

// Admin routes
router.get('/admin', authenticate, authorize('ADMIN'), WasteLogController.getZoneLogs);
router.get('/admin/stats', authenticate, authorize('ADMIN'), WasteLogController.getSegregationStats);

export default router;
