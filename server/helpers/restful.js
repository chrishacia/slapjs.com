const { logger } = require('../logger');
const { responseHandler } = require('./restful.response');
/**
 * References:
 * - RFC-2616, 10.4.6 405 Method Not Allowed: https://tools.ietf.org/html/rfc2616#page-66
 * - Express.js Request Method Documentation: http://expressjs.com/en/5x/api.html#req.method
 */

const restful = async (req, res, handlers) => {
    const method = (req.method || '').toLowerCase();

    // Log each access
    logger.log(`Access Log: ${req.method} ${req.originalUrl}`);

    // Check if the method is supported
    if (!(method in handlers)) {
        res.set('Allow', Object.keys(handlers).join(', ').toUpperCase());
        res.sendStatus(405);
        logger.error(`Error Log: Method ${req.method} not allowed for ${req.originalUrl}`);
        return;
    }

    const { handler, middleware = [] } = handlers[method];

    // Function to execute middleware in sequence
    const executeMiddleware = async (index) => {
        if (index < middleware.length) {
            try {
                await middleware[index](req, res, (err) => {
                    if (err) {
                        throw err;
                    }
                    executeMiddleware(index + 1);
                });
            } catch (err) {
                logger.error(`Error Log: Middleware error on ${req.method} ${req.originalUrl} - ${err.message}`);

                responseHandler(res,
                    {
                        data: [],
                        error: err.message || 'Internal Server Error: Middleware Error',
                        status: err.status || 500,
                        method: req.method,
                        responseHandler: 'executeMiddleware',
                    })
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
            logger.error(`Error Log: Handler error on ${req.method} ${req.originalUrl} - ${err.message}`);
            responseHandler(res,
                {
                    data: [],
                    error: err.message || 'Internal Server Error: Handler Error',
                    status: err.status || 500,
                    method: req.method,
                    responseHandler: 'executeHandler',
                })
        }
    };

    // Start the middleware chain
    executeMiddleware(0);
};
module.exports = restful;
