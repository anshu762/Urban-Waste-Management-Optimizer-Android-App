import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class ScheduleRepository {
  async findSchedulesByZone(zoneId: string) {
    return prisma.pickupSchedule.findMany({
      where: { zoneId, isActive: true },
      orderBy: { pickupDay: 'asc' },
    });
  }

  async findScheduleById(id: string) {
    return prisma.pickupSchedule.findUnique({
      where: { id },
    });
  }

  async createSchedule(data: Prisma.PickupScheduleUncheckedCreateInput) {
    return prisma.pickupSchedule.create({
      data,
    });
  }

  async updateSchedule(id: string, data: Prisma.PickupScheduleUpdateInput) {
    return prisma.pickupSchedule.update({
      where: { id },
      data,
    });
  }

  async deactivateSchedule(id: string) {
    return prisma.pickupSchedule.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const scheduleRepository = new ScheduleRepository();
