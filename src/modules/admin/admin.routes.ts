import { Router } from 'express';
import { Role } from '@prisma/client';
import * as adminController from './admin.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
  listUsersSchema,
  updateUserStatusSchema,
  listAllBookingsSchema,
} from './admin.validation';
import { createCategorySchema } from '../categories/categories.validation';

const router = Router();

// Mounted at /api/admin — admin-only.
router.use(authenticate(), authorize(Role.ADMIN));

router.get('/users', validate(listUsersSchema), adminController.getUsers);
router.patch('/users/:id', validate(updateUserStatusSchema), adminController.updateUserStatus);

router.get('/bookings', validate(listAllBookingsSchema), adminController.getAllBookings);

router.get('/categories', adminController.getCategories);
router.post('/categories', validate(createCategorySchema), adminController.createCategory);

export default router;
