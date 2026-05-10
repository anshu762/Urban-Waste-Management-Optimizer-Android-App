import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { successResponse, errorResponse } from '../../lib/response';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await notificationService.getUserNotifications(userId, page, limit);
    return successResponse(res, data, 'Notifications retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
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

export const sendBulkNotification = async (req: Request, res: Response) => {
  try {
    const { userIds, title, body } = req.body;
    if (!Array.isArray(userIds) || !title || !body) {
      return errorResponse(res, 'userIds array, title, and body are required', 400);
    }
    
    // We run this asynchronously since it can take time
    Promise.all(userIds.map(id => notificationService.notifyUser(id, title, body)))
      .catch(err => console.error('Bulk notification error:', err));
      
    return successResponse(res, { count: userIds.length }, `Bulk notification queued for ${userIds.length} users`);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};
