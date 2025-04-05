import Joi from 'joi';

export const configValidate = Joi.object({
  // App Configuration
  APP_PORT: Joi.number().required(),
  APP_BASE_URL: Joi.string().default('http://localhost'),

  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),

  // Database Configuration
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_LOGGING: Joi.boolean().required().default(false),
  DATABASE_SYNC: Joi.boolean().required().default(false),

  // Mailer Configuration
  MAILER_USER: Joi.string(),
  MAILER_PASSWORD: Joi.string(),
  MAILER_HOST: Joi.string(),
  MAILER_PORT: Joi.number(),

  // Minio Configuration
  MINIO_ENDPOINT: Joi.string(),
  MINIO_PORT: Joi.number(),
  MINIO_ACCESS_KEY: Joi.string(),
  MINIO_SECRET_KEY: Joi.string(),
});
