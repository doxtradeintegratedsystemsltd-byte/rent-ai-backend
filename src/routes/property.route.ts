import { Router } from 'express';
import { Container } from 'typedi';
import { PropertyController } from '../controllers/Property.controller';
// import Validator from '../middleware/Validator';
// import PropertyValidation from '../validations/Property.validation';

const router = Router();

const controller = Container.get(PropertyController);

// Uncomment and implement validation if available
// router.post('/', Validator(PropertyValidation.create), (req, res, next) => {
//   controller.create(req, res, next);
// });
router.post('/', (req, res, next) => {
  controller.create(req, res, next);
});

router.get('/', (req, res, next) => {
  controller.getAll(req, res, next);
});

const PropertyRoutes = router;
export default PropertyRoutes;
