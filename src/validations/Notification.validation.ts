import { z } from 'zod';

const NotificationValidation = {};

export type NotificationValidationTypes = {
  [K in keyof typeof NotificationValidation]: z.infer<
    (typeof NotificationValidation)[K]
  >;
};

export default NotificationValidation;
