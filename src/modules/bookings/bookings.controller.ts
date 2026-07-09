import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as bookingsService from './bookings.service';

export const createBooking = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await bookingsService.createBooking(req.user!.id, req.body);
  return sendSuccess(res, 201, 'Booking created successfully', booking);
});

export const getMyBookings = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await bookingsService.listMyBookings(
    req.user!.id,
    req.user!.role,
    req.query as never,
  );
  return sendSuccess(res, 200, 'Bookings fetched successfully', result);
});

export const getBookingById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await bookingsService.getBookingById(
    req.params.id,
    req.user!.id,
    req.user!.role,
  );
  return sendSuccess(res, 200, 'Booking fetched successfully', booking);
});

export const cancelBooking = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await bookingsService.cancelBooking(req.params.id, req.user!.id);
  return sendSuccess(res, 200, 'Booking cancelled successfully', booking);
});

export const updateBookingStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await bookingsService.updateBookingStatusByTechnician(
    req.params.id,
    req.user!.id,
    req.body,
  );
  return sendSuccess(res, 200, 'Booking status updated successfully', booking);
});
