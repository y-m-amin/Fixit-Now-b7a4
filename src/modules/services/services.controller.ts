import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as servicesService from './services.service';

export const getServices = catchAsync(async (req, res: Response) => {
  const result = await servicesService.listServices(req.query as never);
  return sendSuccess(res, 200, 'Services fetched successfully', result);
});

export const createService = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const service = await servicesService.createOwnService(req.user!.id, req.body);
  return sendSuccess(res, 201, 'Service created successfully', service);
});

export const updateService = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const service = await servicesService.updateOwnService(req.user!.id, req.params.id, req.body);
  return sendSuccess(res, 200, 'Service updated successfully', service);
});

export const deleteService = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await servicesService.deleteOwnService(req.user!.id, req.params.id);
  return sendSuccess(res, 200, 'Service deleted successfully', null);
});
