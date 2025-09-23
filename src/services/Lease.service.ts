import Container, { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Lease } from '../entities/Lease';
import { TenantValidationTypes } from '../validations/Tenant.validation';
import { Tenant } from '../entities/Tenant';
import { Property } from '../entities/Property';
import { User } from '../entities/User';
import {
  getLeaseEndDate,
  LeaseStatus,
  PaymentStatus,
  PaymentType,
  RentStatus,
} from '../utils/lease';
import { LeasePaymentService } from './LeasePayment.service';
import { BadRequestError } from '../configs/error';
import { LeaseValidationTypes } from '../validations/Lease.validation';
import { UserType } from '../utils/authUser';
import { PropertyService } from './Property.service';
import { PaystackModule } from '../modules/Paystack.module';
import { JobNames, JobObject } from '../utils/job';
import { CronJobModule } from '../modules/CronJob.module';
import { TenantService } from './Tenant.service';
import { MailerModule } from '../modules/Mailer.module';
import { NotificationService } from './Notification.service';
import { NotificationType } from '../utils/notification';
import { PaginationRequest } from '../types/CustomTypes';
import envConfig from '../configs/envConfig';

@Service()
export class LeaseService extends BaseService<Lease> {
  constructor() {
    super(dataSource.getRepository(Lease));
  }

  private get leasePaymentService(): LeasePaymentService {
    return Container.get(LeasePaymentService);
  }

  private get propertyService(): PropertyService {
    return Container.get(PropertyService);
  }

  private get paystackModule(): PaystackModule {
    return Container.get(PaystackModule);
  }

  private get tenantService(): TenantService {
    return Container.get(TenantService);
  }

  private get mailerModule(): MailerModule {
    return Container.get(MailerModule);
  }

  private get notificationService(): NotificationService {
    return Container.get(NotificationService);
  }

  private async createLease(
    property: Property,
    tenant: Tenant,
    authUser: User,
    data: Pick<TenantValidationTypes['create'], 'startDate' | 'leaseCycles'>,
    rentStatus: RentStatus,
    previousLeaseId?: string
  ) {
    return this.create({
      property,
      tenant,
      startDate: data.startDate,
      endDate: getLeaseEndDate(
        data.startDate,
        property.leaseYears,
        data.leaseCycles
      ),
      leaseStatus: LeaseStatus.INACTIVE,
      leaseYears: property.leaseYears,
      leaseCycles: data.leaseCycles,
      createdBy: authUser,
      rentAmount: property.rentAmount * data.leaseCycles,
      rentStatus,
      previousLeaseId,
    });
  }

  async createNewLease(
    property: Property,
    tenant: Tenant,
    authUser: User,
    data: Pick<
      TenantValidationTypes['create'],
      'startDate' | 'leaseCycles' | 'paymentReceipt' | 'paymentDate'
    >
  ) {
    let rentStatus = RentStatus.PAID;

    const lease = await this.createLease(
      property,
      tenant,
      authUser,
      data,
      rentStatus
    );

    const { leasePayment } = await this.leasePaymentService.createLeasePayment(
      lease,
      PaymentType.MANUAL,
      authUser,
      data.paymentReceipt,
      new Date(data.paymentDate)
    );

    return this.update(lease.id, {
      payment: leasePayment,
      leaseStatus: LeaseStatus.ACTIVE,
    });
  }

  async createLeasePayment(
    {
      leaseCycles,
      leaseId,
      paymentDate,
      paymentReceipt,
    }: LeaseValidationTypes['createLeasePayment'],
    authUser: User
  ) {
    const lease = await this.findById(leaseId, {
      relations: {
        nextLease: true,
        property: true,
        tenant: true,
        createdBy: true,
      },
    });

    if (authUser.userType === UserType.TENANT) {
      if (lease.tenant.id !== authUser.tenant.id) {
        throw new BadRequestError(
          'You are not authorized to create lease payment for this lease'
        );
      }
    } else {
      if (!(paymentDate && paymentReceipt)) {
        throw new BadRequestError(
          'Payment date and receipt are required for admin payments'
        );
      }
    }

    if (lease.leaseStatus !== LeaseStatus.ACTIVE) {
      throw new BadRequestError('Lease is currently not active');
    }

    if (lease.nextLease && lease.nextLease.rentStatus === RentStatus.PAID) {
      throw new BadRequestError('Next lease rent is already paid');
    }

    let nextLease;

    nextLease = await this.createLease(
      lease.property,
      lease.tenant,
      lease.createdBy,
      {
        startDate: new Date(lease.endDate).toISOString(),
        leaseCycles,
      },
      RentStatus.DUE,
      lease.id
    );

    await this.update(lease.id, {
      nextLease: nextLease,
    });

    if (lease.nextLease) {
      await this.update(lease.nextLease.id, {
        previousLeaseId: null,
      });

      await this.softDelete(lease.nextLease.id);
    }

    await this.update(nextLease.id, {
      previousLeaseId: lease.id,
    });

    let data;
    if (authUser.userType !== UserType.TENANT) {
      data = await this.leasePaymentService.createLeasePayment(
        nextLease,
        PaymentType.MANUAL,
        authUser,
        paymentReceipt!,
        new Date(paymentDate!)
      );

      this.update(nextLease.id, {
        rentStatus: RentStatus.PAID,
        payment: data.leasePayment,
      });

      this.update(lease.id, {
        rentStatus: RentStatus.PAID,
      });

      this.updateCurrentLeaseAfterEndDate(lease.id);
      return null;
    } else {
      const fullLease = await this.findById(nextLease.id, {
        relations: {
          property: true,
          tenant: true,
          createdBy: true,
        },
      });

      const { paymentLink, leasePayment } =
        await this.leasePaymentService.createLeasePayment(
          fullLease,
          PaymentType.PAYSTACK,
          authUser
        );

      this.update(nextLease.id, {
        payment: leasePayment,
      });

      return paymentLink;
    }
  }

  async getAllLeasePayments(query: PaginationRequest, authUser: User) {
    return this.leasePaymentService.getAllLeasePayments(query, authUser);
  }

  async getTenantLease(tenantId: string) {
    const property = await this.propertyService.findOne({
      where: {
        currentLease: {
          tenantId,
        },
      },
      relations: {
        location: true,
        currentLease: {
          previousLease: true,
          nextLease: {
            payment: true,
          },
          payment: true,
          tenant: true,
          createdBy: true,
        },
        createdBy: true,
      },
    });

    if (property) {
      const payments = await this.propertyService.getPropertyPayments(
        property.id,
        property.currentLease?.tenantId
      );

      return {
        ...property,
        payments,
      };
    }

    return null;
  }

  async checkLeasePaymentReference(reference: string) {
    const payment = await this.leasePaymentService.findOne({
      where: {
        reference,
      },
      relations: {
        lease: {
          property: true,
        },
      },
    });

    if (!payment) {
      throw new BadRequestError('Lease payment for this reference not found');
    }

    return payment;
  }

  async processLeasePayment(reference: string) {
    const paystackResponse = await this.paystackModule.verifyTransaction({
      reference,
    });

    const payment = await this.leasePaymentService.findOne({
      where: {
        reference,
      },
      relations: {
        lease: {
          previousLease: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestError('Lease payment for this reference not found');
    }

    const currentLease = payment.lease.previousLease;

    if (paystackResponse?.status !== 'success') {
      throw new BadRequestError("Lease payment wasn't successful");
    }

    if (!payment.lease || payment.lease.rentStatus === RentStatus.PAID) {
      throw new BadRequestError('Lease payment is already recorded');
    }

    if (!currentLease) {
      throw new BadRequestError('Payment is not linked to an active lease');
    }

    if (currentLease.leaseStatus !== LeaseStatus.ACTIVE) {
      // this means that payment is done for a transaction that has expired.
      // TODO: after email configuration, send mail to admin for further action
      throw new BadRequestError('Payment is not linked to an active lease');
    }

    await this.update(currentLease.id, {
      rentStatus: RentStatus.PAID,
    });

    await this.update(payment.lease.id, {
      rentStatus: RentStatus.PAID,
    });

    await this.leasePaymentService.update(payment.id, {
      status: PaymentStatus.COMPLETED,
      paymentDate: new Date(),
    });

    await this.mailerModule.sendNextLeasePeriodPaymentConfirmationMail(
      {
        to: currentLease.tenant.email,
        name: currentLease.tenant.firstName,
        amount: payment.amount,
        nextLeaseEndDate: new Date(payment.lease.endDate).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        ),
        nextLeaseStartDate: new Date(
          payment.lease.startDate
        ).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        propertyName: currentLease.property.propertyName,
      },
      this.notificationService.createNotificationMailTrigger({
        userType: UserType.TENANT,
        payment,
        property: currentLease.property,
        lease: payment.lease,
        tenant: currentLease.tenant,
        notificationType: NotificationType.NEXT_LEASE_PERIOD_PAID,
      })
    );

    this.notificationService.createNextLeasePeriodPaidNotification(
      currentLease.tenant,
      currentLease.property,
      payment.lease,
      payment.createdBy,
      payment
    );

    this.updateCurrentLeaseAfterEndDate(currentLease.id);
  }

  async updateCurrentLeaseAfterEndDate(leaseId: string, throwError = false) {
    try {
      const lease = await this.findById(leaseId, {
        relations: {
          nextLease: true,
          property: true,
          tenant: true,
          createdBy: true,
        },
      });

      if (lease.leaseStatus !== LeaseStatus.ACTIVE) {
        throw new BadRequestError('Lease is not active');
      }

      if (lease.endDate > new Date()) {
        throw new BadRequestError('Lease has not ended yet');
      }

      if (!lease.nextLease) {
        throw new BadRequestError(
          "Lease hasn't received payment for next period"
        );
      }

      if (lease.nextLease.rentStatus !== RentStatus.PAID) {
        throw new BadRequestError(
          "Lease hasn't received payment for next period"
        );
      }

      await this.update(lease.id, {
        leaseStatus: LeaseStatus.INACTIVE,
      });

      const nextLease = await this.update(lease.nextLease.id, {
        leaseStatus: LeaseStatus.ACTIVE,
      });

      await this.propertyService.update(lease.propertyId, {
        currentLeaseId: lease.nextLease.id,
      });

      await this.tenantService.update(lease.tenantId, {
        currentLeaseId: lease.nextLease.id,
      });

      await this.setUpRentReminders(nextLease);

      await this.mailerModule.sendNextLeasePeriodStartedMail(
        {
          to: lease.tenant.email,
          name: lease.tenant.firstName,
          leaseEndDate: new Date(nextLease.endDate).toLocaleDateString(
            'en-US',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          ),
          leaseStartDate: new Date(nextLease.startDate).toLocaleDateString(
            'en-US',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          ),
          propertyName: lease.property.propertyName,
        },
        this.notificationService.createNotificationMailTrigger({
          userType: UserType.TENANT,
          lease: nextLease,
          property: lease.property,
          tenant: lease.tenant,
          notificationType: NotificationType.NEXT_LEASE_PERIOD_STARTED,
        })
      );

      await this.notificationService.createNextLeasePeriodStartedNotification(
        lease.tenant,
        lease.property,
        nextLease,
        lease.createdBy
      );
    } catch (error) {
      if (throwError) {
        throw error;
      } else {
        console.error(
          'Error while checking for lease end date to update currenty lease',
          error
        );
      }
    }
  }

  async setUpRentReminders(lease: Lease) {
    const twoMonthsBefore = new Date(lease.endDate);
    if (!envConfig.TEST_SETUP) {
      twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2);
    } else {
      twoMonthsBefore.setHours(twoMonthsBefore.getHours() - 20);
    }

    const twoWeeksBefore = new Date(lease.endDate);
    if (!envConfig.TEST_SETUP) {
      twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
    } else {
      twoWeeksBefore.setHours(twoWeeksBefore.getHours() - 2);
    }

    const twoMonthsBeforeObject: JobObject[JobNames.rentDue] = {
      leaseId: lease.id,
      timestamp: twoMonthsBefore.toISOString(),
      type: 'twoMonthsBefore',
    };

    const twoWeeksBeforeObject: JobObject[JobNames.rentDue] = {
      leaseId: lease.id,
      timestamp: twoWeeksBefore.toISOString(),
      type: 'twoWeeksBefore',
    };

    const dueObject: JobObject[JobNames.rentDue] = {
      leaseId: lease.id,
      timestamp: new Date(lease.endDate).toISOString(),
      type: 'due',
    };

    const cronJobModule = Container.get(CronJobModule);
    await cronJobModule.scheduleJob(
      JobNames.rentDue,
      {
        timestamp: twoMonthsBefore,
      },
      twoMonthsBeforeObject
    );

    await cronJobModule.scheduleJob(
      JobNames.rentDue,
      {
        timestamp: twoWeeksBefore,
      },
      twoWeeksBeforeObject
    );

    await cronJobModule.scheduleJob(
      JobNames.rentDue,
      {
        timestamp: new Date(lease.endDate),
      },
      dueObject
    );
  }

  async sendCustomLeaseNotification(
    body: LeaseValidationTypes['sendCustomLeaseNotification']
  ) {
    const lease = await this.findById(body.leaseId, {
      relations: {
        tenant: {
          user: true,
        },
        property: true,
      },
    });

    if (lease.property.currentLeaseId !== lease.id) {
      throw new BadRequestError('Lease is not the current lease');
    }

    await this.mailerModule.sendLeaseNotificationMail(
      {
        to: lease.tenant.user.email,
        notificationTitle: body.notificationTitle,
        notificationContent: body.notificationContent,
      },
      this.notificationService.createNotificationMailTrigger({
        lease,
        tenant: lease.tenant,
        property: lease.property,
        userType: UserType.TENANT,
        notificationType: NotificationType.CUSTOM_LEASE_NOTIFICATION,
      })
    );
  }

  async removeLeaseTenant(leaseId: string) {
    const lease = await this.findById(leaseId, {
      relations: {
        tenant: {
          user: true,
        },
        property: true,
      },
    });

    if (lease.property.currentLeaseId !== lease.id) {
      throw new BadRequestError('Lease is not the current lease');
    }

    await this.propertyService.update(lease.propertyId, {
      currentLeaseId: null,
    });

    await this.tenantService.update(lease.tenantId, {
      currentLeaseId: null,
    });

    await this.update(lease.id, {
      leaseStatus: LeaseStatus.INACTIVE,
    });

    await this.mailerModule.sendLeaseTenantRemovedMail(
      {
        to: lease.tenant.user.email,
        name: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
        propertyName: lease.property.propertyName,
      },
      this.notificationService.createNotificationMailTrigger({
        notificationType: NotificationType.LEASE_TENANT_REMOVED,
        userType: UserType.TENANT,
        tenant: lease.tenant,
      })
    );
  }
}
