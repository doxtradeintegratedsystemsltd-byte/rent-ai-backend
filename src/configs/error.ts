/**
 * @class ApplicationError
 * @description base error class for application
 * @extends Error
 */
export class ApplicationError extends Error {
  statusCode: number;
  errors: any;
  /**
   * @description initializes the error class
   *
   * @param {number} statusCode status code of the request
   * @param {string} message error message
   * @param {string} errors an array containing errors
   */
  constructor(statusCode: number, message: string = 'An error occurred.', errors?: any) {
    super(message);
    this.statusCode = statusCode || 500;
    this.message = message;
    this.errors = errors;
  }
}

/**
 * @class NotFoundError
 * @description error class for not found
 * @extends ApplicationError
 */
export class NotFoundError extends ApplicationError {
  /**
   * @description initialize error class
   *
   */
  constructor(message?: string) {
    super(404, message || 'Resource not found.');
  }
}

/**
 * @class BadRequestError
 * @description error class for conflict.
 * @extends ApplicationError
 */
export class BadRequestError extends ApplicationError {
  /**
   * @description initialize error class
   *
   */
  constructor(message?: string) {
    super(400, message || 'Bad Request Error.');
  }
}

export class UnauthorizedError extends ApplicationError {
  /**
   * @description initialize error class
   *
   */
  constructor(message?: string) {
    super(403, message || 'Unauthorized');
  }
}

export class UnauthenticatedError extends ApplicationError {
  /**
   * @description initialize error class
   *
   */
  constructor(message?: string) {
    super(401, message || 'Unauthenticated');
  }
}