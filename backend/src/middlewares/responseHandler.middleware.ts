import { Request, Response, NextFunction, RequestHandler } from 'express';

// Интерфейс для успешного ответа
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

export type CustomResponse = Response & {
  success: <T>(data: T, message?: string, meta?: any) => Response;
  created: <T>(data: T, message?: string) => Response;
  noContent: (message?: string) => Response;
};

export const responseHandler: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const customRes = res as CustomResponse;

  // Стандартный успешный ответ (200 OK)
  customRes.success = function <T>(data: T, message?: string, meta?: any): Response {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
    };
    return this.status(200).json(response);
  };

  // Ответ для созданного ресурса (201 Created)
  customRes.created = function <T>(
    data: T,
    message: string = 'Resource created'
  ): Response {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      message,
    };
    return this.status(201).json(response);
  };

  // Ответ без содержимого (204 No Content)
  customRes.noContent = function (message: string = 'Resource deleted'): Response {
    return this.status(204).send();
  };

  next();
};
