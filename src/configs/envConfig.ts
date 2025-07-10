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
    // DB_USERNAME: Joi.string().required(),
    // DB_PASSWORD: Joi.string(),
    // DB_HOST: Joi.string().required(),
    // DB_NAME: Joi.string().required(),
    // DB_PORT: Joi.number().required(),
    // JWT_SECRET: Joi.string().required(),
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
};

export default envConfig;
