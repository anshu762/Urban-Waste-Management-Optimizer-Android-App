import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../lib/response';
import { classifyWasteImage } from './ai.service';

export class AIController {
  static async classifyWaste(req: Request, res: Response, next: NextFunction) {
    try {
      const { image } = req.body;

      const mimeType = req.body.mimeType || 'image/jpeg';
      const result = await classifyWasteImage(image, mimeType);

      successResponse(res, result, 'Classification complete');
    } catch (error) {
      next(error);
    }
  }
}
