import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as reviewsService from './reviews.service';

export const createReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const review = await reviewsService.createReview(req.user!.id, req.body);
  return sendSuccess(res, 201, 'Review submitted successfully', review);
});
