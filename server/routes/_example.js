const restful = require('../helpers/restful');
const { logger, invalidUseLogger } = require('../logger');

module.exports = function exampleHandler(req, res) {
  restful(req, res, {
    async get() {
      invalidUseLogger('exampleHandler', 'GET', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async put() {
      invalidUseLogger('exampleHandler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async delete() {
      invalidUseLogger('exampleHandler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async post() {
      // code here for post request
      // res.status(400).json({ data: [], error: 'SOME_CONST_STYLE_DEF' });
      // res.status(200).json({ data: ['some', 'type', 'of', 'data'], error: '' });
      logger.error('ERROR data for logs');
      logger.info('exampleHandler', 'POST', req);
    },
  });
};
