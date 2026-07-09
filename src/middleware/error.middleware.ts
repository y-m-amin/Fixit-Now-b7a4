import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

/**
 * Catches any request to a route that doesn't exist and forwards a
 * consistent 404 ApiError instead of Express's default HTML response.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Single place where every error in the app is normalized into:
 * { success: false, message, errorDetails }
 * Must be registered LAST, after all routes.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetails: unknown = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this value already exists';
      errorDetails = { fields: err.meta?.target ?? null };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      errorDetails = null;
    } else {
      statusCode = 400;
      message = 'Database request error';
      errorDetails = env.isProd ? null : { code: err.code, meta: err.meta };
    }
  } else if (err instanceof Error) {
    message = err.message || message;
    errorDetails = env.isProd ? null : { stack: err.stack };
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
}
