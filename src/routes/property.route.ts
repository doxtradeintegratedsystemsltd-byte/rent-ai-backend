import { Router } from 'express';
import { Container } from 'typedi';
import { PropertyController } from '../controllers/Property.controller';
import { verifyToken } from '../middleware/verifyToken';
import Validator from '../middleware/Validator';
import PropertyValidation from '../validations/Property.validation';
import { checkRole } from '../middleware/checkRole';
import { RoleGroups, UserType } from '../utils/authUser';

const router = Router();

const controller = Container.get(PropertyController);

router.post(
  '/',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  Validator(PropertyValidation.create),
  (req, res, next) => {
    controller.create(req, res, next);
  }
);

router.get(
  '/',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  (req, res, next) => {
    controller.getAll(req, res, next);
  }
);

router.get('/:id', verifyToken, (req, res, next) => {
  controller.getById(req, res, next);
});

router.put(
  '/:id',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  Validator(PropertyValidation.update),
  (req, res, next) => {
    controller.update(req, res, next);
  }
);

router.delete(
  '/:id',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  (req, res, next) => {
    controller.softDelete(req, res, next);
  }
);

const PropertyRoutes = router;
export default PropertyRoutes;
