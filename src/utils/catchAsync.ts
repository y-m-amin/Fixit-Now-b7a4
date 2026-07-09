import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler so any thrown error / rejected promise is
 * forwarded to Express's error-handling middleware instead of crashing
 * the process or requiring a try/catch in every controller.
 */
export function catchAsync(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
