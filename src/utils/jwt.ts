// import config from "config";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import envConfig from '../configs/envConfig';

dotenv.config();

const secretKey = envConfig.JWT_SECRET;

export function signWithSecret(
  object: object,
  secret: string,
  options?: jwt.SignOptions | undefined
) {
  return jwt.sign(object, secret, {
    ...(options && options),
    algorithm: 'HS256',
  });
}

export function signJwt(object: object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, secretKey, {
    ...(options && options),
    algorithm: 'HS256',
  });
}

export function verifyJwt<T>(token: string): T | null {
  try {
    const decoded = jwt.verify(token, secretKey) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}

export function verifyJwtWithSecret(token: string, secret: string) {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (e) {
    return null;
  }
}
