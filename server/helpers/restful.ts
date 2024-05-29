import { Request, Response } from 'express';

import { logger } from '../logger';
import { Handlers, ErrorResponse } from '../types/restful.types';

import { responseHandler } from './restful.response';

/**
 * References:
 * - RFC-2616, 10.4.6 405 Method Not Allowed: https://tools.ietf.org/html/rfc2616#page-66
 * - Express.js Request Method Documentation: http://expressjs.com/en/5x/api.html#req.method
 */
const handleCatchError = (err: unknown, req: Request, res: Response) => {
  if (err instanceof Error) {
    logger.error(`Error Log: Middleware error on ${req.method} ${req.originalUrl} - ${err.message}`);

    const errorResponse: ErrorResponse = {
      data: [],
      error: err.message || 'Internal Server Error: Middleware Error',
      status: res.statusCode || 500,
      method: req.method,
      responseHandler: 'executeMiddleware',
    };

    responseHandler(req, res, errorResponse);
  } else {
    logger.error(`Error Log: Middleware error on ${req.method} ${req.originalUrl} - ${String(err)}`);

    const errorResponse: ErrorResponse = {
      data: [],
      error: 'Internal Server Error: Middleware Error',
      status: res.statusCode || 500,
      method: req.method,
      responseHandler: 'executeMiddleware',
    };

    responseHandler(req, res, errorResponse);
  }
};

export const restful = async (req: Request, res: Response, handlers: Handlers) => {
  const method = (req.method || '').toLowerCase();

  // Log each access
  logger.info(`Access Log: ${req.method} ${req.originalUrl}`);

  // Check if the method is supported
  if (!(method in handlers)) {
    res.set('Allow', Object.keys(handlers).join(', ').toUpperCase());
    res.sendStatus(405);
    logger.error(`Error Log: Method ${req.method} not allowed for ${req.originalUrl}`);
    return;
  }

  const { handler, middleware = [] } = handlers[method];

  // Function to execute middleware in sequence
  const executeMiddleware = async (index: number) => {
    if (index < middleware.length) {
      try {
        await middleware[index](req, res, (err: unknown) => {
          if (err) {
            throw err;
          }
          executeMiddleware(index + 1);
        });
      } catch (err) {
        handleCatchError(err, req, res);
      }
    } else {
      // All middleware executed successfully, proceed to handler
      executeHandler();
    }
  };

  // Function to execute the main handler
  const executeHandler = async () => {
    try {
      await handler(req, res);
    } catch (err) {
      handleCatchError(err, req, res);
    }
  };

  // Start the middleware chain
  executeMiddleware(0);
};
