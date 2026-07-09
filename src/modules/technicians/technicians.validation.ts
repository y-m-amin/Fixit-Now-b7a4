import { z } from 'zod';

export const listTechniciansSchema = z.object({
  query: z
    .object({
      category: z.string().trim().optional(),
      location: z.string().trim().optional(),
      minRating: z.coerce.number().min(0).max(5).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .partial({ page: true, limit: true }),
});

export const technicianIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid technician id'),
  }),
});

export const updateTechnicianProfileSchema = z.object({
  body: z
    .object({
      bio: z.string().trim().max(2000).optional(),
      experienceYears: z.coerce.number().int().min(0).max(60).optional(),
      hourlyRate: z.coerce.number().positive().optional(),
      skills: z.array(z.string().trim()).optional(),
      location: z.string().trim().optional(),
    })
    .strict(),
});

export const updateAvailabilitySchema = z.object({
  body: z
    .object({
      slots: z
        .array(
          z.object({
            dayOfWeek: z.number().int().min(0).max(6),
            startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'),
            endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'),
          }),
        )
        .min(1, 'Provide at least one availability slot'),
    })
    .strict(),
});

export type ListTechniciansQuery = z.infer<typeof listTechniciansSchema>['query'];
export type UpdateTechnicianProfileInput = z.infer<typeof updateTechnicianProfileSchema>['body'];
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>['body'];
