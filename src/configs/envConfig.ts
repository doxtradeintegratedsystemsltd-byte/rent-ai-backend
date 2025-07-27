import Joi from 'joi';
import dotenv from 'dotenv';
dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .optional()
      .valid('development', 'production')
      .default('development'),
    PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().optional().allow(''),
    DB_HOST: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    JWT_SECRET: Joi.string().required(),
    PASSWORD_SALT_ROUNDS: Joi.number().required(),
    CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    CLOUDINARY_API_KEY: Joi.string().required(),
    CLOUDINARY_API_SECRET: Joi.string().required(),
    RUN_JOBS: Joi.boolean().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envConfig = {
  NODE_ENV: envVars.NODE_ENV as string,
  PORT: envVars.PORT as number,
  DB_USERNAME: envVars.DB_USERNAME as string,
  DB_PASSWORD: envVars.DB_PASSWORD as string,
  DB_HOST: envVars.DB_HOST as string,
  DB_NAME: envVars.DB_NAME as string,
  DB_PORT: envVars.DB_PORT as number,
  JWT_SECRET: envVars.JWT_SECRET as string,
  PASSWORD_SALT_ROUNDS: envVars.PASSWORD_SALT_ROUNDS as number,
  CLOUDINARY_CLOUD_NAME: envVars.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: envVars.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: envVars.CLOUDINARY_API_SECRET as string,
  RUN_JOBS: envVars.RUN_JOBS as boolean,
};

export default envConfig;
