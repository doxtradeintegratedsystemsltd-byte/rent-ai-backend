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
import { NotificationStatus, NotificationType } from '../utils/notification';
import { NotificationService } from './Notification.service';
import { MailerModule } from '../modules/Mailer.module';

@Service()
export class TenantService extends BaseService<Tenant> {
  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private userService: UserService,
    private leaseService: LeaseService,
    private notificationService: NotificationService,
    private mailerModule: MailerModule
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
