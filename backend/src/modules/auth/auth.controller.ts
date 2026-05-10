import { Request, Response } from 'express';
import { authService } from './auth.service';
import { successResponse } from '../../lib/response';

export const register = async (req: Request, res: Response, next: any) => {
  try {
    const result = await authService.registerUser(req.body);
    successResponse(res, result, 'Registration successful', 201);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: any) => {
  try {
    const result = await authService.loginUser(req.body);
    successResponse(res, result, 'Login successful');
  } catch (error: any) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: any) => {
  try {
    const userId = req.user!.userId;
    const result = await authService.getMe(userId);
    successResponse(res, result, 'User retrieved successfully');
  } catch (error: any) {
    next(error);
  }
};
