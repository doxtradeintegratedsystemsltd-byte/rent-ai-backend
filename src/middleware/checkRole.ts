import { Response, NextFunction, Request } from 'express';
import { UnauthorizedError } from '../configs/error';

// Middleware function
export const checkRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.userType)) {
      throw new UnauthorizedError('Access forbidden.');
    }
    next();
  };
};
