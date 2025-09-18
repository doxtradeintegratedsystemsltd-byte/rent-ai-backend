import { Router } from 'express';
import { Container } from 'typedi';
import { LocationController } from '../controllers/Location.controller';
import { verifyToken } from '../middleware/verifyToken';
import Validator from '../middleware/Validator';
import LocationValidation from '../validations/Location.validation';
import { checkRole } from '../middleware/checkRole';
import { RoleGroups } from '../utils/authUser';

const router = Router();

const controller = Container.get(LocationController);

router.post(
  '/',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  Validator(LocationValidation.create),
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
  Validator(LocationValidation.update),
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

const LocationRoutes = router;
export default LocationRoutes;
