import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from './complaint.service';
import { submitComplaintSchema, updateComplaintStatusSchema } from './complaint.schema';
import { successResponse, errorResponse } from '../../lib/response';
import { ComplaintStatus } from '@prisma/client';

export class ComplaintController {
  static async submitComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = submitComplaintSchema.parse(req.body);
      const file = req.file;
      const complaint = await ComplaintService.submitComplaint(req.user!.userId, dto, file);
      successResponse(res, complaint, 'Complaint submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const complaints = await ComplaintService.getMyComplaints(req.user!.userId, page, limit);
      successResponse(res, complaints, 'Fetched your complaints successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAllComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        zoneId: req.query.zone_id as string,
        status: req.query.status as ComplaintStatus,
      };

      const complaints = await ComplaintService.getAllComplaints(filters, page, limit);
      successResponse(res, complaints, 'Fetched complaints successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getComplaintById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const complaint = await ComplaintService.getComplaintById(id);
      
      if (!complaint) {
        return errorResponse(res, 'Complaint not found', 404);
      }
      
      successResponse(res, complaint, 'Fetched complaint details successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateComplaintStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = updateComplaintStatusSchema.parse(req.body);
      const updatedComplaint = await ComplaintService.resolveComplaint(id, status);
      successResponse(res, updatedComplaint, 'Complaint status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
