import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { errorResponse } from '../lib/response';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'Unauthorized - No token provided', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      errorResponse(res, 'Unauthorized - Invalid token', 401);
      return;
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      errorResponse(res, 'Unauthorized - User no longer exists or is inactive', 401);
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    errorResponse(res, 'Unauthorized', 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Forbidden - You do not have permission to perform this action', 403);
      return;
    }

    next();
  };
};
