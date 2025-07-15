import { Router } from 'express';
import { Container } from 'typedi';
import { UserController } from '../controllers/User.controller';
import { verifyToken } from '../middleware/verifyToken';
// import Validator from '../middleware/Validator';
// import UserValidation from '../validations/User.validation';

const router = Router();

const controller = Container.get(UserController);

router.get('/who-am-i', verifyToken, (req, res, next) => {
  controller.whoAmI(req, res, next);
});

router.get('/', (req, res, next) => {
  controller.getAll(req, res, next);
});

const UserRoutes = router;
export default UserRoutes;
