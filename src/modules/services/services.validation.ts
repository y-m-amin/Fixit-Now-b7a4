import { z } from 'zod';
import { PriceType } from '@prisma/client';

export const listServicesSchema = z.object({
  query: z
    .object({
      category: z.string().trim().optional(),
      location: z.string().trim().optional(),
      minRating: z.coerce.number().min(0).max(5).optional(),
      maxPrice: z.coerce.number().positive().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .partial({ page: true, limit: true }),
});

export const serviceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid service id'),
  }),
});

export const createServiceSchema = z.object({
  body: z
    .object({
      categoryId: z.string().uuid('Invalid category id'),
      title: z.string().trim().min(3, 'Title must be at least 3 characters'),
      description: z.string().trim().max(2000).optional(),
      price: z.coerce.number().positive('Price must be greater than 0'),
      priceType: z.enum([PriceType.FIXED, PriceType.HOURLY]).default(PriceType.FIXED),
    })
    .strict(),
});

export const updateServiceSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid service id') }),
  body: z
    .object({
      categoryId: z.string().uuid('Invalid category id').optional(),
      title: z.string().trim().min(3).optional(),
      description: z.string().trim().max(2000).optional(),
      price: z.coerce.number().positive().optional(),
      priceType: z.enum([PriceType.FIXED, PriceType.HOURLY]).optional(),
    })
    .strict(),
});

export type ListServicesQuery = z.infer<typeof listServicesSchema>['query'];
export type CreateServiceInput = z.infer<typeof createServiceSchema>['body'];
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>['body'];
