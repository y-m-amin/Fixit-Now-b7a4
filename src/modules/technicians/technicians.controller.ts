import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as techniciansService from './technicians.service';

export const getTechnicians = catchAsync(async (req, res: Response) => {
  const result = await techniciansService.listTechnicians(req.query as never);
  return sendSuccess(res, 200, 'Technicians fetched successfully', result);
});

export const getTechnicianById = catchAsync(async (req, res: Response) => {
  const technician = await techniciansService.getTechnicianById(req.params.id);
  return sendSuccess(res, 200, 'Technician profile fetched successfully', technician);
});

export const updateMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await techniciansService.updateOwnProfile(req.user!.id, req.body);
  return sendSuccess(res, 200, 'Technician profile updated successfully', profile);
});

export const updateMyAvailability = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const slots = await techniciansService.setOwnAvailability(req.user!.id, req.body);
  return sendSuccess(res, 200, 'Availability updated successfully', slots);
});
