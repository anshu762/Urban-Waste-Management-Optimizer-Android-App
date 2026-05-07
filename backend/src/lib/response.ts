import { Response } from 'express';

interface SuccessResponseData {
  success: true;
  message: string;
  data: any | null;
}

interface ErrorResponseData {
  success: false;
  message: string;
  data: null;
  errors?: any;
}

export const successResponse = (
  res: Response,
  data: any | null = null,
  message: string = 'Success',
  statusCode: number = 200
) => {
  const response: SuccessResponseData = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  errors: any = null
) => {
  const response: ErrorResponseData = {
    success: false,
    message,
    data: null,
    errors,
  };
  return res.status(statusCode).json(response);
};
