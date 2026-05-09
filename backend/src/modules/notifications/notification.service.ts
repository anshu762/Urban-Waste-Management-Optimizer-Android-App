import { notificationRepository } from './notification.repository';
import { prisma } from '../../lib/prisma';
import { sendExpoPushNotification } from '../../lib/expo-push';

export class NotificationService {
  private reminderTimer?: NodeJS.Timeout;

  initCronJobs() {
    this.schedulePickupReminders();
  }

  schedulePickupReminders() {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
    }

    const runDailyReminder = async () => {
      try {
        await this.sendPickupRemindersForTomorrow();
      } catch (error) {
        console.error('Pickup reminder job failed:', error);
      } finally {
        this.reminderTimer = setTimeout(runDailyReminder, this.msUntilNext8Pm());
      }
    };

    this.reminderTimer = setTimeout(runDailyReminder, this.msUntilNext8Pm());
  }

  private msUntilNext8Pm() {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(20, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun.getTime() - now.getTime();
  }

  private async sendPickupRemindersForTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();

    try {
      const schedules = await prisma.pickupSchedule.findMany({
        where: {
          pickupDay: tomorrowDay,
          isActive: true,
        },
        include: {
          zone: true,
        },
      });

      for (const schedule of schedules) {
        await this.notifyResidentsInZone(
          schedule.zoneId,
          'Pickup Tomorrow',
          `Tomorrow is your ${schedule.wasteCategory} waste pickup day during ${schedule.pickupTimeWindow}. Please keep your bins ready!`
        );
      }
    } catch (error) {
      console.error('Error in schedulePickupReminders:', error);
    }
  }

  async notifyResidentsInZone(zoneId: string, title: string, body: string, data?: object) {
    try {
      const residents = await prisma.residentProfile.findMany({
        where: { zoneId },
        include: { user: true },
      });

      await notificationRepository.createManyNotifications(
        residents.map((resident) => ({
          userId: resident.userId,
          title,
          body,
        }))
      );

      const tokens = residents.map((resident) => resident.user.pushToken).filter((token): token is string => Boolean(token));
      await sendExpoPushNotification(tokens, title, body, data);
    } catch (error) {
      console.error('Failed to notify residents in zone:', error);
    }
  }

  async notifyUser(userId: string, title: string, body: string, data?: object) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      await notificationRepository.createNotification({ userId, title, body });
      if (user.pushToken) {
        await sendExpoPushNotification([user.pushToken], title, body, data);
      }
    } catch (error) {
      console.error('Failed to notify user:', error);
    }
  }

  async notifyAdminNewComplaint(complaint: { id: string; zone?: { zoneName: string } | null; zoneId?: string }) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
      });
      const zoneName = complaint.zone?.zoneName || 'Unknown zone';
      const title = 'New Missed Pickup Report';
      const body = `New missed pickup report in ${zoneName}`;

      await notificationRepository.createManyNotifications(
        admins.map((admin) => ({ userId: admin.id, title, body }))
      );
      await sendExpoPushNotification(
        admins.map((admin) => admin.pushToken).filter((token): token is string => Boolean(token)),
        title,
        body,
        { complaintId: complaint.id, zoneId: complaint.zoneId }
      );
    } catch (error) {
      console.error('Failed to notify admins about complaint:', error);
    }
  }

  async notifyAdmins(title: string, body: string, data?: object) {
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true } });
      await notificationRepository.createManyNotifications(
        admins.map((admin) => ({ userId: admin.id, title, body }))
      );
      await sendExpoPushNotification(
        admins.map((admin) => admin.pushToken).filter((token): token is string => Boolean(token)),
        title,
        body,
        data
      );
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      notificationRepository.getByUser(userId, skip, limit),
      notificationRepository.countByUser(userId),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string) {
    return await notificationRepository.markAsRead(id);
  }
}

export const notificationService = new NotificationService();
