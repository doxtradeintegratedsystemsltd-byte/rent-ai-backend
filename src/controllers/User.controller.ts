import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { UserService } from '../services/User.service';
import { User } from '../entities/User';
import { UserType } from '../utils/authUser';

@Service()
export class UserController {
  constructor(private userService: UserService) {}

  async getAdminUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.findAllPaginated(req.query, {
        where: {
          userType: UserType.ADMIN,
        },
      });
      return successResponse(res, 'Returning admin users', users);
    } catch (error) {
      return next(error);
    }
  }

  async whoAmI(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      return successResponse(res, 'Who am i', user);
    } catch (error) {
      return next(error);
    }
  }
}
