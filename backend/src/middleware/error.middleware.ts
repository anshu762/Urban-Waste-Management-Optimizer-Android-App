import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../lib/response';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]', err);
  
  if (err.name === 'SyntaxError') {
    return errorResponse(res, 'Invalid JSON payload passed', 400);
  }
  
  return errorResponse(res, 'Internal Server Error', 500, err.message);
};
