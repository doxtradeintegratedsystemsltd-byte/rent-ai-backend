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
