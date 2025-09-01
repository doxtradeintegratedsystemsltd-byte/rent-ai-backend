import { Service, Container } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Job } from '../entities/Job';
import { JobNames, JobObject } from '../utils/job';
import { LeaseService } from './Lease.service';
import {
  LeaseStatus,
  PaymentStatus,
  PaymentType,
  RentStatus,
} from '../utils/lease';
import { NotificationService } from './Notification.service';
import { BadRequestError } from '../configs/error';
import { MailerModule } from '../modules/Mailer.module';
import { NotificationType } from '../utils/notification';
import { UserType } from '../utils/authUser';

@Service()
export class JobService extends BaseService<Job> {
  constructor() {
    super(dataSource.getRepository(Job));
  }

  private get mailerModule(): MailerModule {
    return Container.get(MailerModule);
  }

  private get leaseService(): LeaseService {
    return Container.get(LeaseService);
  }

  private get notificationService(): NotificationService {
    return Container.get(NotificationService);
  }

  async handleJobExecution(job: Job): Promise<void> {
    try {
      switch (job.name) {
        case JobNames.rentDue:
          await this.executeRentDue(job.data);
          break;
        default: {
          throw new BadRequestError('Job not found');
        }
      }
    } catch (error) {
      console.error('BadRequestError executing job: ', error);
      throw error;
    }
  }

  private async executeRentDue(
    job: JobObject[JobNames.rentDue]
  ): Promise<void> {
    const lease = await this.leaseService.findById(job.leaseId, {
      relations: {
        payment: true,
        nextLease: true,
        tenant: {
          user: true,
        },
        property: true,
      },
    });

    if (lease.leaseStatus !== LeaseStatus.ACTIVE) {
      throw new BadRequestError('Lease is currently not active');
    }

    if (job.type !== 'due') {
      if (lease.nextLease && lease.nextLease.rentStatus === RentStatus.PAID) {
        throw new BadRequestError('Lease rent is already paid');
      }
    }

    let rentStatus;
    if (job.type === 'twoMonthsBefore') {
      rentStatus = RentStatus.NEAR_DUE;
    } else if (job.type === 'twoWeeksBefore') {
      rentStatus = RentStatus.DUE;
    } else if (job.type === 'due') {
      rentStatus = RentStatus.OVER_DUE;
    } else {
      throw new BadRequestError(
        `Invalid job type for rent status: ${job.type}`
      );
    }

    if (job.type === 'due') {
      return this.leaseService.updateCurrentLeaseAfterEndDate(lease.id);
    }

    await this.leaseService.update(lease.id, {
      rentStatus,
    });

    await this.notificationService.createRentDueNotification(
      lease.tenant,
      lease.property,
      lease,
      rentStatus
    );

    const leaseStatus =
      rentStatus === RentStatus.NEAR_DUE
        ? 'near due'
        : rentStatus === RentStatus.DUE
        ? 'due'
        : 'overdue';

    await this.mailerModule.sendLeasePaymentReminderMail(
      {
        to: lease.tenant.email,
        name: lease.tenant.firstName,
        leaseStatus,
      },
      this.notificationService.createNotificationMailTrigger({
        tenant: lease.tenant,
        notificationType: NotificationType.LEASE_PAYMENT_REMINDER,
        userType: UserType.TENANT,
        userId: lease.tenant.user.id,
      })
    );
  }
}
