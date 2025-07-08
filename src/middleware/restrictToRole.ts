// import { Response, NextFunction } from 'express';
// import { AuthRequest } from '../interfaces/AuthRequest';
// import { UnauthorizedError } from '../configs/error';

// // Middleware function
// export const restrictToRole = (...roles: string[]) => {
//   return (req: AuthRequest, _res: Response, next: NextFunction): void => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       throw new UnauthorizedError('Access forbidden.');
//     }
//     next();
//   };
// };
