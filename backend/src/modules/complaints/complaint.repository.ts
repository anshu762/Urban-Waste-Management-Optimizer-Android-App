import { prisma } from '../../lib/prisma';
import { Prisma, ComplaintStatus } from '@prisma/client';

export class ComplaintRepository {
  static async createComplaint(data: Prisma.ComplaintUncheckedCreateInput) {
    return prisma.complaint.create({
      data,
      include: {
        zone: { select: { zoneName: true } },
        relatedSchedule: { select: { wasteCategory: true, pickupDay: true, pickupTimeWindow: true } }
      }
    });
  }

  static async findComplaintsByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.complaint.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          zone: { select: { zoneName: true } },
          relatedSchedule: { select: { wasteCategory: true, pickupDay: true, pickupTimeWindow: true } }
        }
      }),
      prisma.complaint.count({ where: { userId } }),
    ]);

    return { data, total, page, limit };
  }

  static async findAllComplaints(filters: { zoneId?: string; status?: ComplaintStatus }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ComplaintWhereInput = {};
    if (filters.zoneId) where.zoneId = filters.zoneId;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, mobile: true } },
          zone: { select: { zoneName: true } },
          relatedSchedule: { select: { wasteCategory: true, pickupDay: true, pickupTimeWindow: true } }
        }
      }),
      prisma.complaint.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async findComplaintById(id: string) {
    return prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, mobile: true } },
        zone: { select: { zoneName: true } },
        relatedSchedule: { select: { wasteCategory: true, pickupDay: true, pickupTimeWindow: true } }
      }
    });
  }

  static async updateComplaintStatus(id: string, status: ComplaintStatus) {
    const resolvedAt = status === 'RESOLVED' ? new Date() : null;
    return prisma.complaint.update({
      where: { id },
      data: { 
        status,
        ...(resolvedAt && { resolvedAt })
      },
      include: {
        user: { select: { fullName: true, mobile: true } },
        zone: { select: { zoneName: true } }
      }
    });
  }

  static async countOpenComplaintsByZone(zoneId: string) {
    return prisma.complaint.count({
      where: {
        zoneId,
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      }
    });
  }
}
