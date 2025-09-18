import { z } from 'zod';

const PropertyValidation = {
  create: z.object({
    propertyName: z.string(),
    propertyState: z.string().optional(),
    propertyArea: z.string().optional(),
    propertyAddress: z.string().optional(),
    propertyImage: z.string().optional(),
    leaseYears: z.number().positive(),
    rentAmount: z.number().positive(),
    adminId: z.string().optional(),
    locationId: z.string().optional(),
  }),
  update: z.object({
    propertyName: z.string().optional(),
    propertyState: z.string().optional(),
    propertyArea: z.string().optional(),
    propertyAddress: z.string().optional(),
    propertyImage: z.string().optional(),
    leaseYears: z.number().positive().optional(),
    rentAmount: z.number().positive().optional(),
    locationId: z.string().optional(),
  }),
};

export type PropertyValidationTypes = {
  [K in keyof typeof PropertyValidation]: z.infer<
    (typeof PropertyValidation)[K]
  >;
};

export default PropertyValidation;
