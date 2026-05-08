import { z } from 'zod';

export const createZoneSchema = z.object({
  zoneName: z.string().min(2, 'Zone name must be at least 2 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  areaCode: z.string().optional(),
});

export const updateZoneSchema = z.object({
  zoneName: z.string().min(2, 'Zone name must be at least 2 characters').optional(),
  city: z.string().min(2, 'City must be at least 2 characters').optional(),
  areaCode: z.string().optional(),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;
