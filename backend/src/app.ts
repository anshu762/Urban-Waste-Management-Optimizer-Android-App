import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import zoneRoutes from './modules/zones/zone.routes';
import scheduleRoutes from './modules/schedules/schedule.routes';
import notificationRoutes from './modules/notifications/notification.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use(errorHandler);

export default app;
