import { Router } from 'express';
import { Container } from 'typedi';
import { JobController } from '../controllers/Job.controller';
import { verifyToken } from '../middleware/verifyToken';
import { checkRole } from '../middleware/checkRole';
import { RoleGroups } from '../utils/authUser';

const router = Router();

const controller = Container.get(JobController);

router.get(
  '/',
  verifyToken,
  checkRole(RoleGroups.superAdmin),
  (req, res, next) => {
    controller.getAll(req, res, next);
  }
);

const JobRoutes = router;
export default JobRoutes;
