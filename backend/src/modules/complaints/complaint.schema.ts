import { z } from 'zod';
import { ComplaintStatus } from '@prisma/client';

export const submitComplaintSchema = z.object({
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  relatedScheduleId: z.string().optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
});

export type SubmitComplaintDto = z.infer<typeof submitComplaintSchema>;
export type UpdateComplaintStatusDto = z.infer<typeof updateComplaintStatusSchema>;
