import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/ApiResponse';
import * as categoriesService from './categories.service';

export const getCategories = catchAsync(async (_req, res: Response) => {
  const categories = await categoriesService.listCategories();
  return sendSuccess(res, 200, 'Categories fetched successfully', categories);
});

export const createCategory = catchAsync(async (req, res: Response) => {
  const category = await categoriesService.createCategory(req.body);
  return sendSuccess(res, 201, 'Category created successfully', category);
});
