import { prisma } from '../../lib/prisma';

export class NotificationRepository {
  async createNotification(data: { userId: string; title: string; body: string }) {
    return prisma.notification.create({
      data,
    });
  }

  async getByUser(userId: string, skip: number, take: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
  
  async countByUser(userId: string) {
      return prisma.notification.count({
          where: { userId }
      });
  }
}

export const notificationRepository = new NotificationRepository();
