import { Router } from 'express';
import { ComplaintController } from './complaint.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { uploadSingle } from '../../lib/upload';

const router = Router();

// Resident routes
router.post('/', authenticate, authorize('RESIDENT'), uploadSingle, ComplaintController.submitComplaint);
router.get('/my', authenticate, authorize('RESIDENT'), ComplaintController.getMyComplaints);
router.get('/:id', authenticate, ComplaintController.getComplaintById);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN'), ComplaintController.getAllComplaints);
router.patch('/admin/:id/status', authenticate, authorize('ADMIN'), ComplaintController.updateComplaintStatus);

export default router;
