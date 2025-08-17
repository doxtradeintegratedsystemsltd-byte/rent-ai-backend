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

  async forgotPasswordMail(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as AuthValidationTypes['forgotPassword'];
      await this.authService.forgotPasswordMail(body.email);

      return successResponse(
        res,
        'If email exists, a password reset link has been sent'
      );
    } catch (error) {
      return next(error);
    }
  }

  async verifyPasswordResetLink(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body as AuthValidationTypes['verifyPasswordResetLink'];
      const user = await this.authService.verifyPasswordResetLink(body);

      return successResponse(res, 'Password Reset Link Verified', user);
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as AuthValidationTypes['resetPassword'];
      await this.authService.resetPassword(body);

      return successResponse(res, 'Password Reset Success');
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const body = req.body as AuthValidationTypes['changePassword'];
      await this.authService.changePassword(body, authUser);

      return successResponse(res, 'Password Changed Success');
    } catch (error) {
      return next(error);
    }
  }
}
