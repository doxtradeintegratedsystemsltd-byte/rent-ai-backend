import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';

const Validator =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req[source]);
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({
          status: 'error',
          message: 'Validation Error',
          path: source,
          errors: error.errors.map((err) => ({
            message: err.message,
            field: err.path.join('.'),
          })),
        });
      } else {
        next(error);
      }
    }
  };

export default Validator;
