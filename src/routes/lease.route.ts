import { Router } from 'express';
import { Container } from 'typedi';
import { LeaseController } from '../controllers/Lease.controller';
// import Validator from '../middleware/Validator';
// import LeaseValidation from '../validations/Lease.validation';

const router = Router();

const controller = Container.get(LeaseController);

// Uncomment and implement validation if available
// router.post('/', Validator(LeaseValidation.create), (req, res, next) => {
//   controller.create(req, res, next);
// });
router.post('/', (req, res, next) => {
  controller.create(req, res, next);
});

router.get('/', (req, res, next) => {
  controller.getAll(req, res, next);
});

const LeaseRoutes = router;
export default LeaseRoutes;
