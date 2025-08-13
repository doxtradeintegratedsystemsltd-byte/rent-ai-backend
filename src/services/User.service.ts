import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { User } from '../entities/User';
import { UserType } from '../utils/authUser';
import { PropertyService } from './Property.service';
import {
  AnalysisPeriod,
  getAnalysisPeriods,
  getEntityCounts,
} from '../utils/analytics';
import { TenantService } from './Tenant.service';
import { LeasePaymentService } from './LeasePayment.service';

@Service()
export class UserService extends BaseService<User> {
  constructor(
    private propertyService: PropertyService,
    private tenantService: TenantService,
    private leasePaymentService: LeasePaymentService
  ) {
    super(dataSource.getRepository(User));
  }

  async getDashboardData(userType: UserType, peroid: AnalysisPeriod) {
    const {
      currentPeriod: { lastPeriod, startDate, endDate },
    } = getAnalysisPeriods(peroid);

    const [
      allProperties,
      currProperties,
      prevProperties,
      allTenants,
      currTenants,
      prevTenants,
      allAdmins,
      currAdmins,
      prevAdmins,
      payments,
    ] = await Promise.all([
      getEntityCounts(this.propertyService, null),
      getEntityCounts(this.propertyService, null, startDate, endDate),
      getEntityCounts(this.propertyService, null, lastPeriod, startDate),

      getEntityCounts(this.tenantService, null),
      getEntityCounts(this.tenantService, null, startDate, endDate),
      getEntityCounts(this.tenantService, null, lastPeriod, startDate),

      getEntityCounts(this, { userType: UserType.ADMIN }),
      getEntityCounts(this, { userType: UserType.ADMIN }, startDate, endDate),
      getEntityCounts(
        this,
        { userType: UserType.ADMIN },
        lastPeriod,
        startDate
      ),

      this.leasePaymentService.getLeasePaymentAnalytics(
        startDate,
        endDate,
        lastPeriod
      ),
    ]);

    const response = {
      properties: {
        all: allProperties,
        current: currProperties,
        previous: prevProperties,
      },
      tenants: {
        all: allTenants,
        current: currTenants,
        previous: prevTenants,
      },
      ...(userType === UserType.SUPER_ADMIN && {
        admins: {
          all: allAdmins,
          current: currAdmins,
          previous: prevAdmins,
        },
      }),
      payments: {
        all: payments.all,
        current: payments.current,
        previous: payments.previous,
      },
    };

    return response;
  }
}
