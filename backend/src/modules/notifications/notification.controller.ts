import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { successResponse } from '../../lib/response';

export const getMyNotifications = async (req: Request, res: Response, next: any) => {
  try {
    const userId = (req as any).user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await notificationService.getUserNotifications(userId, page, limit);
    return successResponse(res, data, 'Notifications retrieved successfully');
  } catch (error: any) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(String(id));
    successResponse(res, notification, 'Notification marked as read');
  } catch (error: any) {
    next(error);
  }
};

export const sendBulkNotification = async (req: Request, res: Response, next: any) => {
  try {
    const { userIds, title, body } = req.body;
    if (!Array.isArray(userIds) || !title || !body) {
      throw new Error('userIds array, title, and body are required');
    }
    
    // We run this asynchronously since it can take time
    Promise.all(userIds.map(id => notificationService.notifyUser(id, title, body)))
      .catch(err => console.error('Bulk notification error:', err));
      
    return successResponse(res, { count: userIds.length }, `Bulk notification queued for ${userIds.length} users`);
  } catch (error: any) {
    next(error);
  }
};
