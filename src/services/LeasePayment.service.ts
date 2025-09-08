import { Service, Container } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { LeasePayment } from '../entities/LeasePayment';
import { User } from '../entities/User';
import { Lease } from '../entities/Lease';
import { PaymentStatus, PaymentType } from '../utils/lease';
import { PaystackModule } from '../modules/Paystack.module';
import envConfig from '../configs/envConfig';
import { Between, FindOptionsWhere, ILike } from 'typeorm';
import { PaginationRequest } from '../types/CustomTypes';
import { UserType } from '../utils/authUser';
import { deepMerge } from '../utils/searchFilter';

@Service()
export class LeasePaymentService extends BaseService<LeasePayment> {
  constructor() {
    super(dataSource.getRepository(LeasePayment));
  }

  private get paystackModule(): PaystackModule {
    return Container.get(PaystackModule);
  }

  async createLeasePayment(
    lease: Lease,
    paymentType: PaymentType,
    _authUser: User,
    receiptUrl?: string,
    paymentDate?: Date
  ) {
    const payment = await this.create({
      lease,
      type: paymentType,
      createdById: lease.createdById,
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
    lastPeriod: Date,
    adminId?: string
  ) {
    const whereFilter = adminId ? { lease: { createdById: adminId } } : null;

    const [allPayments, currPayments, prevPayments] = await Promise.all([
      this.getLeasePaymentsForPeriod(whereFilter),
      this.getLeasePaymentsForPeriod(whereFilter, startDate, endDate),
      this.getLeasePaymentsForPeriod(whereFilter, lastPeriod, startDate),
    ]);

    return {
      all: allPayments,
      current: currPayments,
      previous: prevPayments,
    };
  }

  private async getLeasePaymentsForPeriod(
    whereFilter: FindOptionsWhere<LeasePayment> | null = null,
    startDate?: Date,
    endDate?: Date
  ) {
    const paymentDate =
      startDate && endDate ? Between(startDate, endDate) : undefined;

    const payments = await this.findMany({
      where: {
        ...whereFilter,
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

  async getAllLeasePayments(query: PaginationRequest, authUser: User) {
    const { search, status, adminId } = query;

    const defaultFilter: FindOptionsWhere<LeasePayment> = {
      status: PaymentStatus.COMPLETED,
    };
    const searchFilters: FindOptionsWhere<LeasePayment>[] = [];

    if (authUser.userType === UserType.ADMIN) {
      defaultFilter.lease = {
        createdById: authUser.id,
      };
    } else {
      if (adminId) {
        defaultFilter.lease = {
          createdById: adminId,
        };
      }
    }

    if (search) {
      const searchItem = ILike(`%${search}%`);
      searchFilters.push(
        { reference: searchItem },
        {
          lease: {
            tenant: { firstName: searchItem },
          },
        },
        {
          lease: {
            tenant: { lastName: searchItem },
          },
        },
        {
          lease: {
            tenant: { email: searchItem },
          },
        },
        {
          lease: {
            tenant: { phoneNumber: searchItem },
          },
        },
        { lease: { property: { propertyName: searchItem } } },
        { lease: { createdBy: { firstName: searchItem } } },
        { lease: { createdBy: { lastName: searchItem } } },
        { lease: { createdBy: { email: searchItem } } },
        { lease: { createdBy: { phoneNumber: searchItem } } }
      );
    }

    if (status) {
      switch (status) {
        case 'manual': {
          defaultFilter.type = PaymentType.MANUAL;
          break;
        }
        case 'paystack': {
          defaultFilter.type = PaymentType.PAYSTACK;
          break;
        }
      }
    }

    const where = searchFilters.length
      ? searchFilters.map((filter) => deepMerge(defaultFilter, filter))
      : defaultFilter;

    const data = await this.findAllPaginated(query, {
      where,
      relations: {
        createdBy: true,
        lease: {
          property: true,
          tenant: true,
        },
      },
    });

    return data;
  }
}
