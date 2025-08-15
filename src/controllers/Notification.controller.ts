import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { NotificationService } from '../services/Notification.service';
import { Notification } from '../entities/Notification';
import { NotificationStatus } from '../utils/notification';

@Service()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;

      const notifications = await this.notificationService.getUserNotifications(
        req.query,
        authUser
      );
      return successResponse(res, 'Returning notifications', notifications);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.findById(id, {
        relations: {
          admin: true,
          property: true,
          lease: true,
          tenant: true,
        },
      });
      return successResponse(res, 'Returning notification', notification);
    } catch (error) {
      return next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.update(id, {
        seen: true,
        status: NotificationStatus.COMPLETED,
      });
      return successResponse(res, 'Notification marked as read', notification);
    } catch (error) {
      return next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;

      await this.notificationService.markAllUserNotificationsAsRead(authUser);

      return successResponse(res, 'All notifications marked as read', null);
    } catch (error) {
      return next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;

      const count = await this.notificationService.getUnreadUserNotifications(
        authUser
      );

      return successResponse(res, 'Returning unread count', { count });
    } catch (error) {
      return next(error);
    }
  }
}
