import { Router } from 'express';
import { Container } from 'typedi';
import { UserController } from '../controllers/User.controller';
import { verifyToken } from '../middleware/verifyToken';
import { RoleGroups } from '../utils/authUser';
import { checkRole } from '../middleware/checkRole';
import Validator from '../middleware/Validator';
import UserValidation from '../validations/User.validation';

const router = Router();

const controller = Container.get(UserController);

router.get('/who-am-i', verifyToken, (req, res, next) => {
  controller.whoAmI(req, res, next);
});

router.get(
  '/dashboard',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  Validator(UserValidation.getDashboardAnalytics, 'query'),
  (req, res, next) => {
    controller.getDashboardData(req, res, next);
  }
);

router.get(
  '/admins',
  verifyToken,
  checkRole(RoleGroups.superAdmin),
  (req, res, next) => {
    controller.getAdminUsers(req, res, next);
  }
);

const UserRoutes = router;
export default UserRoutes;
