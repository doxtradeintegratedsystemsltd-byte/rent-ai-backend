import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { UserService } from '../services/User.service';
import { User } from '../entities/User';

@Service()
export class UserController {
  constructor(private userService: UserService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.findAllPaginated(req.query);
      return successResponse(res, 'Returning users', users);
    } catch (error) {
      return next(error);
    }
  }

  async whoAmI(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      return successResponse(res, 'User', user);
    } catch (error) {
      return next(error);
    }
  }
}
