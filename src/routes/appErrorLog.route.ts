import { Router } from 'express';
import { AppErrorLogController } from '../controllers/AppErrorLog.controller';
import Validator from '../middleware/Validator';
import AppErrorLogValidation from '../validations/AppErrorLog.validation';

const router = Router();

const controller = new AppErrorLogController();

router.post('/', Validator(AppErrorLogValidation.create), (req, res, next) => {
  controller.create(req, res, next);
});

router.get('/', (req, res, next) => {
  controller.getAll(req, res, next);
});

const AppErrorLogRoutes = router;
export default AppErrorLogRoutes;
