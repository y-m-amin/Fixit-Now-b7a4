import { Router } from 'express';
import * as techniciansController from './technicians.controller';
import { validate } from '../../middleware/validate.middleware';
import { listTechniciansSchema, technicianIdParamSchema } from './technicians.validation';

const router = Router();

// GET /api/technicians — public, filterable
router.get('/', validate(listTechniciansSchema), techniciansController.getTechnicians);

// GET /api/technicians/:id — public, profile + reviews
router.get('/:id', validate(technicianIdParamSchema), techniciansController.getTechnicianById);

export default router;
