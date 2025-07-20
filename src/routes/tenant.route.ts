import { Router } from 'express';
import { Container } from 'typedi';
import { TenantController } from '../controllers/Tenant.controller';
import { verifyToken } from '../middleware/verifyToken';
import { checkRole } from '../middleware/checkRole';
import { RoleGroups } from '../utils/authUser';
import Validator from '../middleware/Validator';
import TenantValidation from '../validations/Tenant.validation';
// import Validator from '../middleware/Validator';
// import TenantValidation from '../validations/Tenant.validation';

const router = Router();

const controller = Container.get(TenantController);

router.post(
  '/',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  Validator(TenantValidation.create),
  (req, res, next) => {
    controller.create(req, res, next);
  }
);

router.get('/', (req, res, next) => {
  controller.getAll(req, res, next);
});

const TenantRoutes = router;
export default TenantRoutes;
