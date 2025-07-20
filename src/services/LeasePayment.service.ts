import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { LeasePayment } from '../entities/LeasePayment';
import { User } from '../entities/User';
import { Lease } from '../entities/Lease';
import { PaymentStatus, PaymentType } from '../utils/lease';

@Service()
export class LeasePaymentService extends BaseService<LeasePayment> {
  constructor() {
    super(dataSource.getRepository(LeasePayment));
  }

  createLeasePayment(
    lease: Lease,
    paymentType: PaymentType,
    authUser: User,
    receiptUrl?: string
  ) {
    const payment = this.create({
      lease,
      type: paymentType,
      createdById: authUser.id,
      receiptUrl,
      amount: lease.rentAmount,
      status:
        paymentType === PaymentType.MANUAL
          ? PaymentStatus.COMPLETED
          : PaymentStatus.PENDING,
    });

    return payment;
  }
}
