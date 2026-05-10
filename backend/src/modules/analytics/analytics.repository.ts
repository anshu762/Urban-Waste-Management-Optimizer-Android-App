import { prisma } from '../../lib/prisma';
import { SegregationStatus, WasteCategory, ComplaintStatus } from '@prisma/client';

export class AnalyticsRepository {
  /** Returns count of WasteLogs per day for last N days in a zone */
  async getDailyLogVolume(zoneId: string, days: number): Promise<{ date: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Using raw query for grouping by date efficiently since Prisma's groupBy on date part is tricky
    const result = await prisma.$queryRaw<
      { date: Date; count: bigint }[]
    >`
      SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(id) as count
      FROM "WasteLog"
      WHERE "zoneId" = ${zoneId} AND "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;

    return result.map((row: any) => ({
      date: row.date.toISOString().split('T')[0],
      count: Number(row.count)
    }));
  }

  /** Returns WasteLog counts grouped by segregationStatus for a zone */
  async getSegregationBreakdown(zoneId: string, days: number): Promise<{ status: string; count: number; percentage: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.wasteLog.groupBy({
      by: ['segregationStatus'],
      where: {
        zoneId,
        createdAt: { gte: startDate }
      },
      _count: { id: true }
    });

    const total = logs.reduce((sum: number, log: any) => sum + log._count.id, 0);

    return logs.map((log: any) => ({
      status: log.segregationStatus,
      count: log._count.id,
      percentage: total > 0 ? Math.round((log._count.id / total) * 100) : 0
    }));
  }

  /** Returns count of WasteLogs grouped by wasteCategory for a zone */
  async getCategoryDemand(zoneId: string, days: number): Promise<{ category: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // WasteLog has wasteCategories: WasteCategory[]
    // Since it's an array, we fetch all logs and count manually
    const logs = await prisma.wasteLog.findMany({
      where: {
        zoneId,
        createdAt: { gte: startDate }
      },
      select: { wasteCategories: true }
    });

    const categoryCounts: Record<string, number> = {};
    for (const log of logs) {
      for (const category of log.wasteCategories) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    }

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));
  }

  /** Returns top N zones ranked by complaint + pending log volume */
  async getZoneRankings(topN: number): Promise<{ zoneId: string; zoneName: string; priorityScore: number; pendingLogs: number; openComplaints: number; wetWasteCount: number }[]> {
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      include: {
        wasteLogs: {
          where: { readyForPickup: true }
        },
        complaints: {
          where: { status: 'OPEN' }
        }
      }
    });

    const rankings = zones.map((zone: any) => {
      const openComplaints = zone.complaints.length;
      const pendingLogs = zone.wasteLogs.length;
      
      const wetWasteCount = zone.wasteLogs.filter((log: any) => 
        log.wasteCategories.includes('WET')
      ).length;

      const complaintsScore = openComplaints * 5;
      const logsScore = pendingLogs * 2;
      const wetScore = wetWasteCount * 3;

      const priorityScore = complaintsScore + logsScore + wetScore;

      return {
        zoneId: zone.id,
        zoneName: zone.zoneName,
        priorityScore,
        pendingLogs,
        openComplaints,
        wetWasteCount
      };
    });

    return rankings.sort((a: any, b: any) => b.priorityScore - a.priorityScore).slice(0, topN);
  }

  /** Returns avg logs per weekday (0-6) for a zone over last 30 days */
  async getWeekdayAverages(zoneId: string): Promise<{ weekday: number; label: string; avgLogs: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await prisma.$queryRaw<
      { weekday: number; count: bigint; weeks: number }[]
    >`
      WITH date_series AS (
        SELECT generate_series(${startDate}::date, current_date, '1 day'::interval) as date
      ),
      log_counts AS (
        SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(id) as count
        FROM "WasteLog"
        WHERE "zoneId" = ${zoneId} AND "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('day', "createdAt")
      )
      SELECT 
        EXTRACT(DOW FROM d.date) as weekday, 
        COALESCE(SUM(l.count), 0) as count,
        COUNT(DISTINCT d.date) as weeks
      FROM date_series d
      LEFT JOIN log_counts l ON d.date = l.date
      GROUP BY EXTRACT(DOW FROM d.date)
      ORDER BY weekday ASC
    `;

    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return result.map((row: any) => ({
      weekday: Number(row.weekday),
      label: labels[Number(row.weekday)],
      avgLogs: Number(row.weeks) > 0 ? Math.round(Number(row.count) / Number(row.weeks)) : 0
    }));
  }

  /** Returns residents who have NOT logged in last 7 days (inactive) */
  async getInactiveResidents(zoneId: string): Promise<{ userId: string; fullName: string; lastLogDate: string | null }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all residents in the zone
    const residents = await prisma.residentProfile.findMany({
      where: { zoneId },
      include: {
        user: {
          select: { id: true, fullName: true, isActive: true }
        }
      }
    });

    const activeUsers = residents.filter(r => r.user.isActive);

    // For each user, get their latest log date
    const inactiveResidents = [];

    for (const resident of activeUsers) {
      const latestLog = await prisma.wasteLog.findFirst({
        where: { userId: resident.userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      if (!latestLog || latestLog.createdAt < sevenDaysAgo) {
        inactiveResidents.push({
          userId: resident.userId,
          fullName: resident.user.fullName,
          lastLogDate: latestLog ? latestLog.createdAt.toISOString() : null
        });
      }
    }

    return inactiveResidents;
  }
}

export const analyticsRepository = new AnalyticsRepository();
