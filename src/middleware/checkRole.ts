import { Response, NextFunction, Request } from 'express';
import { UnauthorizedError } from '../configs/error';
import { UserType } from '../utils/authUser';

// Middleware function
export const checkRole = (roles: UserType[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.userType)) {
      throw new UnauthorizedError('Access forbidden.');
    }
    next();
  };
};
