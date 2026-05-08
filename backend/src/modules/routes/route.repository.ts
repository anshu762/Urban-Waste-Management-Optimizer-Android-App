import { PrismaClient, RouteStatus, StopStatus, ComplaintStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class RouteRepository {
  /**
   * Fetches households in a zone ready for pickup based on recent waste logs and open complaints.
   */
  async getReadyHouseholdsByZone(zoneId: string, date: Date) {
    const startOfYesterday = new Date(date);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(date);
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Find users with active waste logs
    const recentLogs = await prisma.wasteLog.findMany({
      where: {
        zoneId,
        readyForPickup: true,
        createdAt: {
          gte: startOfYesterday,
          lte: endOfToday,
        },
      },
      include: {
        user: {
          include: {
            residentProfile: true,
          },
        },
      },
    });

    // 2. Find users with open complaints
    const openComplaints = await prisma.complaint.findMany({
      where: {
        zoneId,
        status: ComplaintStatus.OPEN,
      },
      include: {
        user: {
          include: {
            residentProfile: true,
          },
        },
      },
    });

    const householdMap = new Map<string, any>();

    // Process logs (Base Priority 10)
    for (const log of recentLogs) {
      if (log.user.residentProfile) {
        const rp = log.user.residentProfile;
        if (!householdMap.has(rp.id)) {
          householdMap.set(rp.id, {
            residentProfileId: rp.id,
            buildingName: rp.buildingName,
            block: rp.block,
            street: rp.street,
            landmark: rp.landmark,
            houseNumber: rp.houseNumber,
            lat: rp.latitude,
            lon: rp.longitude,
            priorityScore: 10,
            hasLog: true,
            hasComplaint: false,
          });
        }
      }
    }

    // Process complaints (Priority + 20)
    for (const complaint of openComplaints) {
      if (complaint.user.residentProfile) {
        const rp = complaint.user.residentProfile;
        if (householdMap.has(rp.id)) {
          const entry = householdMap.get(rp.id);
          if (!entry.hasComplaint) {
            entry.priorityScore += 20;
            entry.hasComplaint = true;
          }
        } else {
          householdMap.set(rp.id, {
            residentProfileId: rp.id,
            buildingName: rp.buildingName,
            block: rp.block,
            street: rp.street,
            landmark: rp.landmark,
            houseNumber: rp.houseNumber,
            lat: rp.latitude,
            lon: rp.longitude,
            priorityScore: 20, // Just complaint, no log
            hasLog: false,
            hasComplaint: true,
          });
        }
      }
    }

    return Array.from(householdMap.values());
  }

  async createRoutePlan(data: {
    zoneId: string;
    routeDate: Date;
    totalEstimatedStops: number;
    totalPriorityScore: number;
    status?: RouteStatus;
  }) {
    return prisma.routePlan.create({
      data,
    });
  }

  async addRouteStops(routePlanId: string, stops: { residentProfileId: string; stopOrder: number; priorityScore: number }[]) {
    return prisma.routeStop.createMany({
      data: stops.map(stop => ({
        routePlanId,
        residentProfileId: stop.residentProfileId,
        stopOrder: stop.stopOrder,
        priorityScore: stop.priorityScore,
        stopStatus: StopStatus.PENDING,
      })),
    });
  }

  async getRoutePlanById(id: string) {
    return prisma.routePlan.findUnique({
      where: { id },
      include: {
        routeStops: {
          orderBy: { stopOrder: 'asc' },
        },
        vehicle: true,
        driverProfile: {
          include: { user: true }
        },
        zone: true,
      },
    });
  }

  async getRoutePlansByZone(zoneId: string, date?: Date) {
    const filter: any = { zoneId };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.routeDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return prisma.routePlan.findMany({
      where: filter,
      include: {
        vehicle: true,
        driverProfile: {
          include: { user: true }
        },
      },
      orderBy: { routeDate: 'desc' },
    });
  }

  async updateRoutePlanStatus(id: string, status: RouteStatus) {
    return prisma.routePlan.update({
      where: { id },
      data: { status },
    });
  }

  async updateStopStatus(stopId: string, stopStatus: StopStatus, issueNote?: string) {
    return prisma.routeStop.update({
      where: { id: stopId },
      data: {
        stopStatus,
        issueNote,
        completedAt: stopStatus === StopStatus.COMPLETED ? new Date() : null,
      },
    });
  }

  async assignRouteToDriver(routePlanId: string, driverProfileId: string, vehicleId: string) {
    return prisma.routePlan.update({
      where: { id: routePlanId },
      data: {
        driverProfileId,
        vehicleId,
        status: RouteStatus.ASSIGNED,
      },
    });
  }
}
