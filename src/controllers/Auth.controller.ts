import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { AuthService } from '../services/Auth.service';
import { Auth } from '../entities/Auth';
import { AuthValidationTypes } from '../validations/Auth.validation';

@Service()
export class AuthController {
  constructor(private authService: AuthService) {}

  async createOneTimeSuperAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body as AuthValidationTypes['oneTimeSuperAdmin'];
      const auth = await this.authService.createOneTimeSuperAdmin(body);

      return successResponse(res, 'Creation Success', auth);
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as AuthValidationTypes['login'];
      const auth = await this.authService.login(body);

      return successResponse(res, 'Login Success', auth);
    } catch (error) {
      return next(error);
    }
  }

  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as AuthValidationTypes['createAdmin'];
      const auth = await this.authService.createAdmin(body);

      return successResponse(res, 'Admin Creation Success', auth);
    } catch (error) {
      return next(error);
    }
  }
}
