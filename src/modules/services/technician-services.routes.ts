import { Router } from 'express';
import { Role } from '@prisma/client';
import * as servicesController from './services.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createServiceSchema, updateServiceSchema } from './services.validation';

const router = Router();

// Mounted at /api/technician/services — technician-only management of their own listings.
router.use(authenticate(), authorize(Role.TECHNICIAN));

router.post('/', validate(createServiceSchema), servicesController.createService);
router.put('/:id', validate(updateServiceSchema), servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

export default router;
