import { Request, Response, NextFunction } from 'express';

// Общий интерфейс для ответа с ошибкой
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    stack?: string;
  };
}

// Базовый класс для всех ошибок API
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message: string = 'Not Found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static badRequest(message: string = 'Bad Request') {
    return new ApiError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static internal(message: string = 'Internal Server Error') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
}

// Middleware для обработки ошибок
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err instanceof ApiError ? err.code : 'INTERNAL_ERROR'
  });

  const status = err instanceof ApiError ? err.status : 500;
  const code = err instanceof ApiError ? err.code : 'INTERNAL_ERROR';

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(status).json(errorResponse);
};

// Middleware для отлова асинхронных ошибок
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};