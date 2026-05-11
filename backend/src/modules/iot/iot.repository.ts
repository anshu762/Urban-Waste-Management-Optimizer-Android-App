// Mock IoT for demo purposes: persistence helpers for simulated bin sensors.
import { prisma } from '../../lib/prisma';
import { SensorReadingDto } from './iot.schema';

export class IotRepository {
  async createSensorReading(dto: SensorReadingDto) {
    return prisma.sensorReading.create({
      data: dto,
      include: {
        zone: true,
      },
    });
  }

  async getLatestReadingsByZone(zoneId: string) {
    const readings = await prisma.sensorReading.findMany({
      where: { zoneId },
      orderBy: { recordedAt: 'desc' },
    });

    const latestByBin = new Map<string, (typeof readings)[number]>();
    for (const reading of readings) {
      if (!latestByBin.has(reading.binId)) {
        latestByBin.set(reading.binId, reading);
      }
    }

    return Array.from(latestByBin.values());
  }

  async getBinHistory(binId: string, limit: number) {
    return prisma.sensorReading.findMany({
      where: { binId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }
}

export const iotRepository = new IotRepository();
