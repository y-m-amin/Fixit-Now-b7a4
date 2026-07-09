import { Router } from 'express';
import { Role } from '@prisma/client';
import * as paymentsController from './payments.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createPaymentSchema, paymentIdParamSchema, listPaymentsSchema } from './payments.validation';

const router = Router();

// Mounted at /api/payments — all routes require authentication.
router.use(authenticate());

router.post(
  '/create',
  authorize(Role.CUSTOMER),
  validate(createPaymentSchema),
  paymentsController.createPayment,
);
router.get('/', validate(listPaymentsSchema), paymentsController.getMyPayments);
router.get('/:id', validate(paymentIdParamSchema), paymentsController.getPaymentById);

export default router;
