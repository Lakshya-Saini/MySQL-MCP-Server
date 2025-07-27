import winston from 'winston';
import path from 'path';

export class Logger {
  private static instance: winston.Logger;

  public static getInstance(config?: { level?: string; file?: string }): winston.Logger {
    if (!Logger.instance) {
      const logLevel = config?.level || 'info';
      const logFile = config?.file;

      const transports: winston.transport[] = [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          )
        })
      ];

      if (logFile) {
        transports.push(
          new winston.transports.File({
            filename: path.resolve(logFile),
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            )
          })
        );
      }

      Logger.instance = winston.createLogger({
        level: logLevel,
        transports,
        exceptionHandlers: transports,
        rejectionHandlers: transports
      });
    }

    return Logger.instance;
  }

  public static logQuery(query: string, params?: any[], executionTime?: number): void {
    const logger = Logger.getInstance();
    logger.debug('SQL Query Executed', {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      executionTime: executionTime ? `${executionTime}ms` : undefined
    });
  }

  public static logError(error: Error, context?: string): void {
    const logger = Logger.getInstance();
    logger.error('Error occurred', {
      context,
      error: error.message,
      stack: error.stack
    });
  }

  public static logSecurity(event: string, details?: any): void {
    const logger = Logger.getInstance();
    logger.warn('Security Event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }
}