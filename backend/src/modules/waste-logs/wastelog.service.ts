import { WasteLogRepository } from './wastelog.repository';
import { SubmitWasteLogDto } from './wastelog.schema';
import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/app-error';

export class WasteLogService {
  static async submitWasteLog(userId: string, dto: SubmitWasteLogDto) {
    const resident = await prisma.residentProfile.findUnique({
      where: { userId },
    });

    if (!resident || !resident.zoneId) {
      throw Errors.userNotFound();
    }

    const existingLog = await WasteLogRepository.findTodaysLogByUser(userId);

    if (existingLog) {
      // Prompt says: "alreadyLoggedToday: () => new AppError(409, "You've already logged your waste today. Your log has been updated.", "ALREADY_LOGGED_TODAY")"
      // Even if it says "Your log has been updated", throwing 409 will show this message.
      // Let's stick to update logic but throw if the user wants strict error handling.
      // Actually, let's update AND throw the error so the user gets the message but data is saved? 
      // No, usually errors don't save data. But the message says "has been updated".
      // I'll update it first, then throw the error to show the message.
      await WasteLogRepository.updateWasteLog(existingLog.id, {
        wasteCategories: dto.wasteCategories,
        segregationStatus: dto.segregationStatus,
        readyForPickup: dto.readyForPickup,
        quantityEstimate: dto.quantityEstimate,
      });
      throw Errors.alreadyLoggedToday();
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
