import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Notification } from '../entities/Notification';
import { PaginationRequest } from '../types/CustomTypes';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../utils/notification';
import { UserType } from '../utils/authUser';
import { User } from '../entities/User';
import { FindOptionsWhere } from 'typeorm';
import { Tenant } from '../entities/Tenant';
import { Property } from '../entities/Property';
import { Lease } from '../entities/Lease';
import { RentStatus } from '../utils/lease';
import { BadRequestError } from '../configs/error';
import { NotificationTrigger } from '../interfaces/Notification';
import { LeasePayment } from '../entities/LeasePayment';

@Service()
export class NotificationService extends BaseService<Notification> {
  constructor() {
    super(dataSource.getRepository(Notification));
  }

  createNotificationMailTrigger(trigger: NotificationTrigger) {
    const notificationFunction = async (success: boolean) => {
      this.createNotificationMail({
        ...trigger,
        status: success
          ? NotificationStatus.COMPLETED
          : NotificationStatus.FAILED,
      });
    };

    return notificationFunction;
  }

  async createNotificationMail(
    trigger: NotificationTrigger & { status: NotificationStatus }
  ) {
    const notification = await this.create({
      ...trigger,
      notificationChannel: NotificationChannel.EMAIL,
    });

    return notification;
  }

  async createTenantAssignedNotification(
    tenant: Tenant,
    property: Property,
    lease: Lease,
    admin: User
  ) {
    const notification = await this.create({
      tenant,
      property,
      lease,
      userType: UserType.ADMIN,
      notificationType: NotificationType.TENANT_ASSIGNED,
      notificationChannel: NotificationChannel.INTERNAL,
      status: NotificationStatus.PENDING,
      admin,
    });

    return notification;
  }

  async createNewLeaseCreatedNotification(
    tenant: Tenant,
    property: Property,
    lease: Lease,
    admin: User
  ) {
    let notificationType;
    notificationType = NotificationType.LEASE_CREATED;

    this.create({
      tenant,
      property,
      lease,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.ADMIN,
      status: NotificationStatus.PENDING,
      admin,
    });

    this.create({
      tenant,
      property,
      lease,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.TENANT,
      status: NotificationStatus.PENDING,
      admin,
    });
  }

  async createNextLeasePeriodPaidNotification(
    tenant: Tenant,
    property: Property,
    lease: Lease,
    admin: User,
    payment: LeasePayment
  ) {
    let notificationType;
    notificationType = NotificationType.NEXT_LEASE_PERIOD_PAID;

    this.create({
      tenant,
      property,
      lease,
      payment,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.ADMIN,
      status: NotificationStatus.PENDING,
      admin,
    });

    this.create({
      tenant,
      property,
      lease,
      payment,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.TENANT,
      status: NotificationStatus.PENDING,
      admin,
    });
  }

  async createNextLeasePeriodStartedNotification(
    tenant: Tenant,
    property: Property,
    lease: Lease,
    admin: User
  ) {
    let notificationType;
    notificationType = NotificationType.NEXT_LEASE_PERIOD_STARTED;

    this.create({
      tenant,
      property,
      lease,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.ADMIN,
      status: NotificationStatus.PENDING,
      admin,
    });

    this.create({
      tenant,
      property,
      lease,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.TENANT,
      status: NotificationStatus.PENDING,
      admin,
    });
  }

  async createRentDueNotification(
    tenant: Tenant,
    property: Property,
    lease: Lease,
    rentStatus: RentStatus,
    admin: User
  ) {
    let notificationType;
    if (rentStatus === RentStatus.DUE) {
      notificationType = NotificationType.RENT_DUE;
    } else if (rentStatus === RentStatus.OVER_DUE) {
      notificationType = NotificationType.RENT_OVERDUE;
    } else if (rentStatus === RentStatus.NEAR_DUE) {
      notificationType = NotificationType.RENT_NEAR_DUE;
    } else {
      throw new BadRequestError('Invalid rent status');
    }

    const notification = await this.create({
      tenant,
      property,
      lease,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.ADMIN,
      status: NotificationStatus.PENDING,
      admin,
    });

    await this.create({
      tenant,
      property,
      lease,
      notificationType,
      notificationChannel: NotificationChannel.INTERNAL,
      userType: UserType.TENANT,
      status: NotificationStatus.PENDING,
      admin,
    });

    return notification;
  }

  createDefaultFilter(authUser: User, channel: NotificationChannel) {
    let defaultFilter: FindOptionsWhere<Notification> = {
      notificationChannel: channel,
    };

    if (authUser.userType === UserType.TENANT) {
      defaultFilter.tenantId = authUser.tenantId;
      defaultFilter.userType = UserType.TENANT;
    } else {
      defaultFilter.userType = UserType.ADMIN;

      if (authUser.userType === UserType.ADMIN) {
        defaultFilter.adminId = authUser.id;
      }
    }

    return defaultFilter;
  }

  async getAllNotifications(
    pagination: PaginationRequest,
    channel: NotificationChannel
  ) {
    const notifications = await this.findAllPaginated(pagination, {
      where: {
        notificationChannel: channel,
      },
      relations: {
        admin: true,
        property: true,
        lease: true,
        tenant: true,
        user: true,
        payment: true,
      },
    });

    return notifications;
  }

  async getUserNotifications(
    pagination: PaginationRequest,
    authUser: User,
    channel: NotificationChannel = NotificationChannel.INTERNAL
  ) {
    let defaultFilter = this.createDefaultFilter(authUser, channel);

    if (pagination.status) {
      defaultFilter.status = pagination.status;
    }

    if (pagination.seen) {
      defaultFilter.seen = pagination.seen === 'true' ? true : false;
    }

    const notifications = await this.findAllPaginated(pagination, {
      where: {
        ...defaultFilter,
      },
      relations: {
        admin: true,
        property: {
          location: true,
        },
        lease: true,
        tenant: true,
        payment: true,
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
