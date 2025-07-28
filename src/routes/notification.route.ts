import { Router } from 'express';
import { Container } from 'typedi';
import { NotificationController } from '../controllers/Notification.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

const controller = Container.get(NotificationController);

// Public routes (if any)
router.get('/user', verifyToken, (req, res, next) => {
  controller.getUserNotifications(req, res, next);
});

router.get('/:id', verifyToken, (req, res, next) => {
  controller.getById(req, res, next);
});

router.get('/user/unread-count', verifyToken, (req, res, next) => {
  controller.getUnreadCount(req, res, next);
});

router.put('/user/mark-read/:id', verifyToken, (req, res, next) => {
  controller.markAsRead(req, res, next);
});

router.patch('/user/mark-all-read', verifyToken, (req, res, next) => {
  controller.markAllAsRead(req, res, next);
});

const NotificationRoutes = router;
export default NotificationRoutes;
