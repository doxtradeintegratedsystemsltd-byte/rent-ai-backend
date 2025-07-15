import { z } from 'zod';

const LeaseValidation = {
  create: z.object({
    tenantId: z.string(),
    propertyId: z.string(),
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)),
    rentAmount: z.number(),
    rentStatus: z.enum(['paid', 'unpaid']),
  }),
};

export type LeaseValidationTypes = {
  [K in keyof typeof LeaseValidation]: z.infer<(typeof LeaseValidation)[K]>;
};

export default LeaseValidation;
