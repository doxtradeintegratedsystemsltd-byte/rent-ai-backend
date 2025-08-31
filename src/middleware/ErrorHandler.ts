import { ErrorRequestHandler } from 'express';
import isProduction from '../utils/isProduction';
import { logError } from '../utils/errorLogging';

const ErrorHandlerMiddleware: ErrorRequestHandler = (
  error,
  request,
  response,
  next
) => {
  const statusCode = error.statusCode || 500;
  let errorMessage = {};

  if (error.name === 'MulterError' && error.message === 'Unexpected field') {
    error.message = 'File should be added in the request.';
  }

  if (response.headersSent) {
    return next(error);
  }

  if (!isProduction) {
    errorMessage = error;
  }
  console.error(error.stack);

  // Log all 500 errors - regardless of environment
  if (statusCode === 500) {
    // Also use our comprehensive error logging utility
    logError(error, {
      type: 'ServerError',
      request,
      additionalData: { statusCode: 500 },
    }).catch((logError) => {
      console.error('Failed to log server error:', logError);
    });
  }

  response.status(statusCode).json({
    statusCode,
    status: 'error',
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(!isProduction && { trace: errorMessage }),
  });
};

export default ErrorHandlerMiddleware;
