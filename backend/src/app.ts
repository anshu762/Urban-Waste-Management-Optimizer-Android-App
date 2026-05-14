import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import zoneRoutes from './modules/zones/zone.routes';
import scheduleRoutes from './modules/schedules/schedule.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import wastelogRoutes from './modules/waste-logs/wastelog.routes';
import complaintRoutes from './modules/complaints/complaint.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import vehicleRoutes from './modules/vehicles/vehicle.routes';
import routePlanRoutes from './modules/routes/route.routes';
import iotRoutes from './modules/iot/iot.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import aiRoutes from './modules/ai/ai.routes';
import { authenticate, authorize } from './middleware/auth.middleware';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Admin / Phase 4 routes (More specific routes first)
app.use('/api/v1/admin/dashboard', authenticate, authorize('ADMIN'), dashboardRoutes);
app.use('/api/v1/admin/vehicles', authenticate, authorize('ADMIN'), vehicleRoutes);
app.use('/api/v1/admin/routes', authenticate, authorize('ADMIN', 'DRIVER'), routePlanRoutes);
app.use('/api/v1/admin/analytics', authenticate, authorize('ADMIN'), analyticsRoutes);

// General routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/waste-logs', wastelogRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1', iotRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use(errorHandler);

export default app;
