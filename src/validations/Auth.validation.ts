import { z } from 'zod';

const AuthValidation = {
  oneTimeSuperAdmin: z.object({
    email: z.string().email().toLowerCase(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  login: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string(),
  }),
  forgotPassword: z.object({
    email: z.string().email().toLowerCase(),
  }),
  verifyPasswordResetLink: z.object({
    token: z.string(),
    userId: z.string(),
  }),
  resetPassword: z.object({
    password: z.string().min(4),
    token: z.string(),
    userId: z.string(),
  }),
  changePassword: z.object({
    password: z.string().min(4),
  }),
  createAdmin: z.object({
    email: z.string().email().toLowerCase(),
    firstName: z.string(),
    lastName: z.string(),
    photoUrl: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
};

export type AuthValidationTypes = {
  [K in keyof typeof AuthValidation]: z.infer<(typeof AuthValidation)[K]>;
};

export default AuthValidation;
