import { z } from 'zod';

const TenantValidation = {
  create: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email().toLowerCase(),
    phoneNumber: z.string(),
    levelOfEducation: z.string().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    noOfYears: z.number().positive(),
    propertyId: z.string(),
    rentAmount: z.number().positive().optional(),
    paymentReceipt: z.string(),
  }),
};

export type TenantValidationTypes = {
  [K in keyof typeof TenantValidation]: z.infer<(typeof TenantValidation)[K]>;
};

export default TenantValidation;
