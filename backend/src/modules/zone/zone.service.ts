import { prisma } from '../../lib/prisma';

export class ZoneService {
  async getAllActiveZones() {
    return prisma.zone.findMany({
      where: { isActive: true },
      select: {
        id: true,
        zoneName: true,
        city: true,
      },
      orderBy: {
        zoneName: 'asc',
      },
    });
  }
}

export const zoneService = new ZoneService();
