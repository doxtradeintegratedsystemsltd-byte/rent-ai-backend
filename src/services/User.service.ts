import { Service, Container } from 'typedi';
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
import { PaymentStatus, RentStatus } from '../utils/lease';
import { PaginationRequest } from '../types/CustomTypes';
import { getPagnation } from '../utils/pagination';
import { Property } from '../entities/Property';
import { Tenant } from '../entities/Tenant';
import { Lease } from '../entities/Lease';
import { LeasePayment } from '../entities/LeasePayment';
import { UserValidationTypes } from '../validations/User.validation';
import { AuthService } from './Auth.service';
import { BadRequestError } from '../configs/error';
import { In } from 'typeorm';

@Service()
export class UserService extends BaseService<User> {
  constructor() {
    super(dataSource.getRepository(User));
  }

  private get propertyService(): PropertyService {
    return Container.get(PropertyService);
  }

  private get tenantService(): TenantService {
    return Container.get(TenantService);
  }

  private get leasePaymentService(): LeasePaymentService {
    return Container.get(LeasePaymentService);
  }

  private get authService(): AuthService {
    return Container.get(AuthService);
  }

  async getAdminUsers(pagination: PaginationRequest) {
    const { page, size, sort, sortOrder, search } = pagination;
    const { limit, offset } = getPagnation(page, size);

    const order: 'ASC' | 'DESC' = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // base count query to compute total items after filters
    const countQb = this.getQueryBuilder('user').where(
      'user.userType = :userType',
      { userType: UserType.ADMIN }
    );

    if (search) {
      const s = `%${String(search).toLowerCase()}%`;
      countQb.andWhere(
        '(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)',
        { s }
      );
    }

    const totalItems = await countQb.getCount();

    // main query with computed columns
    const qb = this.getQueryBuilder('user')
      .where('user.userType = :userType', { userType: UserType.ADMIN })
      .select('user.id', 'id')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.email', 'email')
      .addSelect('user.photoUrl', 'photoUrl')
      .addSelect('user.phoneNumber', 'phoneNumber')
      .addSelect('user.createdAt', 'createdAt');

    // subqueries for properties count, tenants count, and rent processed
    const propertiesSub = qb
      .subQuery()
      .select('COUNT(property.id)')
      .from(Property, 'property')
      .where('property.createdById = user.id')
      .getQuery();

    const tenantsSub = qb
      .subQuery()
      .select('COUNT(tenant.id)')
      .from(Tenant, 'tenant')
      .where('tenant.createdById = user.id')
      .getQuery();

    const rentProcessedSub = qb
      .subQuery()
      .select('COALESCE(SUM(lp.amount), 0)')
      .from(LeasePayment, 'lp')
      .innerJoin(Lease, 'l', 'l.id = lp.leaseId')
      .innerJoin(Property, 'p', 'p.id = l.propertyId')
      .where('p.createdById = user.id')
      .andWhere('lp.status = :completed')
      .getQuery();

    qb.addSelect(propertiesSub, 'properties')
      .addSelect(tenantsSub, 'tenants')
      .addSelect(rentProcessedSub, 'rentProcessed')
      .setParameter('completed', PaymentStatus.COMPLETED);

    if (search) {
      const s = `%${String(search).toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)',
        { s }
      );
    }

    // sorting
    const sortMap: Record<string, string> = {
      properties: 'properties',
      tenants: 'tenants',
      rentProcessed: 'rentProcessed',
      firstName: 'user.firstName',
      lastName: 'user.lastName',
      email: 'user.email',
      createdAt: 'user.createdAt',
    };

    const sortKey = sortMap[sort as keyof typeof sortMap] || 'user.createdAt';
    qb.orderBy(sortKey, order);

    // pagination
    qb.skip(offset).take(limit);

    const rows = await qb.getRawMany();

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page ? +page : 0;

    // coerce numeric fields
    const data = rows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      photoUrl: r.photoUrl,
      phoneNumber: r.phoneNumber,
      createdAt: r.createdAt,
      properties: Number(r.properties) || 0,
      tenants: Number(r.tenants) || 0,
      rentProcessed: parseFloat(r.rentProcessed || '0'),
    }));

    return {
      data,
      totalItems,
      currentPage,
      totalPages,
      pageSize: limit,
    };
  }

  async getDashboardData(
    userType: UserType,
    peroid: AnalysisPeriod,
    adminId?: string
  ) {
    const {
      currentPeriod: { lastPeriod, startDate, endDate },
    } = getAnalysisPeriods(peroid);

    const propertyFilter = adminId ? { createdById: adminId } : null;
    const tenantFilter = adminId ? { createdById: adminId } : null;

    const duePropertiesFilter = {
      createdById: undefined,
      currentLease: {
        rentStatus: In([RentStatus.DUE, RentStatus.OVER_DUE]),
      },
    };

    if (adminId) {
      duePropertiesFilter.createdById = adminId as any;
    }

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
      dueProperties,
    ] = await Promise.all([
      getEntityCounts(this.propertyService, propertyFilter),
      getEntityCounts(this.propertyService, propertyFilter, startDate, endDate),
      getEntityCounts(
        this.propertyService,
        propertyFilter,
        lastPeriod,
        startDate
      ),

      getEntityCounts(this.tenantService, tenantFilter),
      getEntityCounts(this.tenantService, tenantFilter, startDate, endDate),
      getEntityCounts(this.tenantService, tenantFilter, lastPeriod, startDate),

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
        lastPeriod,
        adminId
      ),
      getEntityCounts(this.propertyService, duePropertiesFilter),
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
      dueProperties,
    };

    return response;
  }

  async getOneAdminDetails(id: string, peroid: AnalysisPeriod) {
    const user = await this.findById(id);

    if (user.userType !== UserType.ADMIN) {
      throw new BadRequestError('User is not an admin');
    }

    const analytics = await this.getDashboardData(UserType.ADMIN, peroid, id);

    return {
      user,
      analytics,
    };
  }

  async updateProfile(
    userId: string,
    body: UserValidationTypes['updateProfile']
  ) {
    await this.findById(userId);
    const user = await this.update(userId, body);

    if (body.email) {
      await this.authService.update(userId, { email: body.email });
    }
    return user;
  }

  async deleteAdmin(id: string) {
    const user = await this.findById(id);
    if (user.userType !== UserType.ADMIN) {
      throw new BadRequestError('User is not an admin');
    }

    await this.softDelete(id);
  }
}
