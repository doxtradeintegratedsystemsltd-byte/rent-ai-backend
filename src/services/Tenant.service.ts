import { Service } from 'typedi';
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
import { JobNames, JobObject } from '../utils/job';
import { CronJobModule } from '../modules/CronJob.module';
import { Lease } from '../entities/Lease';

@Service()
export class TenantService extends BaseService<Tenant> {
  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private userService: UserService,
    private leaseService: LeaseService,
    private cronJobModule: CronJobModule
  ) {
    super(dataSource.getRepository(Tenant));
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
      },
    });

    if (existingTenant?.currentLease) {
      throw new BadRequestError('Tenant already has a property');
    }

    let tenant;
    if (!existingTenant) {
      tenant = await this.createNewTenant(body, authUser);
    } else {
      tenant = await this.update(existingTenant.id, body);
    }

    const lease = await this.leaseService.createLease(
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

    await this.setUpRentReminders(lease);

    return {
      property: updatedProperty,
      tenant: updatedTenant,
      lease,
    };
  }

  private async setUpRentReminders(lease: Lease) {
    const twoMonthsBefore = new Date(lease.endDate);
    twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2);

    const twoWeeksBefore = new Date(lease.endDate);
    twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);

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
      timestamp: lease.endDate.toISOString(),
      type: 'due',
    };

    await Promise.all([
      this.cronJobModule.scheduleJob(
        JobNames.rentDue,
        {
          timestamp: twoMonthsBefore,
        },
        twoMonthsBeforeObject
      ),
      this.cronJobModule.scheduleJob(
        JobNames.rentDue,
        {
          timestamp: twoWeeksBefore,
        },
        twoWeeksBeforeObject
      ),
      this.cronJobModule.scheduleJob(
        JobNames.rentDue,
        {
          timestamp: lease.endDate,
        },
        dueObject
      ),
    ]);
  }

  private async createNewTenant(
    body: Pick<
      TenantValidationTypes['create'],
      'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'levelOfEducation'
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

    const { user } = await this.authService.createUser(
      {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
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

    return tenant;
  }
}
