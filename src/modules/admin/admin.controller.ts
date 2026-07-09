import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import * as adminService from './admin.service';
import * as categoriesService from '../categories/categories.service';

export const getUsers = catchAsync(async (req, res: Response) => {
  const result = await adminService.listAllUsers(req.query as never);
  return sendSuccess(res, 200, 'Users fetched successfully', result);
});

export const updateUserStatus = catchAsync(async (req, res: Response) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body);
  return sendSuccess(res, 200, 'User status updated successfully', user);
});

export const getAllBookings = catchAsync(async (req, res: Response) => {
  const result = await adminService.listAllBookings(req.query as never);
  return sendSuccess(res, 200, 'Bookings fetched successfully', result);
});

export const getCategories = catchAsync(async (_req, res: Response) => {
  const categories = await categoriesService.listCategories();
  return sendSuccess(res, 200, 'Categories fetched successfully', categories);
});

export const createCategory = catchAsync(async (req, res: Response) => {
  const category = await categoriesService.createCategory(req.body);
  return sendSuccess(res, 201, 'Category created successfully', category);
});
