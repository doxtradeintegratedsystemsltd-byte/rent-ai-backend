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

  async createLeasePayment(
    lease: Lease,
    paymentType: PaymentType,
    authUser: User,
    receiptUrl?: string,
    paymentDate?: Date
  ) {
    const payment = await this.create({
      lease,
      type: paymentType,
      createdById: authUser.id,
      receiptUrl,
      paymentDate,
      amount: lease.rentAmount,
      status:
        paymentType === PaymentType.MANUAL
          ? PaymentStatus.COMPLETED
          : PaymentStatus.PENDING,
    });

    let paymentLink;
    if (paymentType === PaymentType.PAYSTACK) {
      // TODO: Implement paystack payment
      // will get payment link and reference
      // update payment with payment link and reference
      // return payment link and reference
      paymentLink = 'https://paystack.com/pay/1234567890';
      payment.reference = '1234567890';

      await this.repository.save(payment);
    }
    return { leasePayment: payment, paymentLink };
  }
}
