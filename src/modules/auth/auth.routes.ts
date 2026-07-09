import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.validation';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate(), authController.me);

export default router;
