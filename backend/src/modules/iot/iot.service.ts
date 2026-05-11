// Mock IoT for demo purposes: simulates pilot bin telemetry and alerts admins.
import { prisma } from '../../lib/prisma';
import { notificationService } from '../notifications/notification.service';
import { iotRepository } from './iot.repository';
import { SensorReadingDto } from './iot.schema';

const MOCK_BIN_IDS = ['BIN-A1', 'BIN-A2', 'BIN-B1', 'BIN-B2', 'BIN-C1'];

export class IotService {
  async ingestSensorReading(dto: SensorReadingDto) {
    const zone = await prisma.zone.findUnique({ where: { id: dto.zoneId } });
    if (!zone) {
      throw new Error('Zone not found');
    }

    const reading = await iotRepository.createSensorReading(dto);

    if (reading.fillLevel > 80) {
      await notificationService.notifyAdmins(
        'High Bin Fill Alert',
        `Bin ${reading.binId} is 80%+ full in ${zone.zoneName}`,
        { binId: reading.binId, zoneId: reading.zoneId, fillLevel: reading.fillLevel }
      );
    }

    return reading;
  }

  async getZoneSensorSummary(zoneId: string) {
    const readings = await iotRepository.getLatestReadingsByZone(zoneId);
    return readings.map((reading) => ({
      id: reading.id,
      binId: reading.binId,
      zoneId: reading.zoneId,
      fillLevel: reading.fillLevel,
      batteryStatus: reading.batteryStatus,
      status: this.getStatus(reading.fillLevel),
      recordedAt: reading.recordedAt,
    }));
  }

  async generateMockSensorData(zoneId: string) {
    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone) {
      throw new Error('Zone not found');
    }

    const count = 3 + Math.floor(Math.random() * 3);
    const selectedBins = MOCK_BIN_IDS.slice(0, count);
    const readings = [];

    for (const binId of selectedBins) {
      readings.push(await this.ingestSensorReading({
        binId,
        zoneId,
        fillLevel: Math.floor(20 + Math.random() * 76),
        batteryStatus: Math.floor(35 + Math.random() * 66),
      }));
    }

    return readings;
  }

  private getStatus(fillLevel: number) {
    if (fillLevel > 80) return 'FULL';
    if (fillLevel >= 50) return 'FILLING';
    return 'NORMAL';
  }
}

export const iotService = new IotService();
