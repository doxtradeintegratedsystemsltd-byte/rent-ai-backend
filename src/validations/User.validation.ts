import { z } from 'zod';
import { AnalysisPeriod } from '../utils/analytics';

const UserValidation = {
  getDashboardAnalytics: z.object({
    period: z.nativeEnum(AnalysisPeriod),
  }),
};

export type UserValidationTypes = {
  [K in keyof typeof UserValidation]: z.infer<(typeof UserValidation)[K]>;
};

export default UserValidation;
