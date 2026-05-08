import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class ZoneRepository {
  async findAllActiveZones() {
    return prisma.zone.findMany({
      where: { isActive: true },
      orderBy: { zoneName: 'asc' },
    });
  }

  async findZoneById(id: string) {
    return prisma.zone.findUnique({
      where: { id },
    });
  }

  async createZone(data: Prisma.ZoneCreateInput) {
    return prisma.zone.create({
      data,
    });
  }

  async updateZone(id: string, data: Prisma.ZoneUpdateInput) {
    return prisma.zone.update({
      where: { id },
      data,
    });
  }

  async softDeleteZone(id: string) {
    return prisma.zone.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const zoneRepository = new ZoneRepository();
