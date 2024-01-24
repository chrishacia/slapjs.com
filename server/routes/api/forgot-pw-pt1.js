const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');

module.exports = function forgotPwPt1Handler(req, res) {
  restful(req, res, {
    get() {
      invalidUseLogger('forgotPwPt1Handler', 'GET', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    put() {
      invalidUseLogger('forgotPwPt1Handler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    delete() {
      invalidUseLogger('forgotPwPt1Handler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    post() {
      // code here for get request
      logger.info('forgotPwPt1Handler', 'POST', null);
    },
  });
};
