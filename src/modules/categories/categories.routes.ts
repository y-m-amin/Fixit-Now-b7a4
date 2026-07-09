import { Router } from 'express';
import * as categoriesController from './categories.controller';

const router = Router();

// GET /api/categories — public
router.get('/', categoriesController.getCategories);

export default router;
