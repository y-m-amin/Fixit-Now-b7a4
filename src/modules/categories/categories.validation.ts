import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters'),
      description: z.string().trim().optional(),
      icon: z.string().trim().optional(),
    })
    .strict(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
