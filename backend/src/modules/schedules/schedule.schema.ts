import { z } from 'zod';
import { WasteCategory } from '@prisma/client';

export const createScheduleSchema = z.object({
  zoneId: z.string().min(1, 'Zone ID is required'),
  wasteCategory: z.nativeEnum(WasteCategory),
  pickupDay: z.number().min(0).max(6), // 0=Sun, 1=Mon, ..., 6=Sat
  pickupTimeWindow: z.string().min(1, 'Pickup time window is required'),
});

export const updateScheduleSchema = z.object({
  wasteCategory: z.nativeEnum(WasteCategory).optional(),
  pickupDay: z.number().min(0).max(6).optional(),
  pickupTimeWindow: z.string().min(1, 'Pickup time window is required').optional(),
  isActive: z.boolean().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
