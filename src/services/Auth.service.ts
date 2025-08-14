import { Service, Container } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Auth } from '../entities/Auth';
import { AuthValidationTypes } from '../validations/Auth.validation';
import { UserService } from './User.service';
import { UserType } from '../utils/authUser';
import { BadRequestError } from '../configs/error';
import { AuthModule } from '../modules/Auth.module';
import { User } from '../entities/User';
import { MailerModule } from '../modules/Mailer.module';
import { NotificationService } from './Notification.service';
import { NotificationStatus, NotificationType } from '../utils/notification';

@Service()
export class AuthService extends BaseService<Auth> {
  constructor(
    private authModule: AuthModule,
    private mailerModule: MailerModule,
    private notificationService: NotificationService
  ) {
    super(dataSource.getRepository(Auth));
  }

  private get userService(): UserService {
    return Container.get(UserService);
  }

  async createOneTimeSuperAdmin(
    body: AuthValidationTypes['oneTimeSuperAdmin']
  ) {
    const existingSuperAdmin = await this.userService.findOne({
      where: {
        userType: UserType.SUPER_ADMIN,
      },
    });

    if (existingSuperAdmin) {
      throw new BadRequestError('Superadmin already exists');
    }

    await this.createUser(body, UserType.SUPER_ADMIN);

    return {
      email: body.email,
    };
  }

  async checkDuplicateEmail(email: string) {
    const existingUser = await this.userService.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestError('User with email already exists');
    }

    const existingAuth = await this.findOne({
      where: {
        email,
      },
    });

    if (existingAuth) {
      throw new BadRequestError('User with email already exists.');
    }
  }

  async login(body: AuthValidationTypes['login']) {
    const auth = await this.findOne({
      where: {
        email: body.email,
      },
      relations: {
        user: true,
      },
    });

    if (!auth) {
      throw new BadRequestError('Invalid credentials');
    }

    const isPasswordValid = await this.authModule.verifyPassword(
      body.password,
      auth.password
    );

    if (!isPasswordValid) {
      throw new BadRequestError('Invalid credentials.');
    }

    const user = auth.user;
    const token = await this.authModule.generateToken({
      id: user.id,
      role: user.userType,
      email: user.email,
    });

    return {
      token,
      user,
    };
  }

  async createAdmin(body: AuthValidationTypes['createAdmin']) {
    await this.createUser(body, UserType.ADMIN);

    return {
      email: body.email,
    };
  }

  async createUser(
    body: {
      firstName: string;
      lastName: string;
      email: string;
    } & Partial<User>,
    userType: UserType
  ) {
    await this.checkDuplicateEmail(body.email);

    const password = this.authModule.generatePassword();
    const hashedPassword = await this.authModule.hashPassword(password);

    const user = await this.userService.create({
      ...body,
      userType,
    });

    const auth = await this.create({
      email: body.email,
      password: hashedPassword,
      userId: user.id,
    });

    switch (userType) {
      case UserType.ADMIN: {
        this.mailerModule.sendNewAdminMail(
          {
            to: body.email,
            email: body.email,
            name: body.firstName,
            password: password,
          },
          this.notificationService.createNotificationMailTrigger({
            userType,
            admin: user,
            notificationType: NotificationType.ACCOUNT_CREATED,
          })
        );
      }
    }
    return { user, auth, password };
  }
}
