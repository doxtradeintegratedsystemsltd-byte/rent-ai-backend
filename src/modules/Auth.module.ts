import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { signJwt, signWithSecret, verifyJwtWithSecret } from '../utils/jwt';
import { generateRandonString } from '../utils/generatePassword';
import { Service } from 'typedi';
import { AuthUser } from '../types/Authentication';

@Service()
export class AuthModule {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(
      password,
      parseInt(process.env.PASSWORD_SALT_ROUNDS as string)
    );
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateToken(payload: AuthUser): Promise<string> {
    return signJwt(payload, { expiresIn: '30d' });
  }

  async verifyRole(role: string, token: string): Promise<boolean> {
    const decoded: { id: string; role: string; email: string } = jwt.decode(
      token
    ) as unknown as { id: string; role: string; email: string };
    const rolesMatch = decoded.role === role;
    return rolesMatch;
  }

  async createResetPasswordToken(
    userId: string,
    secret: string,
    expiresIn: jwt.SignOptions['expiresIn'] = '1d'
  ) {
    return signWithSecret({ userId }, secret, { expiresIn });
  }

  async verifyResetPasswordToken(token: string, secret: string) {
    return verifyJwtWithSecret(token, secret);
  }

  generatePassword() {
    // return 'password';
    return generateRandonString(8, false, true);
  }
}
