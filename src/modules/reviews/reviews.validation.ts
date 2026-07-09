import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z
    .object({
      bookingId: z.string().uuid('Invalid booking id'),
      rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
      comment: z.string().trim().max(1000).optional(),
    })
    .strict(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
