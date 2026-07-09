import { Router } from 'express';
import { Role } from '@prisma/client';
import * as techniciansController from './technicians.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { updateTechnicianProfileSchema, updateAvailabilitySchema } from './technicians.validation';

const router = Router();

// All routes here are mounted at /api/technician and restricted to technicians.
router.use(authenticate(), authorize(Role.TECHNICIAN));

router.put(
  '/profile',
  validate(updateTechnicianProfileSchema),
  techniciansController.updateMyProfile,
);

router.put(
  '/availability',
  validate(updateAvailabilitySchema),
  techniciansController.updateMyAvailability,
);

export default router;
