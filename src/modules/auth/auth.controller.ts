import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as authService from './auth.service';

export const register = catchAsync(async (req, res: Response) => {
  const result = await authService.registerUser(req.body);
  return sendSuccess(res, 201, 'Registration successful', result);
});

export const login = catchAsync(async (req, res: Response) => {
  const result = await authService.loginUser(req.body);
  return sendSuccess(res, 200, 'Login successful', result);
});

export const me = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  return sendSuccess(res, 200, 'Current user fetched successfully', user);
});
