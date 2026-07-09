import { Response } from 'express';

/**
 * Every successful response in the API follows this shape:
 * { success: true, message: string, data: T }
 * This mirrors the error shape { success: false, message, errorDetails }
 * so clients can rely on a single consistent envelope.
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}
