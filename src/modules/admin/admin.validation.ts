import { z } from 'zod';
import { UserStatus, BookingStatus, Role } from '@prisma/client';

export const listUsersSchema = z.object({
  query: z
    .object({
      role: z.nativeEnum(Role).optional(),
      status: z.nativeEnum(UserStatus).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .partial({ page: true, limit: true }),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid user id') }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid user id') }),
  body: z
    .object({
      status: z.nativeEnum(UserStatus),
    })
    .strict(),
});

export const listAllBookingsSchema = z.object({
  query: z
    .object({
      status: z.nativeEnum(BookingStatus).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .partial({ page: true, limit: true }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type ListAllBookingsQuery = z.infer<typeof listAllBookingsSchema>['query'];
