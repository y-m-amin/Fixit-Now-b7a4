import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as paymentsService from './payments.service';

export const createPayment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await paymentsService.createPaymentForBooking(req.user!.id, req.body);
  return sendSuccess(res, 201, 'Payment created successfully', result);
});

// Note: this route uses express.raw() upstream (see app.ts) so req.body
// here is the raw Buffer needed for Stripe signature verification.
export const confirmPayment = catchAsync(async (req, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    throw ApiError.badRequest('Missing Stripe signature header');
  }

  const result = await paymentsService.handleStripeWebhook(req.body as Buffer, signature);
  return sendSuccess(res, 200, 'Webhook processed', result);
});

export const getMyPayments = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await paymentsService.listMyPayments(
    req.user!.id,
    req.user!.role,
    req.query as never,
  );
  return sendSuccess(res, 200, 'Payment history fetched successfully', result);
});

export const getPaymentById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const payment = await paymentsService.getPaymentById(
    req.params.id,
    req.user!.id,
    req.user!.role,
  );
  return sendSuccess(res, 200, 'Payment fetched successfully', payment);
});
