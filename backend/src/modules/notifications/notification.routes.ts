import { Router } from 'express';
import { getMyNotifications, markAsRead, sendBulkNotification } from './notification.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/my', authenticate, getMyNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.post('/bulk', authenticate, authorize('ADMIN'), sendBulkNotification);

export default router;
