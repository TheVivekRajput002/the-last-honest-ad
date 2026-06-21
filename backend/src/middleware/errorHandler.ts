import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  // Log error for developers
  console.error(`[Error Handler] ${req.method} ${req.url}:`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
};
