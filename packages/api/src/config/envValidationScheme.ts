import Joi from "joi";

const envValidationScheme = Joi.object({
    PORT: Joi.number().required().default(3000),
    IS_DEV: Joi.boolean(),
    IS_LOCAL_NETWORK_DEPLOY: Joi.boolean(),
    CLIENT_APP_URL: Joi.string().required(),
    CLIENT_APP_LOCAL_NETWORK_URL: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required(),
    // JWT_REFRESH_SECRET: Joi.string().required(),
    // JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required().default(5432),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
});

export default envValidationScheme;
