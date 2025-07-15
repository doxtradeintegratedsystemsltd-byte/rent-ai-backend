import { z } from 'zod';

const AuthValidation = {
  oneTimeSuperAdmin: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().optional(),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
};

export type AuthValidationTypes = {
  [K in keyof typeof AuthValidation]: z.infer<(typeof AuthValidation)[K]>;
};

export default AuthValidation;
