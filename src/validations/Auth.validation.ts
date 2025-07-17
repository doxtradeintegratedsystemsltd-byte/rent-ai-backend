import { z } from 'zod';

const AuthValidation = {
  oneTimeSuperAdmin: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
  createAdmin: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
};

export type AuthValidationTypes = {
  [K in keyof typeof AuthValidation]: z.infer<(typeof AuthValidation)[K]>;
};

export default AuthValidation;
