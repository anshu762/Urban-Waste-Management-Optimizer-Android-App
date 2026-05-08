import { z } from 'zod';
import { WasteCategory, SegregationStatus } from '@prisma/client';

export const submitWasteLogSchema = z.object({
  wasteCategories: z.array(z.nativeEnum(WasteCategory)).min(1, 'At least one waste category must be selected'),
  segregationStatus: z.nativeEnum(SegregationStatus),
  readyForPickup: z.boolean().optional().default(true),
  quantityEstimate: z.string().optional(),
});

export type SubmitWasteLogDto = z.infer<typeof submitWasteLogSchema>;
