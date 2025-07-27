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

// Evening boss. Sorry for the late message, but didn’t want to
// forget the question. When adding a tenant, the admin can say
// that the rent is already paid. That means that the tenant
// doesn’t have to pay on the system? And then if it’s unpaid,
// the tenant has to pay?
@Service()
export class LeaseService extends BaseService<Lease> {
  constructor(private readonly leasePaymentService: LeasePaymentService) {
    super(dataSource.getRepository(Lease));
  }

  async createLease(
    property: Property,
    tenant: Tenant,
    authUser: User,
    data: Pick<
      TenantValidationTypes['create'],
      'startDate' | 'noOfYears' | 'rentAmount' | 'paymentReceipt'
    >
  ) {
    let rentStatus = RentStatus.PAID;

    const lease = await this.create({
      property,
      tenant,
      startDate: data.startDate,
      endDate: getLeaseEndDate(data.startDate, data.noOfYears),
      leaseStatus: LeaseStatus.ACTIVE,
      createdBy: authUser,
      rentAmount: data.rentAmount,
      rentStatus,
    });

    const { leasePayment } = await this.leasePaymentService.createLeasePayment(
      lease,
      PaymentType.MANUAL,
      authUser,
      data.paymentReceipt
    );

    return this.update(lease.id, { payment: leasePayment });
  }
}
