import { Router } from 'express';
import { Container } from 'typedi';
import { AuthController } from '../controllers/Auth.controller';
import Validator from '../middleware/Validator';
import AuthValidation from '../validations/Auth.validation';
import { verifyToken } from '../middleware/verifyToken';
import { RoleGroups } from '../utils/authUser';
import { checkRole } from '../middleware/checkRole';

const router = Router();

const controller = Container.get(AuthController);

router.post(
  '/one-time-super-admin',
  Validator(AuthValidation.oneTimeSuperAdmin),
  (req, res, next) => {
    controller.createOneTimeSuperAdmin(req, res, next);
  }
);

router.post('/login', Validator(AuthValidation.login), (req, res, next) => {
  controller.login(req, res, next);
});

router.post(
  '/admin',
  verifyToken,
  checkRole(RoleGroups.superAdmin),
  Validator(AuthValidation.createAdmin),
  (req, res, next) => {
    controller.createAdmin(req, res, next);
  }
);

router.post(
  '/forgot-password',
  Validator(AuthValidation.forgotPassword),
  (req, res, next) => {
    controller.forgotPasswordMail(req, res, next);
  }
);

router.post(
  '/verify-password-reset-link',
  Validator(AuthValidation.verifyPasswordResetLink),
  (req, res, next) => {
    controller.verifyPasswordResetLink(req, res, next);
  }
);

router.post(
  '/reset-password',
  Validator(AuthValidation.resetPassword),
  (req, res, next) => {
    controller.resetPassword(req, res, next);
  }
);

router.post(
  '/change-password',
  verifyToken,
  Validator(AuthValidation.changePassword),
  (req, res, next) => {
    controller.changePassword(req, res, next);
  }
);

const AuthRoutes = router;
export default AuthRoutes;
