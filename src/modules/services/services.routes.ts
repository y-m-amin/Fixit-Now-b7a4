import { Router } from 'express';
import * as servicesController from './services.controller';
import { validate } from '../../middleware/validate.middleware';
import { listServicesSchema } from './services.validation';

const router = Router();

// GET /api/services — public, filterable by category/location/rating/price
router.get('/', validate(listServicesSchema), servicesController.getServices);

export default router;
