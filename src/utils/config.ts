import Joi from 'joi';
import { ServerConfig } from '../types';

const configSchema = Joi.object({
  database: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().port().default(3306),
    user: Joi.string().required(),
    password: Joi.string().required(),
    database: Joi.string().required(),
    ssl: Joi.boolean().default(false),
    connectionLimit: Joi.number().min(1).max(100).default(10),
    timeout: Joi.number().min(1000).default(60000)
  }).required(),
  
  features: Joi.object({
    fetch: Joi.boolean().default(true),
    create: Joi.boolean().default(false),
    update: Joi.boolean().default(false),
    delete: Joi.boolean().default(false)
  }).default({ fetch: true, create: false, update: false, delete: false }),
  
  security: Joi.object({
    allowedTables: Joi.array().items(Joi.string()).optional(),
    blockedTables: Joi.array().items(Joi.string()).default([]),
    maxRows: Joi.number().min(1).max(10000).default(1000),
    readOnly: Joi.boolean().default(true)
  }).default({}),
  
  logging: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    file: Joi.string().optional()
  }).default({ level: 'info' })
});

export function validateConfig(config: any): ServerConfig {
  const { error, value } = configSchema.validate(config, { 
    allowUnknown: false,
    stripUnknown: true
  });
  
  if (error) {
    throw new Error(`Configuration validation failed: ${error.details.map(d => d.message).join(', ')}`);
  }
  
  return value;
}

export function getDefaultConfig(): ServerConfig {
  return {
    database: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'test',
      ssl: process.env.MYSQL_SSL === 'true',
      connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10'),
      timeout: parseInt(process.env.MYSQL_TIMEOUT || '60000')
    },
    features: {
      fetch: true,
      create: process.env.MYSQL_ALLOW_CREATE === 'true',
      update: process.env.MYSQL_ALLOW_UPDATE === 'true',
      delete: process.env.MYSQL_ALLOW_DELETE === 'true'
    },
    security: {
      allowedTables: process.env.MYSQL_ALLOWED_TABLES?.split(','),
      blockedTables: process.env.MYSQL_BLOCKED_TABLES?.split(',') || [],
      maxRows: parseInt(process.env.MYSQL_MAX_ROWS || '1000'),
      readOnly: process.env.MYSQL_READ_ONLY !== 'false'
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      file: process.env.LOG_FILE
    }
  };
}