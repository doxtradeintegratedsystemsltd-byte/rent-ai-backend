import { z } from 'zod';

const TenantValidation = {
  create: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email().toLowerCase(),
    photoUrl: z.string().optional(),
    phoneNumber: z.string(),
    levelOfEducation: z.string().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    leaseCycles: z.number().positive(),
    propertyId: z.string(),
    paymentReceipt: z.string(),
  }),
  update: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().toLowerCase().optional(),
    photoUrl: z.string().optional(),
    phoneNumber: z.string().optional(),
    levelOfEducation: z.string().optional(),
  }),
};

export type TenantValidationTypes = {
  [K in keyof typeof TenantValidation]: z.infer<(typeof TenantValidation)[K]>;
};

export default TenantValidation;
