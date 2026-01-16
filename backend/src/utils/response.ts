import { Response } from 'express';
import { generateReceivingId } from './jwt';

export interface ApiResponse<T = any> {
  messageId: string;
  receivingId: string;
  data?: T;
  token?: string;
  user?: any;
  [key: string]: any;
}

export const sendSuccess = <T>(
  res: Response,
  messageId: string,
  data?: T,
  statusCode: number = 200,
  additionalFields?: Record<string, any>
): void => {
  const response: ApiResponse<T> = {
    messageId,
    receivingId: generateReceivingId(),
    ...additionalFields,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  messageId: string,
  error: string,
  statusCode: number = 400,
  details?: any
): void => {
  res.status(statusCode).json({
    messageId,
    error,
    ...(details && { details }),
  });
};

