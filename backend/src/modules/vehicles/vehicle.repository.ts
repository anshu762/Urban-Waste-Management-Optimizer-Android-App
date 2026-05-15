import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VehicleRepository {
  async createVehicle(data: { vehicleNumber: string; capacityUnits?: number }) {
    return prisma.vehicle.create({
      data,
    });
  }

  async getAllVehicles(includeInactive = false, zoneId?: string) {
    const where: any = includeInactive ? {} : { isActive: true };
    if (zoneId) {
      where.OR = [
        { routePlans: { some: { zoneId } } },
        { routePlans: { none: {} } },
      ];
    }
    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVehicleById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async updateVehicle(id: string, data: { vehicleNumber?: string; capacityUnits?: number; isActive?: boolean }) {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async deleteVehicle(id: string) {
    return prisma.vehicle.delete({
      where: { id },
    });
  }
}
