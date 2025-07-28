import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Notification } from '../entities/Notification';
import { PaginationRequest } from '../types/CustomTypes';
import {
  NotificationStatus,
  NotificationType,
  NotificationChannel,
} from '../utils/notification';
import { UserType } from '../utils/authUser';
import { User } from '../entities/User';
import { FindOptionsWhere } from 'typeorm';

@Service()
export class NotificationService extends BaseService<Notification> {
  constructor() {
    super(dataSource.getRepository(Notification));
  }

  createDefaultFilter(authUser: User, channel: NotificationChannel) {
    let defaultFilter: FindOptionsWhere<Notification> = {
      notificationChannel: channel,
    };

    if (authUser.userType === UserType.TENANT) {
      defaultFilter.tenantId = authUser.tenantId;
    } else {
      defaultFilter.userType = UserType.ADMIN;
    }

    return defaultFilter;
  }

  async getUserNotifications(
    pagination: PaginationRequest,
    authUser: User,
    channel: NotificationChannel = NotificationChannel.INTERNAL
  ) {
    let defaultFilter = this.createDefaultFilter(authUser, channel);

    const notifications = await this.findAllPaginated(pagination, {
      where: {
        ...defaultFilter,
      },
      relations: {
        user: true,
        property: true,
        lease: true,
        tenant: true,
      },
    });

    return notifications;
  }

  async getUnreadUserNotifications(
    authUser: User,
    channel: NotificationChannel = NotificationChannel.INTERNAL
  ) {
    let defaultFilter = this.createDefaultFilter(authUser, channel);

    defaultFilter.seen = false;

    const notifications = await this.findAllPaginated(
      {
        page: 0,
        size: 1,
      },
      {
        where: defaultFilter,
        select: {
          id: true,
        },
      }
    );

    return notifications.totalItems;
  }

  async markAllUserNotificationsAsRead(
    authUser: User,
    channel: NotificationChannel = NotificationChannel.INTERNAL
  ) {
    let defaultFilter = this.createDefaultFilter(authUser, channel);

    await this.repository.update(
      {
        ...defaultFilter,
        seen: false,
      },
      {
        seen: true,
      }
    );
  }
}
