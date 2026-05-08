import { Request, Response } from 'express';
import { zoneService } from './zone.service';
import { createZoneSchema, updateZoneSchema } from './zone.schema';
import { successResponse, errorResponse } from '../../lib/response';

export const getZones = async (req: Request, res: Response) => {
  try {
    const zones = await zoneService.getAllZones();
    successResponse(res, zones, 'Zones retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getZoneById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const zone = await zoneService.getZoneById(String(id));
    successResponse(res, zone, 'Zone retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
};

export const createZone = async (req: Request, res: Response) => {
  try {
    const validatedData = createZoneSchema.parse(req.body);
    const newZone = await zoneService.createZone(validatedData);
    successResponse(res, newZone, 'Zone created successfully', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'Validation Error', 400, error.errors);
    }
    errorResponse(res, error.message, 500);
  }
};

export const updateZone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateZoneSchema.parse(req.body);
    const updatedZone = await zoneService.updateZone(String(id), validatedData);
    successResponse(res, updatedZone, 'Zone updated successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'Validation Error', 400, error.errors);
    }
    if (error.message === 'Zone not found') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const deleteZone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await zoneService.deactivateZone(String(id));
    successResponse(res, null, 'Zone deleted successfully');
  } catch (error: any) {
    if (error.message === 'Zone not found') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};
