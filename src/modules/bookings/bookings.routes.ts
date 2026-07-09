import { Router } from 'express';
import { Role } from '@prisma/client';
import * as bookingsController from './bookings.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
  createBookingSchema,
  bookingIdParamSchema,
  listBookingsSchema,
} from './bookings.validation';

const router = Router();

// Mounted at /api/bookings — all routes require authentication.
router.use(authenticate());

router.post('/', authorize(Role.CUSTOMER), validate(createBookingSchema), bookingsController.createBooking);
router.get('/', validate(listBookingsSchema), bookingsController.getMyBookings);
router.get('/:id', validate(bookingIdParamSchema), bookingsController.getBookingById);
router.patch(
  '/:id/cancel',
  authorize(Role.CUSTOMER),
  validate(bookingIdParamSchema),
  bookingsController.cancelBooking,
);

export default router;
