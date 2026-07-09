import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/categories.routes';
import technicianPublicRoutes from './modules/technicians/technicians.routes';
import technicianSelfRoutes from './modules/technicians/technician-self.routes';
import servicePublicRoutes from './modules/services/services.routes';
import technicianServiceRoutes from './modules/services/technician-services.routes';
// Additional module routes (bookings, payments, reviews, admin) are
// mounted here as they're built out.

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'FixItNow API is healthy', data: null });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/technicians', technicianPublicRoutes);
  app.use('/api/technician', technicianSelfRoutes);
  app.use('/api/services', servicePublicRoutes);
  app.use('/api/technician/services', technicianServiceRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
