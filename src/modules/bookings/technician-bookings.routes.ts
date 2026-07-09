import { Router } from 'express';
import { Role } from '@prisma/client';
import * as bookingsController from './bookings.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { listBookingsSchema, updateBookingStatusSchema } from './bookings.validation';

const router = Router();

// Mounted at /api/technician/bookings — technician-only.
router.use(authenticate(), authorize(Role.TECHNICIAN));

router.get('/', validate(listBookingsSchema), bookingsController.getMyBookings);
router.patch('/:id', validate(updateBookingStatusSchema), bookingsController.updateBookingStatus);

export default router;
