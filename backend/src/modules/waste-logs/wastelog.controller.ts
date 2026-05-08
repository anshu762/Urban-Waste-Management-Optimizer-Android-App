import { Request, Response, NextFunction } from 'express';
import { WasteLogService } from './wastelog.service';
import { submitWasteLogSchema } from './wastelog.schema';
import { successResponse, errorResponse } from '../../lib/response';

export class WasteLogController {
  static async submitWasteLog(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = submitWasteLogSchema.parse(req.body);
      const log = await WasteLogService.submitWasteLog(req.user!.userId, dto);
      successResponse(res, log, 'Waste logged successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMyLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await WasteLogService.getMyLogs(req.user!.userId, page, limit);
      successResponse(res, logs, 'Fetched waste logs successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getZoneLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const zoneId = req.query.zone_id as string;
      const dateString = req.query.date as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!zoneId || !dateString) {
        return errorResponse(res, 'zone_id and date are required', 400);
      }

      const date = new Date(dateString);
      const logs = await WasteLogService.getZoneLogs(zoneId, date, page, limit);
      successResponse(res, logs, 'Fetched zone waste logs successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getSegregationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const zoneId = req.query.zone_id as string;
      const fromString = req.query.from as string;
      const toString = req.query.to as string;

      if (!zoneId || !fromString || !toString) {
        return errorResponse(res, 'zone_id, from, and to dates are required', 400);
      }

      const from = new Date(fromString);
      const to = new Date(toString);

      const stats = await WasteLogService.getSegregationStats(zoneId, from, to);
      successResponse(res, stats, 'Fetched segregation stats successfully');
    } catch (error) {
      next(error);
    }
  }
}
