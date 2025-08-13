import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { LeasePayment } from '../entities/LeasePayment';
import { User } from '../entities/User';
import { Lease } from '../entities/Lease';
import { PaymentStatus, PaymentType } from '../utils/lease';
import { PaystackModule } from '../modules/Paystack.module';
import envConfig from '../configs/envConfig';
import { Between } from 'typeorm';

@Service()
export class LeasePaymentService extends BaseService<LeasePayment> {
  constructor(private paystackModule: PaystackModule) {
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
      const { authorization_url, reference } =
        await this.paystackModule.initializeTransaction({
          amount: this.paystackModule.convertToKobo(lease.rentAmount),
          email: lease.tenant.email,
          callback_url: `${envConfig.BACKEND_URL}/api/leases/payment/callback`,
        });

      paymentLink = authorization_url;
      payment.reference = reference;

      await this.repository.save(payment);
    }
    return { leasePayment: payment, paymentLink };
  }

  async getLeasePaymentAnalytics(
    startDate: Date,
    endDate: Date,
    lastPeriod: Date
  ) {
    const [allPayments, currPayments, prevPayments] = await Promise.all([
      this.getLeasePaymentsForPeriod(),
      this.getLeasePaymentsForPeriod(startDate, endDate),
      this.getLeasePaymentsForPeriod(lastPeriod, startDate),
    ]);

    return {
      all: allPayments,
      current: currPayments,
      previous: prevPayments,
    };
  }

  private async getLeasePaymentsForPeriod(startDate?: Date, endDate?: Date) {
    const paymentDate =
      startDate && endDate ? Between(startDate, endDate) : undefined;

    const payments = await this.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        // type: PaymentType.PAYSTACK,
        paymentDate,
      },
      select: {
        id: true,
        amount: true,
      },
    });

    return payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
  }
}
