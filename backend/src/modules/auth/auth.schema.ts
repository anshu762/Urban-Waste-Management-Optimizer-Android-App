import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional(),
    mobile: z.string().min(10, 'Mobile must be at least 10 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['RESIDENT', 'ADMIN', 'DRIVER']),
  }).refine((data) => data.email || data.mobile, {
    message: 'Either email or mobile must be provided',
    path: ['email'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    mobile: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  }).refine((data) => data.email || data.mobile, {
    message: 'Either email or mobile must be provided',
    path: ['email'],
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
