import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import { UnauthenticatedError } from '../configs/error';
import { AuthUser } from '../types/Authentication';
import Container from 'typedi';
import { UserService } from '../services/User.service';

export async function verifyToken(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthenticatedError('No token provided!');
    }

    let token;

    if (authorization.startsWith('Bearer ')) {
      [, token] = authorization.split(' ');
    } else {
      token = authorization;
    }

    const user = verifyJwt<AuthUser>(token);

    if (user) {
      const userService = Container.get(UserService);
      const foundUser = await userService.findById(user.id, {
        relations: {
          tenant: true,
        },
      });
      req.user = foundUser;
      return next();
    } else {
      throw new UnauthenticatedError('User is not authenticated.');
    }
  } catch (error) {
    return next(error);
  }
}
