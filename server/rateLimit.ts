/* eslint-disable @typescript-eslint/no-explicit-any */
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { HttpStatusCode } from './types/http-status.types';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

const redisClient = new Redis(redisUrl);

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // 100 requests per windowMs

const isPermanentlyBlocked = async (ip: string): Promise<boolean> => {
  const result = await redisClient.get(`permanent-block:${ip}`);
  return !!result;
};

// Using 'call' method from ioredis for compatibility
const sendCommand = (command: string, ...args: (string | number | Buffer)[]): Promise<any> => {
  console.log(`Sending command to Redis: ${command} ${args.join(' ')}`);
  return redisClient.call(command, ...args);
};

const globalRateLimiter: RateLimitRequestHandler = rateLimit({
  store: new RedisStore({
    sendCommand,
  }),
  windowMs,
  max: maxRequests,
  handler: async (req: Request, res: Response) => {
    const ip = req.ip || '';
    if (await isPermanentlyBlocked(ip)) {
      res.status(HttpStatusCode.FORBIDDEN).json({
        data: [],
        error: 'Your IP is permanently blocked.',
        status: HttpStatusCode.FORBIDDEN,
        method: req.method,
        responseHandler: 'permanentBlock',
      });
    } else {
      res.status(HttpStatusCode.TOO_MANY_REQUESTS).json({
        data: [],
        error: 'Too many requests, please try again later.',
        status: HttpStatusCode.TOO_MANY_REQUESTS,
        method: req.method,
        responseHandler: 'globalRateLimiter',
      });
    }
  },
  skip: () => process.env.NODE_ENV === 'development',
});

const createCustomRateLimiter = (options: {
  windowMs?: number;
  max?: number;
}): RateLimitRequestHandler => {
  return rateLimit({
    store: new RedisStore({
      sendCommand,
    }),
    windowMs: options.windowMs || windowMs,
    max: options.max || maxRequests,
    handler: async (req: Request, res: Response) => {
      const ip = req.ip || '';
      if (await isPermanentlyBlocked(ip)) {
        res.status(HttpStatusCode.FORBIDDEN).json({
          data: [],
          error: 'Your IP is permanently blocked.',
          status: HttpStatusCode.FORBIDDEN,
          method: req.method,
          responseHandler: 'permanentBlock',
        });
      } else {
        res.status(HttpStatusCode.TOO_MANY_REQUESTS).json({
          data: [],
          error: 'Too many requests, please try again later.',
          status: HttpStatusCode.TOO_MANY_REQUESTS,
          method: req.method,
          responseHandler: 'customRateLimiter',
        });
      }
    },
    skip: () => process.env.NODE_ENV === 'development',
  });
};

export { globalRateLimiter, createCustomRateLimiter, redisClient };
