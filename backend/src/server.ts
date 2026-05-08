import app from './app';
import { config } from './config';
import { prisma } from './lib/prisma';
import { notificationService } from './modules/notifications/notification.service';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    // Initialize scheduled tasks
    notificationService.initCronJobs();

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
