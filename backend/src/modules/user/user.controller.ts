import { Request, Response } from 'express';
import { userService } from './user.service';
import { successResponse, errorResponse } from '../../lib/response';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    if (role !== 'RESIDENT') {
      return errorResponse(res, 'Only residents can update this profile', 403);
    }

    const result = await userService.updateResidentProfile(userId, req.body);
    successResponse(res, result, 'Profile updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const result = await userService.listDrivers();
    successResponse(res, result, 'Drivers fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
