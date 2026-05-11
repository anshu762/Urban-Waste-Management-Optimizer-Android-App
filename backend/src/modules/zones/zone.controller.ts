import { Request, Response } from 'express';
import { zoneService } from './zone.service';
import { createZoneSchema, updateZoneSchema } from './zone.schema';
import { successResponse } from '../../lib/response';

export const getZones = async (req: Request, res: Response, next: any) => {
  try {
    const zones = await zoneService.getAllZones();
    successResponse(res, zones, 'Zones retrieved successfully');
  } catch (error: any) {
    next(error);
  }
};

export const getZoneById = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const zone = await zoneService.getZoneById(String(id));
    successResponse(res, zone, 'Zone retrieved successfully');
  } catch (error: any) {
    next(error);
  }
};

export const createZone = async (req: Request, res: Response, next: any) => {
  try {
    const validatedData = createZoneSchema.parse(req.body);
    const newZone = await zoneService.createZone(validatedData);
    successResponse(res, newZone, 'Zone created successfully', 201);
  } catch (error: any) {
    next(error);
  }
};

export const updateZone = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const validatedData = updateZoneSchema.parse(req.body);
    const updatedZone = await zoneService.updateZone(String(id), validatedData);
    successResponse(res, updatedZone, 'Zone updated successfully');
  } catch (error: any) {
    next(error);
  }
};

export const deleteZone = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    await zoneService.deactivateZone(String(id));
    successResponse(res, null, 'Zone deleted successfully');
  } catch (error: any) {
    next(error);
  }
};
