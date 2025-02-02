import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string()
    .valid('development', 'stage', 'production')
    .default('development'),
  API_KEY: Joi.string().required(),
  MAILERSEND_API_KEY: Joi.string().required(),
  MAILERSEND_API_URL: Joi.string().required(),
  MAILERSEND_DOMAIN: Joi.string().required(),
  HTTP_TIMEOUT: Joi.number().default(5000),
  MAX_REDIRECTS: Joi.number().default(5),
  COINGECKO_API_URL: Joi.string().required(),
});
