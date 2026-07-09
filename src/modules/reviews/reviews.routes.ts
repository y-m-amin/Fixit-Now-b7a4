import { Router } from 'express';
import { Role } from '@prisma/client';
import * as reviewsController from './reviews.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createReviewSchema } from './reviews.validation';

const router = Router();

// Mounted at /api/reviews — customer-only, post-completion.
router.post(
  '/',
  authenticate(),
  authorize(Role.CUSTOMER),
  validate(createReviewSchema),
  reviewsController.createReview,
);

export default router;
