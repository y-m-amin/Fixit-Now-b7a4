import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters'),
      email: z.string().trim().toLowerCase().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      phone: z.string().trim().optional(),
      role: z.enum([Role.CUSTOMER, Role.TECHNICIAN]).default(Role.CUSTOMER),
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().trim().toLowerCase().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    })
    .strict(),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
