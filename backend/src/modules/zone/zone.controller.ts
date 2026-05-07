import { Request, Response } from 'express';
import { zoneService } from './zone.service';
import { successResponse, errorResponse } from '../../lib/response';

export const getZones = async (req: Request, res: Response) => {
  try {
    const zones = await zoneService.getAllActiveZones();
    successResponse(res, zones, 'Zones retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
