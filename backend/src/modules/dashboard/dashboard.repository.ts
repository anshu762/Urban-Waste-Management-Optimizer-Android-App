import { PrismaClient, SegregationStatus, ComplaintStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardRepository {
  /**
   * Get aggregate dashboard statistics.
   */
  async getDashboardStats(filters: { zoneId?: string; from?: Date; to?: Date }) {
    const { zoneId, from, to } = filters;

    // Build common where clauses
    const zoneFilter = zoneId ? { zoneId } : {};
    
    // Date filter for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayFilter = {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    };

    // Weekly filter
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekFilter = {
      resolvedAt: {
        gte: weekStart,
        lte: new Date(),
      },
    };

    const customDateFilter = (from && to) ? {
      createdAt: {
        gte: from,
        lte: to,
      }
    } : {};

    const [
      totalHouseholds,
      activeLogsToday,
      openComplaints,
      resolvedComplaintsThisWeek,
      logsWithSegregation,
      totalLogs,
      pickupsDueToday
    ] = await Promise.all([
      // totalHouseholds: count of ResidentProfiles in zone
      prisma.residentProfile.count({
        where: zoneFilter,
      }),
      
      // activeLogsToday: count of WasteLogs created today
      prisma.wasteLog.count({
        where: {
          ...zoneFilter,
          ...todayFilter,
        },
      }),

      // openComplaints: count of Complaints with status OPEN
      prisma.complaint.count({
        where: {
          ...zoneFilter,
          status: ComplaintStatus.OPEN,
        },
      }),

      // resolvedComplaintsThisWeek: count resolved in last 7 days
      prisma.complaint.count({
        where: {
          ...zoneFilter,
          status: ComplaintStatus.RESOLVED,
          ...weekFilter,
        },
      }),

      // segregationCompliance logic (CORRECT count vs Total count in date range)
      prisma.wasteLog.count({
        where: {
          ...zoneFilter,
          ...customDateFilter,
          segregationStatus: SegregationStatus.CORRECT,
        },
      }),

      prisma.wasteLog.count({
        where: {
          ...zoneFilter,
          ...customDateFilter,
        },
      }),

      // pickupsDueToday: count of PickupSchedules where pickupDay = today's day of week (0-6)
      prisma.pickupSchedule.count({
        where: {
          ...zoneFilter,
          isActive: true,
          pickupDay: new Date().getDay(),
        },
      }),
    ]);

    const segregationCompliance = totalLogs > 0 ? (logsWithSegregation / totalLogs) * 100 : 0;

    return {
      totalHouseholds,
      activeLogsToday,
      openComplaints,
      resolvedComplaintsThisWeek,
      segregationCompliance,
      pickupsDueToday,
    };
  }

  /**
   * Get the last 7 days log counts grouped by date
   */
  async getWeeklyLogVolume(zoneId?: string) {
    // IST Adjustment: If server is UTC, add 5.5 hours to get India time
    const nowIST = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    
    const today = new Date(nowIST);
    today.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(nowIST);
    weekStart.setDate(nowIST.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const logs = await prisma.wasteLog.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lte: today,
        },
        ...(zoneId ? { zoneId } : {}),
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date string (YYYY-MM-DD)
    const volumeByDate: Record<string, number> = {};
    
    // Manual date formatter to stay in "IST-shifted" time
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Initialize exactly 7 days ending today (shifted to IST)
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      volumeByDate[formatDate(d)] = 0;
    }

    logs.forEach(log => {
      // Adjust log creation time to IST for grouping
      const logIST = new Date(log.createdAt.getTime() + (5.5 * 60 * 60 * 1000));
      const dateStr = formatDate(logIST);
      if (volumeByDate[dateStr] !== undefined) {
        volumeByDate[dateStr]++;
      }
    });

    return Object.keys(volumeByDate).sort().map(date => ({
      date,
      count: volumeByDate[date],
    }));
  }

  /**
   * Get WasteLog categories count grouped by category
   */
  async getCategoryBreakdown(zoneId?: string, from?: Date, to?: Date) {
    const customDateFilter = (from && to) ? {
      createdAt: {
        gte: from,
        lte: to,
      }
    } : {};

    const logs = await prisma.wasteLog.findMany({
      where: {
        ...(zoneId ? { zoneId } : {}),
        ...customDateFilter,
      },
      select: {
        wasteCategories: true,
      },
    });

    const breakdown: Record<string, number> = {};

    logs.forEach(log => {
      log.wasteCategories.forEach(category => {
        if (!breakdown[category]) {
          breakdown[category] = 0;
        }
        breakdown[category]++;
      });
    });

    return Object.keys(breakdown).map(category => ({
      category,
      count: breakdown[category],
    }));
  }
}
