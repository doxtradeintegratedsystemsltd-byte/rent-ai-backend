import { z } from 'zod';

const UserValidation = {
  create: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
    levelOfEducation: z.string(),
  }),
};

export type UserValidationTypes = {
  [K in keyof typeof UserValidation]: z.infer<(typeof UserValidation)[K]>;
};

export default UserValidation;
