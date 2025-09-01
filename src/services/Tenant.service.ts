import Container, { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Tenant } from '../entities/Tenant';
import { TenantValidationTypes } from '../validations/Tenant.validation';
import { BadRequestError } from '../configs/error';
import { PropertyService } from './Property.service';
import { AuthService } from './Auth.service';
import { UserType } from '../utils/authUser';
import { UserService } from './User.service';
import { User } from '../entities/User';
import { LeaseService } from './Lease.service';
import { NotificationStatus, NotificationType } from '../utils/notification';
import { NotificationService } from './Notification.service';
import { MailerModule } from '../modules/Mailer.module';
import { PaginationRequest } from '../types/CustomTypes';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  Not,
} from 'typeorm';
import { RentStatus } from '../utils/lease';
import { deepMerge } from '../utils/searchFilter';

@Service()
export class TenantService extends BaseService<Tenant> {
  constructor() {
    super(dataSource.getRepository(Tenant));
  }

  private get propertyService(): PropertyService {
    return Container.get(PropertyService);
  }

  private get authService(): AuthService {
    return Container.get(AuthService);
  }

  private get leaseService(): LeaseService {
    return Container.get(LeaseService);
  }

  private get notificationService(): NotificationService {
    return Container.get(NotificationService);
  }

  private get mailerModule(): MailerModule {
    return Container.get(MailerModule);
  }

  private get userService() {
    return Container.get(UserService);
  }

  async getAllTenants(query: PaginationRequest, authUser: User) {
    const { search, status, adminId, sort, sortOrder } = query;

    const defaultFilter: FindOptionsWhere<Tenant> = {};
    const searchFilters: FindOptionsWhere<Tenant>[] = [];

    if (authUser.userType === UserType.ADMIN) {
      defaultFilter.createdById = authUser.id;
    } else {
      if (adminId) {
        defaultFilter.createdById = adminId;
      }
    }

    if (search) {
      const searchItem = ILike(`%${search}%`);
      searchFilters.push(
        { firstName: searchItem },
        { lastName: searchItem },
        { email: searchItem },
        { phoneNumber: searchItem }
      );
    }

    if (status) {
      switch (status) {
        case 'leasing': {
          defaultFilter.currentLease = Not(IsNull());
          break;
        }
        case 'not-leasing': {
          defaultFilter.currentLease = IsNull();
          break;
        }
        case 'rent-paid': {
          defaultFilter.currentLease = {
            rentStatus: RentStatus.PAID,
          };
          break;
        }
        case 'rent-unpaid': {
          defaultFilter.currentLease = {
            rentStatus: In([RentStatus.DUE, RentStatus.OVER_DUE]),
          };
          break;
        }
      }
    }

    let order: FindOptionsOrder<Tenant> = {
      createdAt: sortOrder || 'DESC',
    };

    switch (sort) {
      case 'name':
        order = {
          firstName: sortOrder,
        };
        break;
      case 'property':
        order = {
          currentLease: {
            property: {
              propertyName: sortOrder,
            },
          },
        };
        break;
      case 'location':
        order = {
          currentLease: {
            property: {
              propertyState: sortOrder,
            },
          },
        };
        break;
      case 'admin':
        order = {
          currentLease: {
            createdBy: {
              firstName: sortOrder,
            },
          },
        };
        break;
      case 'rent-status':
        order = {
          currentLease: {
            rentStatus: sortOrder,
          },
        };
        break;
      default:
        order = {
          [sort || 'createdAt']: sortOrder,
        };
    }

    const where = searchFilters.length
      ? searchFilters.map((filter) => deepMerge(defaultFilter, filter))
      : defaultFilter;

    const tenants = await this.findAllPaginated(query, {
      where,
      order,
      relations: {
        createdBy: true,
        currentLease: {
          property: true,
        },
      },
    });
    return tenants;
  }

  async addTenant(body: TenantValidationTypes['create'], authUser: User) {
    const property = await this.propertyService.findById(body.propertyId, {
      relations: {
        currentLease: true,
      },
    });

    if (property.currentLease) {
      throw new BadRequestError('Property already has a tenant');
    }

    const existingTenant = await this.findOne({
      where: {
        email: body.email,
      },
      relations: {
        currentLease: true,
        user: true,
      },
    });

    if (existingTenant?.currentLease) {
      throw new BadRequestError('Tenant already has a property');
    }

    let tenant;
    if (!existingTenant) {
      tenant = await this.createNewTenant(body, authUser);
    } else {
      tenant = await this.updateTenant(existingTenant, body);
    }

    const lease = await this.leaseService.createNewLease(
      property,
      tenant,
      authUser,
      body
    );

    const updatedProperty = await this.propertyService.update(property.id, {
      currentLease: lease,
    });

    const updatedTenant = await this.update(tenant.id, {
      currentLease: lease,
    });

    await this.leaseService.setUpRentReminders(lease);

    return {
      property: updatedProperty,
      tenant: updatedTenant,
      lease,
    };
  }

  private async createNewTenant(
    body: Pick<
      TenantValidationTypes['create'],
      | 'firstName'
      | 'lastName'
      | 'email'
      | 'phoneNumber'
      | 'levelOfEducation'
      | 'photoUrl'
    >,
    authUser: User
  ) {
    const existingTenant = await this.findOne({
      where: {
        email: body.email,
      },
    });

    if (existingTenant) {
      throw new BadRequestError('Tenant already exists');
    }

    const { user, password } = await this.authService.createUser(
      {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        photoUrl: body.photoUrl,
        phoneNumber: body.phoneNumber,
      },
      UserType.TENANT
    );

    const tenant = await this.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phoneNumber: body.phoneNumber,
      levelOfEducation: body.levelOfEducation,
      createdById: authUser.id,
    });

    await this.userService.update(user.id, {
      tenantId: tenant.id,
    });

    await this.mailerModule.sendNewTenantMail(
      {
        to: body.email,
        email: body.email,
        name: body.firstName,
        password: password,
      },
      this.notificationService.createNotificationMailTrigger({
        userType: UserType.TENANT,
        tenant,
        notificationType: NotificationType.ACCOUNT_CREATED,
      })
    );
    return tenant;
  }

  async updateTenant(
    tenant: Tenant,
    body: Partial<
      Pick<
        TenantValidationTypes['create'],
        | 'firstName'
        | 'lastName'
        | 'phoneNumber'
        | 'levelOfEducation'
        | 'photoUrl'
        | 'email'
      >
    >
  ) {
    const {
      firstName,
      lastName,
      phoneNumber,
      levelOfEducation,
      photoUrl,
      email,
    } = body;

    const updatedTenant = await this.update(tenant.id, {
      firstName,
      lastName,
      phoneNumber,
      levelOfEducation,
      email,
    });

    await this.userService.updateProfile(tenant.user.id, {
      firstName,
      lastName,
      phoneNumber,
      photoUrl,
      email,
    });

    return updatedTenant;
  }
}
