import { Request, Response } from 'express';
import { scheduleService } from './schedule.service';
import { createScheduleSchema, updateScheduleSchema } from './schedule.schema';
import { successResponse, errorResponse } from '../../lib/response';

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { zone_id } = req.query;
    if (!zone_id) return errorResponse(res, 'zone_id is required', 400);
    
    const schedules = await scheduleService.getSchedulesByZone(String(zone_id));
    successResponse(res, schedules, 'Schedules retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getUpcomingPickups = async (req: Request, res: Response) => {
  try {
    const { zone_id } = req.query;
    if (!zone_id) return errorResponse(res, 'zone_id is required', 400);

    const pickups = await scheduleService.getUpcomingPickups(String(zone_id));
    successResponse(res, pickups, 'Upcoming pickups retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const validatedData = createScheduleSchema.parse(req.body);
    const schedule = await scheduleService.createSchedule(validatedData);
    successResponse(res, schedule, 'Schedule created successfully', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return errorResponse(res, 'Validation Error', 400, error.errors);
    errorResponse(res, error.message, 500);
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateScheduleSchema.parse(req.body);
    const updated = await scheduleService.updateSchedule(String(id), validatedData);
    successResponse(res, updated, 'Schedule updated successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') return errorResponse(res, 'Validation Error', 400, error.errors);
    errorResponse(res, error.message, 500);
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await scheduleService.deactivate(String(id));
    successResponse(res, null, 'Schedule deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
