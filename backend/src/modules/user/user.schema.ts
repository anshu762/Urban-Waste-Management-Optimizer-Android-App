import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    zoneId: z.string().optional(),
    buildingName: z.string().optional(),
    block: z.string().optional(),
    street: z.string().optional(),
    landmark: z.string().optional(),
    houseNumber: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
