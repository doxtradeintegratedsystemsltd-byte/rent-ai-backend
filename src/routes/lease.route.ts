import { Router } from 'express';
import { Container } from 'typedi';
import { LeaseController } from '../controllers/Lease.controller';
import { verifyToken } from '../middleware/verifyToken';
import Validator from '../middleware/Validator';
import LeaseValidation from '../validations/Lease.validation';
import { checkRole } from '../middleware/checkRole';
import { RoleGroups } from '../utils/authUser';
// import Validator from '../middleware/Validator';
// import LeaseValidation from '../validations/Lease.validation';

const router = Router();

const controller = Container.get(LeaseController);

// Uncomment and implement validation if available
// router.post('/', Validator(LeaseValidation.create), (req, res, next) => {
//   controller.create(req, res, next);
// });
router.post(
  '/payment',
  verifyToken,
  Validator(LeaseValidation.createLeasePayment),
  (req, res, next) => {
    controller.createLeasePayment(req, res, next);
  }
);

router.get(
  '/tenant',
  verifyToken,
  checkRole(RoleGroups.tenant),
  (req, res, next) => {
    controller.getAuthTenantLease(req, res, next);
  }
);

router.get(
  '/payment/callback',
  Validator(LeaseValidation.getLeasePaymentReference, 'query'),
  (req, res, next) => {
    controller.leasePaymentCallback(req, res, next);
  }
);

router.get(
  '/payment/reference',
  verifyToken,
  checkRole(RoleGroups.tenant),
  Validator(LeaseValidation.getLeasePaymentReference, 'query'),
  (req, res, next) => {
    controller.checkLeasePaymentReference(req, res, next);
  }
);

router.get('/', (req, res, next) => {
  controller.getAll(req, res, next);
});

router.get(
  '/:id',
  verifyToken,
  checkRole(RoleGroups.allAdmins),
  (req, res, next) => {
    controller.getOneLease(req, res, next);
  }
);

const LeaseRoutes = router;
export default LeaseRoutes;
