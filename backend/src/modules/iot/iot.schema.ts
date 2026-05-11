// Mock IoT for demo purposes: validates pilot sensor payloads sent by demo devices.
import { z } from 'zod';

export const sensorReadingSchema = z.object({
  body: z.object({
    binId: z.string().min(1),
    zoneId: z.string().min(1),
    fillLevel: z.number().min(0).max(100),
    batteryStatus: z.number().min(0).max(100).optional(),
  }),
});

export type SensorReadingDto = z.infer<typeof sensorReadingSchema>['body'];
