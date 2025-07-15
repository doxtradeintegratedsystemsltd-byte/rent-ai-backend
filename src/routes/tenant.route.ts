import { Router } from 'express';
import { Container } from 'typedi';
import { TenantController } from '../controllers/Tenant.controller';
// import Validator from '../middleware/Validator';
// import TenantValidation from '../validations/Tenant.validation';

const router = Router();

const controller = Container.get(TenantController);

// Uncomment and implement validation if available
// router.post('/', Validator(TenantValidation.create), (req, res, next) => {
//   controller.create(req, res, next);
// });
router.post('/', (req, res, next) => {
  controller.create(req, res, next);
});

router.get('/', (req, res, next) => {
  controller.getAll(req, res, next);
});

const TenantRoutes = router;
export default TenantRoutes;
