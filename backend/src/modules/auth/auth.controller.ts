import { Request, Response } from 'express';
import { authService } from './auth.service';
import { successResponse, errorResponse } from '../../lib/response';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);
    successResponse(res, result, 'Registration successful', 201);
  } catch (error: any) {
    if (error.message === 'Email already in use' || error.message === 'Mobile number already in use') {
      errorResponse(res, error.message, 409);
    } else {
      errorResponse(res, error.message, 500);
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);
    successResponse(res, result, 'Login successful');
  } catch (error: any) {
    if (error.message === 'Invalid credentials' || error.message === 'Account is inactive') {
      errorResponse(res, error.message, 401);
    } else {
      errorResponse(res, error.message, 500);
    }
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await authService.getMe(userId);
    successResponse(res, result, 'User retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
};
