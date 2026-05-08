import { prisma } from '../../lib/prisma';
import { Prisma, WasteCategory, SegregationStatus } from '@prisma/client';

export class WasteLogRepository {
  static async createWasteLog(data: Prisma.WasteLogUncheckedCreateInput) {
    return prisma.wasteLog.create({
      data,
      include: {
        user: { select: { fullName: true, mobile: true } },
        zone: { select: { zoneName: true } }
      }
    });
  }

  static async updateWasteLog(id: string, data: Prisma.WasteLogUncheckedUpdateInput) {
    return prisma.wasteLog.update({
      where: { id },
      data,
    });
  }

  static async findLogsByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.wasteLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.wasteLog.count({ where: { userId } }),
    ]);

    return { data, total, page, limit };
  }

  static async findLogsByZone(zoneId: string, date: Date, page: number, limit: number) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.wasteLog.findMany({
        where: {
          zoneId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, mobile: true } },
          zone: { select: { zoneName: true } }
        }
      }),
      prisma.wasteLog.count({
        where: {
          zoneId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);
    return { data, total, page, limit };
  }

  static async findTodaysLogByUser(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return prisma.wasteLog.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
        },
      },
    });
  }

  static async getSegregationStats(zoneId: string, from: Date, to: Date) {
    const stats = await prisma.wasteLog.groupBy({
      by: ['segregationStatus'],
      where: {
        zoneId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: {
        id: true,
      },
    });

    return stats.reduce((acc, curr) => {
      acc[curr.segregationStatus] = curr._count.id;
      return acc;
    }, {} as Record<SegregationStatus, number>);
  }
}
