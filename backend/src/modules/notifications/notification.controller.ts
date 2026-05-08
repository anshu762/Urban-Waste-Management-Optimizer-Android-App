import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { successResponse, errorResponse } from '../../lib/response';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await notificationService.getUserNotifications(userId, page, limit);
    successResponse(res, data, 'Notifications retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(String(id));
    successResponse(res, notification, 'Notification marked as read');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
