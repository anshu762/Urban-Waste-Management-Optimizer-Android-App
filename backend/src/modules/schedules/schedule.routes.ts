import { Router } from 'express';
import { getSchedules, getUpcomingPickups, createSchedule, updateSchedule, deleteSchedule } from './schedule.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Protected (any logged in user can see schedules for a zone)
router.get('/', authenticate, getSchedules);
router.get('/upcoming', authenticate, getUpcomingPickups);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), createSchedule);
router.put('/:id', authenticate, authorize('ADMIN'), updateSchedule);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSchedule);

export default router;
