import { z } from 'zod';

const LeaseValidation = {
  createLeasePayment: z.object({
    leaseId: z.string(),
    leaseCycles: z.number(),
    paymentReceipt: z.string().optional(),
    paymentDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional(),
  }),
};

export type LeaseValidationTypes = {
  [K in keyof typeof LeaseValidation]: z.infer<(typeof LeaseValidation)[K]>;
};

export default LeaseValidation;
