import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { UserService } from '../services/User.service';
import { User } from '../entities/User';
import { UserType } from '../utils/authUser';
import { UserValidationTypes } from '../validations/User.validation';
import { BadRequestError } from '../configs/error';

@Service()
export class UserController {
  constructor(private userService: UserService) {}

  async getAdminUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAdminUsers(req.query);
      return successResponse(
        res,
        'Returning admin users with statistics',
        users
      );
    } catch (error) {
      return next(error);
    }
  }

  async getOneAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { period } =
        req.query as UserValidationTypes['getDashboardAnalytics'];

      const data = await this.userService.getOneAdminDetails(id, period);
      return successResponse(res, 'Returning admin user', data);
    } catch (error) {
      return next(error);
    }
  }

  async deleteAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.userService.deleteAdmin(id);
      return successResponse(res, 'Admin deleted', null);
    } catch (error) {
      return next(error);
    }
  }

  async updateAuthProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const body = req.body as UserValidationTypes['updateProfile'];

      const updatedUser = await this.userService.updateProfile(user.id, body);

      return successResponse(res, 'Profile updated', updatedUser);
    } catch (error) {
      return next(error);
    }
  }

  async updateAdminProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as UserValidationTypes['updateProfile'];

      const user = await this.userService.findById(id);

      if (user.userType !== UserType.ADMIN) {
        throw new BadRequestError('User is not an admin');
      }

      const updatedUser = await this.userService.updateProfile(id, body);

      return successResponse(res, 'Profile updated', updatedUser);
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

  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { period } =
        req.query as UserValidationTypes['getDashboardAnalytics'];

      const data = await this.userService.getDashboardData(
        user.userType,
        period
      );

      return successResponse(res, 'Dashboard data', data);
    } catch (error) {
      return next(error);
    }
  }
}
