import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Auth } from '../entities/Auth';
import { AuthValidationTypes } from '../validations/Auth.validation';
import { UserService } from './User.service';
import { UserType } from '../utils/authUser';
import { BadRequestError } from '../configs/error';
import { AuthModule } from '../modules/Auth.module';

@Service()
export class AuthService extends BaseService<Auth> {
  constructor(
    private userService: UserService,
    private authModule: AuthModule
  ) {
    super(dataSource.getRepository(Auth));
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

    await this.checkDuplicateEmail(body.email);

    const password = this.authModule.generatePassword();
    const hashedPassword = await this.authModule.hashPassword(password);

    const user = await this.userService.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      userType: UserType.SUPER_ADMIN,
    });

    await this.create({
      email: body.email,
      password: hashedPassword,
      userId: user.id,
    });

    return {
      email: body.email,
      password,
    };
  }

  async checkDuplicateEmail(email: string) {
    const existingUser = await this.userService.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestError('Email already exists');
    }

    const existingAuth = await this.findOne({
      where: {
        email,
      },
    });

    if (existingAuth) {
      throw new BadRequestError('Email already exists.');
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
    await this.checkDuplicateEmail(body.email);

    const password = this.authModule.generatePassword();
    const hashedPassword = await this.authModule.hashPassword(password);

    const user = await this.userService.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      userType: UserType.ADMIN,
    });

    await this.create({
      email: body.email,
      password: hashedPassword,
      userId: user.id,
    });

    return {
      email: body.email,
      password,
    };
  }
}
