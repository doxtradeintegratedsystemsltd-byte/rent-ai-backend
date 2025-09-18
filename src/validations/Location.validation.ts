import { z } from 'zod';

const LocationValidation = {
  create: z.object({
    name: z.string().min(1, 'Location name is required'),
  }),
  update: z.object({
    name: z.string().min(1, 'Location name is required').optional(),
  }),
};

export type LocationValidationTypes = {
  [K in keyof typeof LocationValidation]: z.infer<
    (typeof LocationValidation)[K]
  >;
};

export default LocationValidation;
