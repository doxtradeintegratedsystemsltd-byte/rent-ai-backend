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
import envConfig from '../configs/envConfig';

@Service()
export class AuthService extends BaseService<Auth> {
  constructor() {
    super(dataSource.getRepository(Auth));
  }

  private get authModule(): AuthModule {
    return Container.get(AuthModule);
  }

  private get mailerModule(): MailerModule {
    return Container.get(MailerModule);
  }

  private get notificationService(): NotificationService {
    return Container.get(NotificationService);
  }

  private get userService(): UserService {
    return Container.get(UserService);
  }

  async createOneTimeSuperAdmin(
    body: AuthValidationTypes['oneTimeSuperAdmin']
  ) {
    const superAdmins = await this.userService.findMany({
      where: {
        userType: UserType.SUPER_ADMIN,
      },
    });

    if (superAdmins.length >= 2) {
      throw new BadRequestError('Max number of super admins reached');
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
        break;
      }
      case UserType.SUPER_ADMIN: {
        this.mailerModule.sendNewSuperAdminMail(
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
        break;
      }
    }
    return { user, auth, password };
  }

  async forgotPasswordMail(email: string) {
    const auth = await this.findOne({
      where: {
        email,
      },
      relations: {
        user: true,
      },
    });

    if (!auth) {
      return null;
    }

    if (auth.user.deletedAt) {
      return null;
    }

    const secret = this.generatePasswordResetSecret(auth);
    const activationToken = await this.authModule.createResetPasswordToken(
      auth.userId,
      secret
    );

    const resetLink = `${envConfig.FRONTEND_URL}/reset-password?token=${activationToken}&userId=${auth.userId}`;
    await this.mailerModule.sendPasswordResetLinkMail(
      {
        to: auth.email,
        name: auth.user.firstName,
        resetLink,
      },
      this.notificationService.createNotificationMailTrigger({
        userId: auth.userId,
        userType: auth.user.userType,
        notificationType: NotificationType.PASSWORD_RESET,
      })
    );

    return true;
  }

  async verifyPasswordResetLink({
    token,
    userId,
  }: AuthValidationTypes['verifyPasswordResetLink']) {
    const auth = await this.findOne({
      where: {
        userId,
      },
      relations: {
        user: true,
      },
    });

    if (!auth) {
      throw new BadRequestError('Invalid reset link');
    }

    const secret = this.generatePasswordResetSecret(auth);
    const isValid = await this.authModule.verifyResetPasswordToken(
      token,
      secret
    );
    if (!isValid) {
      throw new BadRequestError('Invalid reset link');
    }

    return {
      authId: auth.id,
      userId: auth.userId,
      email: auth.email,
      firstName: auth.user.firstName,
      createdAt: auth.createdAt,
      updatedAt: auth.updatedAt,
    };
  }

  async resetPassword({
    password,
    token,
    userId,
  }: AuthValidationTypes['resetPassword']) {
    const { authId } = await this.verifyPasswordResetLink({
      token,
      userId,
    });

    const hashedPassword = await this.authModule.hashPassword(password);
    await this.update(authId, {
      password: hashedPassword,
    });
  }

  async changePassword(
    { password }: AuthValidationTypes['changePassword'],
    authUser: User
  ) {
    const auth = await this.findOne({
      where: {
        userId: authUser.id,
      },
    });

    if (!auth) {
      throw new BadRequestError('Invalid user');
    }

    const hashedPassword = await this.authModule.hashPassword(password);
    await this.update(auth.id, {
      password: hashedPassword,
    });
  }

  private generatePasswordResetSecret(auth: Auth) {
    const secret = `${auth.password}!${auth.updatedAt.toISOString()}`;

    return secret;
  }
}
