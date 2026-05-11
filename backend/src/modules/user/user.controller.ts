import { Request, Response } from 'express';
import { userService } from './user.service';
import { successResponse } from '../../lib/response';
import { Errors } from '../../lib/app-error';

export const updateProfile = async (req: Request, res: Response, next: any) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    if (role !== 'RESIDENT') {
      throw Errors.unauthorized();
    }

    const result = await userService.updateResidentProfile(userId, req.body);
    successResponse(res, result, 'Profile updated successfully');
  } catch (error: any) {
    next(error);
  }
};

export const getDrivers = async (req: Request, res: Response, next: any) => {
  try {
    const result = await userService.listDrivers();
    successResponse(res, result, 'Drivers fetched successfully');
  } catch (error: any) {
    next(error);
  }
};

export const updatePushToken = async (req: Request, res: Response, next: any) => {
  try {
    const userId = req.user!.userId;
    const { pushToken } = req.body;

    if (pushToken !== null && typeof pushToken !== 'string') {
      throw Errors.validationFailed();
    }

    const result = await userService.updatePushToken(userId, pushToken);
    successResponse(res, result, 'Push token updated successfully');
  } catch (error: any) {
    next(error);
  }
};
