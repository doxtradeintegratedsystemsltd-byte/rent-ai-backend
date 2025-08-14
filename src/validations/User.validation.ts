import { z } from 'zod';
import { AnalysisPeriod } from '../utils/analytics';

const UserValidation = {
  getDashboardAnalytics: z.object({
    period: z.nativeEnum(AnalysisPeriod),
  }),
  updateProfile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().toLowerCase().optional(),
    phoneNumber: z.string().optional().nullable(),
    photoUrl: z.string().optional().nullable(),
  }),
};

export type UserValidationTypes = {
  [K in keyof typeof UserValidation]: z.infer<(typeof UserValidation)[K]>;
};

export default UserValidation;
