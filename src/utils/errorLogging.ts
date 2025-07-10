import { Request } from 'express';
import { Container } from 'typedi';
import { AppErrorLogService } from '../services/AppErrorLog.service';

interface ErrorLoggingOptions {
  type?: string;
  request?: Request;
  additionalData?: Record<string, any>;
}

/**
 * Logs an error consistently across the application with both GlitchTip and database storage
 * @param error The error to log
 * @param options Additional options for error logging
 */
export const logError = async (
  error: Error,
  options: ErrorLoggingOptions = {}
): Promise<void> => {
  const { type = 'ServerError', request, additionalData = {} } = options;

  // Prepare the metadata for GlitchTip
  const metadata: Record<string, any> = {
    type,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  // Add request data if available
  if (request) {
    metadata.path = request.path;
    metadata.method = request.method;
    metadata.ip = request.ip;
    metadata.userAgent = request.headers['user-agent'];
    metadata.userId = (request as any).user?.id || 'anonymous';
  }

  try {
    // Parse error stack for file and function information
    const file =
      error.stack
        ?.split('\n')[1]
        ?.trim()
        ?.replace(/^at\s+/, '') || '';
    const func = error.stack?.split('\n')[0]?.trim() || '';

    // Create database log entry using TypeDI
    const appErrorLogService = Container.get(AppErrorLogService);
    await appErrorLogService.create({
      type,
      message: error.message,
      file,
      func,
      data: {
        stack: error.stack,
        ...metadata,
        // Add request data but exclude potentially sensitive information
        ...(request && {
          path: request.path,
          method: request.method,
          headers: request.headers,
          query: request.query,
          params: request.params,
        }),
      },
    });
  } catch (logError) {
    console.error('Failed to save error to database:', logError);
  }
};

/**
 * Log a 500 server error
 */
export const logServerError = (
  error: Error,
  request?: Request,
  additionalData: Record<string, any> = {}
): Promise<void> => {
  return logError(error, {
    type: 'ServerError',
    request,
    additionalData: { statusCode: 500, ...additionalData },
  });
};

/**
 * Log a validation error (usually 400)
 */
export const logValidationError = (
  error: Error,
  request?: Request
): Promise<void> => {
  return logError(error, {
    type: 'ValidationError',
    request,
    additionalData: { statusCode: 400 },
  });
};

/**
 * Log an authentication error (usually 401)
 */
export const logAuthError = (
  error: Error,
  request?: Request
): Promise<void> => {
  return logError(error, {
    type: 'AuthError',
    request,
    additionalData: { statusCode: 401 },
  });
};

/**
 * Log an authorization error (usually 403)
 */
export const logAccessDeniedError = (
  error: Error,
  request?: Request
): Promise<void> => {
  return logError(error, {
    type: 'AccessDeniedError',
    request,
    additionalData: { statusCode: 403 },
  });
};

export default {
  logError,
  logServerError,
  logValidationError,
  logAuthError,
  logAccessDeniedError,
};
