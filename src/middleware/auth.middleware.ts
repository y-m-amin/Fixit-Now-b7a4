import { Request, Response, NextFunction } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email: string;
  };
}

/**
 * Verifies the Bearer JWT, loads the user, and rejects banned accounts.
 * Attaches the authenticated user to req.user for downstream handlers.
 */
export function authenticate() {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Authentication token missing');
      }

      const token = header.split(' ')[1];
      const payload = verifyToken(token);

      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        throw ApiError.unauthorized('User no longer exists');
      }
      if (user.status === UserStatus.BANNED) {
        throw ApiError.forbidden('This account has been banned');
      }

      req.user = { id: user.id, role: user.role, email: user.email };
      next();
    } catch (err) {
      if (err instanceof ApiError) return next(err);
      next(ApiError.unauthorized('Invalid or expired token'));
    }
  };
}

/**
 * Restricts a route to one or more roles. Must run after authenticate().
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}
