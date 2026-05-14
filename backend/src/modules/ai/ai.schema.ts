import { z } from 'zod';

export const classifyWasteSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
});

export type ClassifyWasteDto = z.infer<typeof classifyWasteSchema>;

export interface WasteResult {
  isWaste: boolean;
  wasteType?: string;
  dustbinColor?: string;
  confidence?: number;
  tip?: string;
  message?: string;
}
