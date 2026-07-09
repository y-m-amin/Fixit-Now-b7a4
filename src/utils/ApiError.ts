/**
 * Standard application error. Thrown anywhere in the app (controllers,
 * services, middleware) and caught by the global error handler, which
 * converts it into the consistent JSON error shape.
 */
export class ApiError extends Error {
  public statusCode: number;
  public errorDetails: unknown;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, errorDetails: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    this.isOperational = true;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errorDetails: unknown = null) {
    return new ApiError(400, message, errorDetails);
  }

  static unauthorized(message = 'Unauthorized', errorDetails: unknown = null) {
    return new ApiError(401, message, errorDetails);
  }

  static forbidden(message = 'Forbidden', errorDetails: unknown = null) {
    return new ApiError(403, message, errorDetails);
  }

  static notFound(message = 'Resource not found', errorDetails: unknown = null) {
    return new ApiError(404, message, errorDetails);
  }

  static conflict(message = 'Conflict', errorDetails: unknown = null) {
    return new ApiError(409, message, errorDetails);
  }

  static internal(message = 'Internal server error', errorDetails: unknown = null) {
    return new ApiError(500, message, errorDetails);
  }
}
