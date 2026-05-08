import { WasteLogRepository } from './wastelog.repository';
import { SubmitWasteLogDto } from './wastelog.schema';
import { prisma } from '../../lib/prisma';

export class WasteLogService {
  static async submitWasteLog(userId: string, dto: SubmitWasteLogDto) {
    const resident = await prisma.residentProfile.findUnique({
      where: { userId },
    });

    if (!resident || !resident.zoneId) {
      throw new Error('Resident profile not found or user is not assigned to a zone');
    }

    const existingLog = await WasteLogRepository.findTodaysLogByUser(userId);

    if (existingLog) {
      return WasteLogRepository.updateWasteLog(existingLog.id, {
        wasteCategories: dto.wasteCategories,
        segregationStatus: dto.segregationStatus,
        readyForPickup: dto.readyForPickup,
        quantityEstimate: dto.quantityEstimate,
      });
    }

    return WasteLogRepository.createWasteLog({
      userId,
      zoneId: resident.zoneId,
      wasteCategories: dto.wasteCategories,
      segregationStatus: dto.segregationStatus,
      readyForPickup: dto.readyForPickup,
      quantityEstimate: dto.quantityEstimate,
    });
  }

  static async getMyLogs(userId: string, page: number = 1, limit: number = 10) {
    return WasteLogRepository.findLogsByUser(userId, page, limit);
  }

  static async getZoneLogs(zoneId: string, date: Date, page: number = 1, limit: number = 10) {
    return WasteLogRepository.findLogsByZone(zoneId, date, page, limit);
  }

  static async getSegregationStats(zoneId: string, from: Date, to: Date) {
    return WasteLogRepository.getSegregationStats(zoneId, from, to);
  }
}
