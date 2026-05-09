import { ComplaintRepository } from './complaint.repository';
import { SubmitComplaintDto, UpdateComplaintStatusDto } from './complaint.schema';
import { prisma } from '../../lib/prisma';
import { uploadImage } from '../../lib/cloudinary';
import { ComplaintStatus } from '@prisma/client';
import { notificationService } from '../notifications/notification.service';

export class ComplaintService {
  static async submitComplaint(userId: string, dto: SubmitComplaintDto, imageFile?: Express.Multer.File) {
    const resident = await prisma.residentProfile.findUnique({
      where: { userId },
    });

    if (!resident || !resident.zoneId) {
      throw new Error('Resident profile not found or user is not assigned to a zone');
    }

    let imageUrl = null;
    if (imageFile) {
      const uploadResult = await uploadImage(imageFile.buffer, 'complaints');
      imageUrl = uploadResult.url;
    }

    const complaint = await ComplaintRepository.createComplaint({
      userId,
      zoneId: resident.zoneId,
      note: dto.note,
      relatedScheduleId: dto.relatedScheduleId,
      imageUrl,
    });

    await notificationService.notifyAdminNewComplaint(complaint);
    return complaint;
  }

  static async getMyComplaints(userId: string, page: number = 1, limit: number = 10) {
    return ComplaintRepository.findComplaintsByUser(userId, page, limit);
  }

  static async getAllComplaints(filters: { zoneId?: string; status?: ComplaintStatus }, page: number = 1, limit: number = 10) {
    return ComplaintRepository.findAllComplaints(filters, page, limit);
  }

  static async resolveComplaint(complaintId: string, status: ComplaintStatus) {
    const complaint = await ComplaintRepository.findComplaintById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    return ComplaintRepository.updateComplaintStatus(complaintId, status);
  }

  static async getComplaintById(id: string) {
    return ComplaintRepository.findComplaintById(id);
  }
}
