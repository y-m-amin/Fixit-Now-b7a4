import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createPaymentSchema = z.object({
  body: z
    .object({
      bookingId: z.string().uuid('Invalid booking id'),
      method: z.enum([PaymentMethod.STRIPE, PaymentMethod.SSLCOMMERZ]).default(PaymentMethod.STRIPE),
    })
    .strict(),
});

export const paymentIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid payment id') }),
});

export const listPaymentsSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .partial(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type ListPaymentsQuery = z.infer<typeof listPaymentsSchema>['query'];
