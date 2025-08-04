import { Service } from 'typedi';
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
  PaymentType,
  RentStatus,
} from '../utils/lease';
import { LeasePaymentService } from './LeasePayment.service';
import { BadRequestError } from '../configs/error';
import { LeaseValidationTypes } from '../validations/Lease.validation';
import { UserType } from '../utils/authUser';

@Service()
export class LeaseService extends BaseService<Lease> {
  constructor(private readonly leasePaymentService: LeasePaymentService) {
    super(dataSource.getRepository(Lease));
  }

  private async createLease(
    property: Property,
    tenant: Tenant,
    authUser: User,
    data: Pick<TenantValidationTypes['create'], 'startDate' | 'leaseCycles'>,
    rentStatus: RentStatus
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
      leaseStatus: LeaseStatus.ACTIVE,
      leaseYears: property.leaseYears,
      leaseCycles: data.leaseCycles,
      createdBy: authUser,
      rentAmount: property.rentAmount * data.leaseCycles,
      rentStatus,
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

    return this.update(lease.id, { payment: leasePayment });
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
      },
    });

    if (authUser.userType === UserType.TENANT) {
      if (lease.tenant.id !== authUser.id) {
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
    if (!lease.nextLease) {
      nextLease = await this.createLease(
        lease.property,
        lease.tenant,
        authUser,
        {
          startDate: new Date(lease.endDate).toISOString(),
          leaseCycles,
        },
        RentStatus.DUE
      );

      await this.update(lease.id, {
        nextLease: nextLease,
      });
    } else {
      nextLease = await this.createLease(
        lease.property,
        lease.tenant,
        authUser,
        {
          startDate: new Date(lease.endDate).toISOString(),
          leaseCycles,
        },
        RentStatus.DUE
      );

      await this.update(lease.id, {
        nextLease: nextLease,
      });

      await this.softDelete(lease.nextLease.id);
    }

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
      });

      this.update(lease.id, {
        rentStatus: RentStatus.PAID,
      });

      return null;
    } else {
      const { leasePayment, paymentLink } =
        await this.leasePaymentService.createLeasePayment(
          nextLease,
          PaymentType.PAYSTACK,
          authUser
        );

      return paymentLink;
    }
  }
}
