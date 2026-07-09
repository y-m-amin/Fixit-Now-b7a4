import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const createBookingSchema = z.object({
  body: z
    .object({
      serviceId: z.string().uuid('Invalid service id'),
      scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
        message: 'scheduledAt must be in the future',
      }),
      address: z.string().trim().min(5, 'Address is required'),
      notes: z.string().trim().max(1000).optional(),
    })
    .strict(),
});

export const bookingIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid booking id') }),
});

export const listBookingsSchema = z.object({
  query: z
    .object({
      status: z.nativeEnum(BookingStatus).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .partial({ page: true, limit: true }),
});

// Technician-driven status transitions only. PAID is set by the payments
// module, never directly by a client.
export const updateBookingStatusSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid booking id') }),
  body: z
    .object({
      status: z.enum([
        BookingStatus.ACCEPTED,
        BookingStatus.DECLINED,
        BookingStatus.IN_PROGRESS,
        BookingStatus.COMPLETED,
      ]),
    })
    .strict(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
export type ListBookingsQuery = z.infer<typeof listBookingsSchema>['query'];
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>['body'];
