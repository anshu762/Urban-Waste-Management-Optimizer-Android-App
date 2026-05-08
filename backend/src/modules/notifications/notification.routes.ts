import { Router } from 'express';
import { getMyNotifications, markAsRead } from './notification.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/my', authenticate, getMyNotifications);
router.patch('/:id/read', authenticate, markAsRead);

export default router;
