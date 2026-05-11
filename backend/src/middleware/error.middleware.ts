import { Request, Response, NextFunction } from 'express';
import { AppError, Errors } from '../lib/app-error';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handler]', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack,
  });

  // Default error response
  let statusCode = 500;
  let responseBody = {
    success: false,
    message: 'Something went wrong on our end. Please try again in a moment.',
    code: 'INTERNAL_ERROR',
    errors: [] as any[],
  };

  // 1. Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    responseBody.message = err.userMessage;
    responseBody.code = err.code;
  } 
  // 2. Handle Zod Validation Error
  else if (err instanceof ZodError) {
    statusCode = 400;
    responseBody.message = 'Some information is missing or incorrect. Please check and try again.';
    responseBody.code = 'VALIDATION_FAILED';
    responseBody.errors = err.issues.map((e: any) => ({
      path: e.path.join('.'),
      message: e.message
    }));
  }
  // 3. Handle Prisma Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case 'P2002': // Unique constraint
        const target = (err.meta?.target as string[]) || [];
        responseBody.message = `This ${target.join(' or ') || 'item'} is already registered.`;
        responseBody.code = 'ALREADY_EXISTS';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        responseBody.message = 'The requested item was not found.';
        responseBody.code = 'NOT_FOUND';
        break;
      case 'P2003': // Foreign key constraint
        responseBody.message = "Related item doesn't exist.";
        responseBody.code = 'REFERENCE_ERROR';
        break;
      default:
        const internal = Errors.internalError();
        statusCode = internal.statusCode;
        responseBody.message = internal.userMessage;
        responseBody.code = internal.code;
    }
  }
  // 4. Handle SyntaxError (like malformed JSON)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    responseBody.message = 'Invalid JSON payload passed. Please check your data format.';
    responseBody.code = 'INVALID_JSON';
  }
  // 5. Unknown Errors
  else {
    const internal = Errors.internalError();
    statusCode = internal.statusCode;
    responseBody.message = internal.userMessage;
    responseBody.code = internal.code;
  }

  // Final response (NEVER send stack traces to client)
  return res.status(statusCode).json(responseBody);
};
