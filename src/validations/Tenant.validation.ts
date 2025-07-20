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
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    propertyId: z.string(),
    rentAmount: z.number(),
    rentStatus: z.enum(['paid', 'unPaid']),
    paymentReceipt: z.string().optional(),
  }),
};

export type TenantValidationTypes = {
  [K in keyof typeof TenantValidation]: z.infer<(typeof TenantValidation)[K]>;
};

export default TenantValidation;
