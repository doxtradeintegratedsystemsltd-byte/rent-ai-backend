import { Router } from 'express';
import { Container } from 'typedi';
import { AuthController } from '../controllers/Auth.controller';
import Validator from '../middleware/Validator';
import AuthValidation from '../validations/Auth.validation';

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

const AuthRoutes = router;
export default AuthRoutes;
