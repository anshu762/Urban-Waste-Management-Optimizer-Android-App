import { Router } from 'express';
import { DashboardController } from './dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

// Note: Ensure admin authentication middleware is applied when mounting this router in app.ts or main router.
router.get('/', dashboardController.getDashboardStats);
router.get('/weekly-logs', dashboardController.getWeeklyLogVolume);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/export', dashboardController.exportDashboardStats);

export default router;
