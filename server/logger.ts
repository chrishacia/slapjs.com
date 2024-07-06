import { Request } from 'express';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.SERVER_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
  }));
}

const invalidUseLogger = (routeHandlerName: string, routeHandlerMethod: string, req: Request): void => {
  const userId = req.body?.userId || 'Undetected';
  const clientIp = req.ip || req.connection.remoteAddress; // IP of the client
  const userAgent = req.get('User-Agent'); // User agent of the client
  const timestamp = new Date().toISOString();

  const message = `UserID: ${userId}, IP: ${clientIp}, Timestamp: ${timestamp}, User-Agent: ${userAgent} --- Invalid use of ${routeHandlerName} in ${routeHandlerMethod} method`;
  logger.error(message);
};

export {
  logger,
  invalidUseLogger,
};
