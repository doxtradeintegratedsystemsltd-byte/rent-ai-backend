import { z } from 'zod';

const AppErrorLogValidation = {
  create: z.object({
    type: z.string().optional(),
    message: z.string().optional(),
    file: z.string().optional(),
    func: z.string().optional(),
    data: z.record(z.any()).optional(),
  }),
};

export type AppErrorLogValidationTypes = {
  [K in keyof typeof AppErrorLogValidation]: z.infer<
    (typeof AppErrorLogValidation)[K]
  >;
};

export default AppErrorLogValidation;
