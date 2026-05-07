import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../lib/response';

export const validate = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        errorResponse(res, 'Validation Error', 400, errors);
        return;
      }
      errorResponse(res, 'Internal Server Error', 500);
    }
  };
};
