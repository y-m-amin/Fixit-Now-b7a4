import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
// Additional module routes (technicians, services, bookings, payments,
// reviews, categories, admin) are mounted here as they're built out.

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
