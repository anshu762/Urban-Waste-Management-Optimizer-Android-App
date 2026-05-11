import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { successResponse, errorResponse } from '../../lib/response';

export const getDemandEstimate = async (req: Request, res: Response) => {
  try {
    const { zone_id } = req.query;
    if (!zone_id || typeof zone_id !== 'string') {
      return errorResponse(res, 'zone_id is required', 400);
    }
    const data = await analyticsService.estimateTomorrowDemand(zone_id);
    return successResponse(res, data, 'Demand estimate retrieved', 200);
  } catch (error: any) {
    return errorResponse(res, 'Failed to get demand estimate', 500, error.message);
  }
};

export const getZoneRankings = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getZonePriorityRanking();
    return successResponse(res, data, 'Zone rankings retrieved', 200);
  } catch (error: any) {
    return errorResponse(res, 'Failed to get zone rankings', 500, error.message);
  }
};

export const getComplianceTrend = async (req: Request, res: Response) => {
  try {
    const { zone_id } = req.query;
    if (!zone_id || typeof zone_id !== 'string') {
      return errorResponse(res, 'zone_id is required', 400);
    }
    const data = await analyticsService.getComplianceTrend(zone_id);
    return successResponse(res, data, 'Compliance trend retrieved', 200);
  } catch (error: any) {
    return errorResponse(res, 'Failed to get compliance trend', 500, error.message);
  }
};

export const getWeeklyForecast = async (req: Request, res: Response) => {
  try {
    const { zone_id } = req.query;
    if (!zone_id || typeof zone_id !== 'string') {
      return errorResponse(res, 'zone_id is required', 400);
    }
    const data = await analyticsService.getWeeklyForecast(zone_id);
    return successResponse(res, data, 'Weekly forecast retrieved', 200);
  } catch (error: any) {
    return errorResponse(res, 'Failed to get weekly forecast', 500, error.message);
  }
};

export const getInactiveResidents = async (req: Request, res: Response) => {
  try {
    const { zone_id } = req.query;
    if (!zone_id || typeof zone_id !== 'string') {
      return errorResponse(res, 'zone_id is required', 400);
    }
    const data = await analyticsService.getInactiveResidentAlerts(zone_id);
    return successResponse(res, data, 'Inactive residents retrieved', 200);
  } catch (error: any) {
    return errorResponse(res, 'Failed to get inactive residents', 500, error.message);
  }
};

export const clearCache = async (req: Request, res: Response) => {
  try {
    const data = analyticsService.clearCache();
    return successResponse(res, data, 'Cache cleared successfully', 200);
  } catch (error: any) {
    return errorResponse(res, 'Failed to clear cache', 500, error.message);
  }
};
